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
// Billplz sends the user back here with query params after payment.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Params we set on the redirect_url when creating the bill
  const orderId = searchParams.get('order_id');
  const number = searchParams.get('number');
  const total = searchParams.get('total');
  const method = searchParams.get('method') || 'billplz';

  // Billplz also appends: billplz[id], billplz[paid], billplz[paid_at], billplz[x_signature]
  const paid = searchParams.get('billplz[paid]') ?? searchParams.get('paid') ?? 'false';

  if (orderId) {
    const url = `/order-confirmation/${orderId}?number=${number}&total=${total}&method=${method}&paid=${paid}`;
    return NextResponse.redirect(new URL(url, SITE_URL));
  }

  // Fallback
  return NextResponse.redirect(new URL('/', SITE_URL));
}
