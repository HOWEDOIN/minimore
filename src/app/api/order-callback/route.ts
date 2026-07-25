import { NextRequest, NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minimore.my';
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || '';

const wcAuth = () =>
  'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

// ─── SERVER-SIDE WEBHOOK (POST) ───────────────────────────────────────────────
// Billplz posts payment confirmation here. We mark the WooCommerce order as paid.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const billplzId = form.get('billplz[id]') as string;
    const paid = form.get('billplz[paid]') as string;

    if (!billplzId || paid !== 'true') {
      return NextResponse.json({ ok: false });
    }

    // Find the WooCommerce order by the Billplz bill ID (stored as transaction_id)
    const searchRes = await fetch(
      `${WP_URL}/wp-json/wc/v3/orders?transaction_id=${billplzId}&per_page=1`,
      { headers: { Authorization: wcAuth() } }
    );

    if (searchRes.ok) {
      const orders = await searchRes.json();
      if (orders.length > 0) {
        const order = orders[0];
        // Mark as processing (paid)
        await fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: wcAuth() },
          body: JSON.stringify({ status: 'processing', set_paid: true }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Billplz webhook error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// ─── BROWSER REDIRECT (GET) ───────────────────────────────────────────────────
// Billplz redirects users back here after payment (both success and cancel/fail).
// Billplz appends:  billplz[id], billplz[paid], billplz[paid_at], billplz[x_signature]
// Note: URL brackets get encoded as %5B %5D by some browsers, so we check both forms.
export async function GET(req: NextRequest) {
  try {
    const rawUrl = req.url;
    const { searchParams } = new URL(rawUrl);

    // Params we encoded into the redirect_url when creating the bill
    const orderId = searchParams.get('order_id');
    const number  = searchParams.get('number');
    const total   = searchParams.get('total');
    const method  = searchParams.get('method') || 'billplz';

    // Billplz appends billplz[paid] — handle both encoded (%5B%5D) and literal [] forms
    const paid =
      searchParams.get('billplz[paid]') ??      // literal brackets (some clients)
      searchParams.get('billplz%5Bpaid%5D') ??  // URL-encoded brackets
      searchParams.get('paid') ??               // our own fallback
      'false';

    if (orderId) {
      const confirmUrl = new URL(
        `/order-confirmation/${orderId}?number=${encodeURIComponent(number ?? '')}&total=${encodeURIComponent(total ?? '0')}&method=${method}&paid=${paid}`,
        SITE_URL
      );
      return NextResponse.redirect(confirmUrl);
    }

    // If somehow order_id is missing (e.g. Billplz stripped params on cancel),
    // redirect to the homepage with a cancelled notice instead of a blank 404.
    return NextResponse.redirect(new URL('/?payment=cancelled', SITE_URL));
  } catch (err) {
    console.error('Order callback GET error:', err);
    // Never show a raw 404 — always redirect somewhere sensible
    return NextResponse.redirect(new URL('/?payment=error', SITE_URL));
  }
}
