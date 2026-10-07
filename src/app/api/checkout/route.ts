import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rateLimit";
import { shippingFor, validateCheckoutBody } from "@/lib/checkoutValidation";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://minimore.my";
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || "";
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || "";
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY;
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID;
const authHeader = `Basic ${Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64")}`;

export async function POST(req: NextRequest) {
  try {
    const localTest = process.env.NODE_ENV === "development";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (!localTest && !rateLimit(`checkout:${ip}`, 5, 15 * 60_000)) return NextResponse.json({ error: "Too many checkout attempts. Please try again later." }, { status: 429 });
    if (Number(req.headers.get("content-length") || 0) > 20_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });

    const sitewide = await fetch(`${WP_URL}/wp-json/minimore/v1/sitewide`, { cache: "no-store" });
    const settings = sitewide.ok ? await sitewide.json() : null;
    if (!localTest && (!settings || settings.disable_checkout !== false)) return NextResponse.json({ error: "Checkout is temporarily disabled." }, { status: 503 });

    const raw = await req.text();
    if (raw.length > 20_000) return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    const body = validateCheckoutBody(JSON.parse(raw));
    if (!body) return NextResponse.json({ error: "Invalid checkout details." }, { status: 400 });

    const ids = [...new Set(body.cartItems.map((item) => Number(item.variantId)))];
    const productsRes = await fetch(`${WP_URL}/wp-json/wc/v3/products?include=${ids.join(",")}&per_page=50`, { headers: { Authorization: authHeader }, cache: "no-store" });
    if (!productsRes.ok) return NextResponse.json({ error: "Unable to validate cart." }, { status: 502 });
    type StockProduct = { id: number; stock_status: string; manage_stock: boolean; stock_quantity: number | null };
    const products = await productsRes.json() as StockProduct[];
    const productMap = new Map<number, StockProduct>(products.map((product) => [product.id, product]));
    const available = body.cartItems.every((item) => {
      const product = productMap.get(Number(item.variantId));
      return product?.stock_status === "instock" && (!product.manage_stock || (product.stock_quantity ?? 0) >= item.quantity);
    });
    if (!available) return NextResponse.json({ error: "One or more products are unavailable in the requested quantity." }, { status: 409 });

    const shippingTotal = shippingFor(body.shipping.state, Boolean(settings?.free_shipping)).toFixed(2);
    if (localTest) return NextResponse.json({ testMode: true, shippingTotal });
    if (!BILLPLZ_API_KEY || !BILLPLZ_COLLECTION_ID) return NextResponse.json({ error: "Payment is not configured." }, { status: 503 });

    const billing = body.billing || body.shipping;
    const east = ["Sabah", "Sarawak", "Labuan"].includes(body.shipping.state);
    const orderPayload = {
      payment_method: "billplz", payment_method_title: "Billplz", set_paid: false, status: "pending",
      billing: { first_name: billing.firstName, last_name: billing.lastName, address_1: billing.address1, address_2: billing.address2 || "", city: billing.city, state: billing.state, postcode: billing.postcode, country: "MY", email: body.contact.email, phone: body.contact.phone || "" },
      shipping: { first_name: body.shipping.firstName, last_name: body.shipping.lastName, address_1: body.shipping.address1, address_2: body.shipping.address2 || "", city: body.shipping.city, state: body.shipping.state, postcode: body.shipping.postcode, country: "MY" },
      line_items: body.cartItems.map((item) => ({ product_id: Number(item.variantId), quantity: item.quantity })),
      shipping_lines: [{ method_id: "flat_rate", method_title: Number(shippingTotal) === 0 ? "Free Shipping" : `${east ? "East" : "West"} Malaysia Shipping`, total: shippingTotal }],
    };

    const wcRes = await fetch(`${WP_URL}/wp-json/wc/v3/orders`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: authHeader }, body: JSON.stringify(orderPayload) });
    if (!wcRes.ok) {
      console.error("WooCommerce order creation failed:", await wcRes.text());
      return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 502 });
    }
    const order = await wcRes.json();

    const billParams = new URLSearchParams({ collection_id: BILLPLZ_COLLECTION_ID, description: `Minimore Order #${order.number}`, email: body.contact.email, name: `${body.shipping.firstName} ${body.shipping.lastName}`.trim(), amount: String(Math.round(Number(order.total) * 100)), callback_url: `${SITE_URL}/api/order-callback`, redirect_url: `${SITE_URL}/api/order-callback`, reference_1_label: "Order", reference_1: String(order.number) });
    if (body.contact.phone) billParams.set("mobile", body.contact.phone);
    const billRes = await fetch("https://www.billplz.com/api/v3/bills", { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${BILLPLZ_API_KEY}:`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" }, body: billParams.toString() });
    if (!billRes.ok) {
      console.error("Billplz bill creation failed:", await billRes.text());
      await fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: authHeader }, body: JSON.stringify({ status: "cancelled" }) });
      return NextResponse.json({ error: "Failed to create payment bill. Please try again." }, { status: 502 });
    }
    const bill = await billRes.json();
    const update = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: authHeader }, body: JSON.stringify({ transaction_id: bill.id }) });
    if (!update.ok) return NextResponse.json({ error: "Payment setup failed. Please contact support." }, { status: 502 });

    return NextResponse.json({ orderId: order.id, orderKey: order.order_key, paymentUrl: bill.url });
  } catch (error) {
    console.error("Checkout API error:", error);
    return NextResponse.json({ error: "Invalid checkout request." }, { status: 400 });
  }
}
