import { NextRequest, NextResponse } from "next/server";
import { verifyBillplzSignature } from "@/lib/billplz";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://minimore.my";
const auth = `Basic ${Buffer.from(`${process.env.MINIMORE_CONSUMER_KEY || ""}:${process.env.MINIMORE_SECRET || ""}`).toString("base64")}`;
const billplzKey = process.env.BILLPLZ_API_KEY;

type Order = { id: number; number: string; total: string; transaction_id?: string };

async function orderForBill(billId: string): Promise<Order | null> {
  const response = await fetch(`${WP_URL}/wp-json/wc/v3/orders?transaction_id=${encodeURIComponent(billId)}&per_page=1`, { headers: { Authorization: auth }, cache: "no-store" });
  if (!response.ok) return null;
  return (await response.json())[0] || null;
}

async function markPaid(order: Order, transactionId: string) {
  return fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: auth },
    body: JSON.stringify({ status: "processing", set_paid: true, transaction_id: transactionId }),
  });
}

async function billIsPaid(billId: string, expectedTotal: string) {
  if (!billplzKey) return false;
  const response = await fetch(`https://www.billplz.com/api/v3/bills/${encodeURIComponent(billId)}`, {
    headers: { Authorization: `Basic ${Buffer.from(`${billplzKey}:`).toString("base64")}` },
    cache: "no-store",
  });
  if (!response.ok) return false;
  const bill = await response.json() as { paid?: boolean; state?: string; amount?: number };
  return (bill.paid === true || bill.state === "paid") && bill.amount === Math.round(Number(expectedTotal) * 100);
}

export async function POST(req: NextRequest) {
  try {
    const params = new URLSearchParams(await req.text());
    if (!verifyBillplzSignature(params)) return NextResponse.json({ ok: false }, { status: 401 });
    const billId = params.get("id");
    const paid = params.get("paid") === "true" && params.get("state") === "paid";
    if (!billId || !paid) return NextResponse.json({ ok: true });

    const order = await orderForBill(billId);
    if (!order) return NextResponse.json({ ok: false }, { status: 404 });
    if (!await billIsPaid(billId, order.total)) return NextResponse.json({ ok: false }, { status: 400 });
    const updated = await markPaid(order, billId);
    return NextResponse.json({ ok: updated.ok }, { status: updated.ok ? 200 : 502 });
  } catch (error) {
    console.error("Billplz webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const params = new URL(req.url).searchParams;
    if (!verifyBillplzSignature(params)) return NextResponse.redirect(new URL("/?payment=invalid", SITE_URL));
    const billId = params.get("billplz[id]");
    const order = billId ? await orderForBill(billId) : null;
    if (!billId || !order) return NextResponse.redirect(new URL("/?payment=error", SITE_URL));

    if (params.get("billplz[paid]") === "true") {
      if (!await billIsPaid(billId, order.total)) return NextResponse.redirect(new URL("/?payment=invalid", SITE_URL));
      if (!(await markPaid(order, billId)).ok) return NextResponse.redirect(new URL("/?payment=error", SITE_URL));
    }
    return NextResponse.redirect(new URL(`/order-confirmation/${order.id}`, SITE_URL));
  } catch (error) {
    console.error("Billplz redirect error:", error);
    return NextResponse.redirect(new URL("/?payment=error", SITE_URL));
  }
}
