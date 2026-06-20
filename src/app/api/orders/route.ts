import { NextResponse } from "next/server";
import { wooApi } from "@/lib/woocommerce";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customer_id");

    if (!customerId) {
      return NextResponse.json({ error: "Missing customer ID" }, { status: 400 });
    }

    const response = await wooApi.get("orders", { customer: customerId });
    return NextResponse.json({ orders: response.data });
    
  } catch (error: any) {
    console.error("Fetch orders error:", error?.response?.data || error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
