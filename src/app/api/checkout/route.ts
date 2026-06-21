import { NextRequest, NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my';
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { contact, shipping, billing, paymentMethod, cartItems } = body;

    // Build WooCommerce line items from cart
    const lineItems = cartItems.map((item: { variantId: string; quantity: number }) => ({
      product_id: parseInt(item.variantId),
      quantity: item.quantity,
    }));

    const orderPayload = {
      payment_method: paymentMethod || 'cod',
      payment_method_title: paymentMethod === 'billplz' ? 'Billplz' : 'Cash on Delivery',
      set_paid: false,
      status: 'pending',
      billing: {
        first_name: billing?.firstName || shipping.firstName,
        last_name: billing?.lastName || shipping.lastName,
        address_1: billing?.address1 || shipping.address1,
        address_2: billing?.address2 || shipping.address2 || '',
        city: billing?.city || shipping.city,
        state: billing?.state || shipping.state,
        postcode: billing?.postcode || shipping.postcode,
        country: billing?.country || shipping.country || 'MY',
        email: contact.email,
        phone: contact.phone || '',
      },
      shipping: {
        first_name: shipping.firstName,
        last_name: shipping.lastName,
        address_1: shipping.address1,
        address_2: shipping.address2 || '',
        city: shipping.city,
        state: shipping.state,
        postcode: shipping.postcode,
        country: shipping.country || 'MY',
      },
      line_items: lineItems,
      shipping_lines: [
        {
          method_id: 'free_shipping',
          method_title: 'Free Shipping',
          total: '0.00',
        },
      ],
    };

    const authHeader =
      'Basic ' + Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const wcRes = await fetch(`${WP_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!wcRes.ok) {
      const errBody = await wcRes.text();
      console.error('WooCommerce order creation failed:', errBody);
      return NextResponse.json(
        { error: 'Failed to create order. Please try again.' },
        { status: 500 }
      );
    }

    const order = await wcRes.json();

    return NextResponse.json({
      orderId: order.id,
      orderKey: order.order_key,
      orderNumber: order.number,
      total: order.total,
      currency: order.currency,
      paymentUrl: order.payment_url || null,
    });
  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
