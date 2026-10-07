import { NextResponse } from "next/server";

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || "https://admin.minimore.my";
const auth = `Basic ${Buffer.from(`${process.env.MINIMORE_CONSUMER_KEY || ""}:${process.env.MINIMORE_SECRET || ""}`).toString("base64")}`;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.orderKey !== "string") return NextResponse.json({ error: "Order verification required" }, { status: 401 });

  const response = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${id}`, { headers: { Authorization: auth }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  const order = await response.json();
  if (order.order_key !== body.orderKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    number: String(order.number),
    total: String(order.total),
    paymentMethod: String(order.payment_method),
    status: String(order.status),
    paid: Boolean(order.date_paid) || ["processing", "completed"].includes(order.status),
  });
}
