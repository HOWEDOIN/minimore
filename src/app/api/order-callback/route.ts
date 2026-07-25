import { NextRequest, NextResponse } from 'next/server';

// Billplz sends the user back here after payment (via the redirect_url set on the bill)
// URL params: billplz[id], billplz[paid], billplz[paid_at], billplz[x_signature]
// We simply read the order id from WooCommerce and redirect to our confirmation page.

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my';
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Billplz appends params under billplz[...] keys
  const billplzId = searchParams.get('billplz[id]');
  const paid = searchParams.get('billplz[paid]');
  const orderId = searchParams.get('order_id');

  // If we have a direct order_id (from WC order-received redirect), use it
  if (orderId) {
    const url = `/order-confirmation/${orderId}?paid=${paid || 'false'}`;
    return NextResponse.redirect(new URL(url, req.url));
  }

  // If we have a Billplz bill ID, look up the order
  if (billplzId) {
    try {
      const authHeader =
        'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

      // Search WC orders by the billplz transaction ID
      const wcRes = await fetch(
        `${WP_URL}/wp-json/wc/v3/orders?transaction_id=${billplzId}&per_page=1`,
        { headers: { Authorization: authHeader } }
      );

      if (wcRes.ok) {
        const orders = await wcRes.json();
        if (orders.length > 0) {
          const order = orders[0];
          const url = `/order-confirmation/${order.id}?number=${order.number}&total=${order.total}&paid=${paid || 'false'}`;
          return NextResponse.redirect(new URL(url, req.url));
        }
      }
    } catch {
      // fall through to generic confirmation
    }
  }

  // Fallback: go to homepage
  return NextResponse.redirect(new URL('/', req.url));
}
