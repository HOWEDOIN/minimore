import { NextRequest, NextResponse } from 'next/server';
import { verifyBillplzSignature } from '@/lib/billplz';

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

    if (!verifyBillplzSignature(searchParams)) {
      return NextResponse.redirect(new URL('/?payment=invalid', SITE_URL));
    }
    const billplzId = searchParams.get('billplz[id]');
    if (billplzId) {
      const orderRes = await fetch(`${WP_URL}/wp-json/wc/v3/orders?transaction_id=${encodeURIComponent(billplzId)}&per_page=1`, { headers: { Authorization: wcAuth() }, cache: 'no-store' });
      const order = orderRes.ok ? (await orderRes.json())[0] : null;
      if (order) return NextResponse.redirect(new URL(`/order-confirmation/${order.id}`, SITE_URL));
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
    if (!verifyBillplzSignature(new URLSearchParams(body))) {
      return new NextResponse('invalid signature', { status: 401 });
    }
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
