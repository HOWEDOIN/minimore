import { NextRequest, NextResponse } from "next/server";
import { clientIpFromForwardedFor, rateLimit } from "@/lib/rateLimit";
import { FREE_SHIPPING_THRESHOLD, isValidFreeShippingPromo, shippingFor, validateCheckoutBody } from "@/lib/checkoutValidation";
import { rekeyStockHold, releaseStockHold, StockProduct, tryReserveStock } from "@/lib/stockHold";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://minimore.my";
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || "";
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const authHeader = `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")}`;

type SitewideConfig = {
  disable_checkout?: boolean;
  free_shipping?: boolean;
  promo_codes?: string;
};

type WooCoupon = {
  code?: string;
  status?: string;
  free_shipping?: boolean;
  date_expires_gmt?: string | null;
  usage_limit?: number | null;
  usage_count?: number;
};

async function fetchSitewideConfig(): Promise<SitewideConfig | null> {
  try {
    const res = await fetch(`${WP_URL}/wp-json/minimore/v1/sitewide`, { cache: "no-store" });
    return res.ok ? await res.json() as SitewideConfig : null;
  } catch {
    return null;
  }
}

async function isPromoAccepted(code: string | null | undefined, settings: SitewideConfig | null): Promise<boolean> {
  const trimmed = code?.trim();
  if (!trimmed) return false;
  const wpPromoList = typeof settings?.promo_codes === "string" ? settings.promo_codes : undefined;
  if (isValidFreeShippingPromo(trimmed, wpPromoList)) return true;

  try {
    const couponRes = await fetch(`${WP_URL}/wp-json/wc/v3/coupons?code=${encodeURIComponent(trimmed)}`, {
      headers: { Authorization: authHeader },
      cache: "no-store",
    });
    if (!couponRes.ok) return false;
    const coupons = await couponRes.json() as WooCoupon[];
    if (!Array.isArray(coupons)) return false;
    const now = Date.now();
    return coupons.some((c) => {
      if ((c.code || "").trim().toLowerCase() !== trimmed.toLowerCase()) return false;
      if (c.status && c.status !== "publish") return false;
      if (!c.free_shipping) return false;
      if (c.date_expires_gmt && new Date(`${c.date_expires_gmt}Z`).getTime() <= now) return false;
      if (typeof c.usage_limit === "number" && (c.usage_count ?? 0) >= c.usage_limit) return false;
      return true;
    });
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("promo");
  const settings = await fetchSitewideConfig();
  return NextResponse.json({ valid: await isPromoAccepted(code, settings) });
}

export async function POST(req: NextRequest) {
  let activeHoldKey: string | null = null;
  try {
    const localTest = process.env.NODE_ENV === "development";
    const ip = clientIpFromForwardedFor(req.headers.get("x-forwarded-for"));
    if (!localTest && !rateLimit(`checkout:${ip}`, 5, 15 * 60_000)) return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
    if (Number(req.headers.get("content-length") || 0) > 20_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

    const settings = await fetchSitewideConfig();
    if (!localTest && (!settings || settings.disable_checkout !== false)) return NextResponse.json({ error: "Checkout is temporarily disabled." }, { status: 503 });

    const raw = await req.text();
    if (raw.length > 20_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    const body = validateCheckoutBody(JSON.parse(raw));
    if (!body) return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });

    const ids = [...new Set(body.cartItems.map((item) => Number(item.variantId)))];
    const productsRes = await fetch(`${WP_URL}/wp-json/wc/v3/products?include=${ids.join(",")}&per_page=50`, { headers: { Authorization: authHeader }, cache: "no-store" });
    if (!productsRes.ok) return NextResponse.json({ error: "Unable to validate cart." }, { status: 502 });
    const products = await productsRes.json() as StockProduct[];
    const holdKey = crypto.randomUUID();
    if (!tryReserveStock(holdKey, body.cartItems, products)) {
      return NextResponse.json({ error: "One or more products are unavailable in the requested quantity." }, { status: 409 });
    }
    activeHoldKey = holdKey;

    const productPriceMap = new Map<number, number>(
      products.map((p) => [p.id, parseFloat(String(p.price || p.regular_price || "0")) || 0])
    );
    const subtotal = body.cartItems.reduce(
      (sum, item) => sum + (productPriceMap.get(Number(item.variantId)) ?? 0) * item.quantity,
      0
    );
    const promoValid = await isPromoAccepted(body.promoCode, settings);
    const isFreeShipping = Boolean(settings?.free_shipping) || promoValid || subtotal >= FREE_SHIPPING_THRESHOLD;
    const shippingTotal = shippingFor(body.shipping.state, isFreeShipping, subtotal).toFixed(2);
    if (localTest) {
      releaseStockHold(activeHoldKey);
      return NextResponse.json({ testMode: true, shippingTotal });
    }
    if (!BILLPLZ_API_KEY || !BILLPLZ_COLLECTION_ID) {
      releaseStockHold(activeHoldKey);
      return NextResponse.json({ error: "Payment is not configured." }, { status: 503 });
    }

    const billing = body.billing || body.shipping;
    const east = ["Sabah", "Sarawak", "Labuan"].includes(body.shipping.state);
    const orderPayload = {
      payment_method: "billplz", payment_method_title: "Billplz", set_paid: false, status: "pending",
      billing: { first_name: billing.firstName, last_name: billing.lastName, address_1: billing.address1, address_2: billing.address2 || "", city: billing.city, state: billing.state, postcode: billing.postcode, country: "MY", email: body.contact.email, phone: body.contact.phone || "" },
      shipping: { first_name: body.shipping.firstName, last_name: body.shipping.lastName, address_1: body.shipping.address1, address_2: body.shipping.address2 || "", city: body.shipping.city, state: body.shipping.state, postcode: body.shipping.postcode, country: "MY" },
      line_items: body.cartItems.map((item) => ({ product_id: Number(item.variantId), quantity: item.quantity })),
      shipping_lines: [{ method_id: "flat_rate", method_title: Number(shippingTotal) === 0 ? (promoValid ? `Free Shipping (${body.promoCode})` : subtotal >= FREE_SHIPPING_THRESHOLD ? `Free Shipping (Orders RM${FREE_SHIPPING_THRESHOLD}+)` : "Free Shipping") : `${east ? "East" : "West"} Malaysia Shipping`, total: shippingTotal }],
      meta_data: promoValid && body.promoCode ? [{ key: "promo_code", value: body.promoCode }] : [],
    };

    const wcRes = await fetch(`${WP_URL}/wp-json/wc/v3/orders`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: authHeader }, body: JSON.stringify(orderPayload) });
    if (!wcRes.ok) {
      releaseStockHold(activeHoldKey);
      console.error("WooCommerce order creation failed:", await wcRes.text());
      return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 502 });
    }
    const order = await wcRes.json();

    const billParams = new URLSearchParams({ collection_id: BILLPLZ_COLLECTION_ID, description: `Minimore Order #${order.number}`, email: body.contact.email, name: `${body.shipping.firstName} ${body.shipping.lastName}`.trim(), amount: String(Math.round(Number(order.total) * 100)), callback_url: `${SITE_URL}/api/order-callback`, redirect_url: `${SITE_URL}/api/order-callback`, reference_1_label: "Order", reference_1: String(order.number) });
    if (body.contact.phone) billParams.set("mobile", body.contact.phone);
    const billRes = await fetch("https://www.billplz.com/api/v3/bills", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${BILLPLZ_API_KEY}:`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: billParams.toString() });
    if (!billRes.ok) {
      releaseStockHold(activeHoldKey);
      console.error("Billplz bill creation failed:", await billRes.text());
      await fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: authHeader }, body: JSON.stringify({ status: "cancelled" }) });
      return NextResponse.json({ error: "Failed to create payment bill. Please try again." }, { status: 502 });
    }
    const bill = await billRes.json();
    rekeyStockHold(activeHoldKey, String(bill.id));
    activeHoldKey = String(bill.id);
    const update = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: authHeader }, body: JSON.stringify({ transaction_id: bill.id }) });
    if (!update.ok) {
      releaseStockHold(activeHoldKey);
      return NextResponse.json({ error: "Payment setup failed. Please contact support." }, { status: 502 });
    }

    return NextResponse.json({ orderId: order.id, orderKey: order.order_key, paymentUrl: bill.url });
  } catch (error) {
    if (activeHoldKey) releaseStockHold(activeHoldKey);
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }
}
