import { NextRequest, NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minimore.my';
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || '';

const wcAuth = () =>
  'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

// ─── BROWSER REDIRECT (GET) ───────────────────────────────────────────────────
// The WooCommerce Billplz plugin sets its redirect_url to minimore.my/wc-api/WC_Billplz_Gateway/
// This intercepts that URL and redirects the user to our proper confirmation page.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const orderId = searchParams.get('order');
    // Billplz encodes brackets as %5B%5D — URLSearchParams decodes them automatically
    const paid =
      searchParams.get('billplz[paid]') ??
      searchParams.get('paid') ??
      'false';
    const billplzId = searchParams.get('billplz[id]');

    // If payment was successful, mark WooCommerce order as processing
    if (paid === 'true' && orderId) {
      try {
        await fetch(`${WP_URL}/wp-json/wc/v3/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: wcAuth() },
          body: JSON.stringify({ status: 'processing', set_paid: true, transaction_id: billplzId }),
        });
      } catch {
        // Non-fatal — still redirect the user
      }
    }

    if (orderId) {
      // Fetch order details from WooCommerce to get order number and total
      let number = orderId;
      let total = '0.00';
      try {
        const orderRes = await fetch(
          `${WP_URL}/wp-json/wc/v3/orders/${orderId}`,
          { headers: { Authorization: wcAuth() } }
        );
        if (orderRes.ok) {
          const order = await orderRes.json();
          number = order.number ?? orderId;
          total = order.total ?? '0.00';
        }
      } catch {
        // Non-fatal — use fallback values
      }

      const confirmUrl = new URL(
        `/order-confirmation/${orderId}?number=${encodeURIComponent(number)}&total=${encodeURIComponent(total)}&method=billplz&paid=${paid}`,
        SITE_URL
      );
      return NextResponse.redirect(confirmUrl);
    }

    // Fallback — no order ID found, go home
    return NextResponse.redirect(new URL('/?payment=cancelled', SITE_URL));
  } catch (err) {
    console.error('WC Billplz gateway redirect error:', err);
    return NextResponse.redirect(new URL('/?payment=error', SITE_URL));
  }
}

// ─── SERVER WEBHOOK (POST) ────────────────────────────────────────────────────
// The WooCommerce Billplz plugin also sets its callback_url here.
// Proxy it through to the WordPress backend so WooCommerce can process the payment.
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const { search } = new URL(req.url);

    const wpRes = await fetch(
      `${WP_URL}/wc-api/WC_Billplz_Gateway/${search}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      }
    );

    return new NextResponse(await wpRes.text(), {
      status: wpRes.status,
    });
  } catch (err) {
    console.error('WC Billplz gateway webhook proxy error:', err);
    return new NextResponse('ok', { status: 200 });
  }
}
