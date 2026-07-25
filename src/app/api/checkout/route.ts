import { NextRequest, NextResponse } from 'next/server';

const WP_URL = process.env.NEXT_PUBLIC_WP_URL || 'https://admin.minimore.my';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://minimore.my';
const CONSUMER_KEY = process.env.MINIMORE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.MINIMORE_SECRET || '';
const BILLPLZ_API_KEY = process.env.BILLPLZ_API_KEY || '0cbbfbe9-33fc-4b84-8709-c70982e3c4c6';
const BILLPLZ_COLLECTION_ID = process.env.BILLPLZ_COLLECTION_ID || '3zkduq0j';

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

    // Step 1: Create the WooCommerce order
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

    // For COD: go straight to confirmation
    if (paymentMethod !== 'billplz') {
      return NextResponse.json({
        orderId: order.id,
        orderKey: order.order_key,
        orderNumber: order.number,
        total: order.total,
        currency: order.currency,
        paymentUrl: null,
        confirmUrl: `/order-confirmation/${order.id}?number=${order.number}&total=${order.total}&method=cod`,
      });
    }

    // Step 2: For Billplz — create a bill directly via Billplz API (bypasses WooCommerce order-pay page)
    const customerName = `${shipping.firstName} ${shipping.lastName}`.trim() || 'Customer';
    const amountCents = Math.round(parseFloat(order.total) * 100);
    const redirectUrl = `${SITE_URL}/api/order-callback?order_id=${order.id}&number=${order.number}&total=${order.total}&method=billplz`;
    const callbackUrl = `${SITE_URL}/api/order-callback`;

    const billParams = new URLSearchParams({
      collection_id: BILLPLZ_COLLECTION_ID,
      description: `Minimore Order #${order.number}`,
      email: contact.email,
      name: customerName,
      amount: String(amountCents),
      callback_url: callbackUrl,
      redirect_url: redirectUrl,
      'reference_1_label': 'Order',
      'reference_1': String(order.number),
    });
    if (contact.phone) billParams.set('mobile', contact.phone);

    const billplzAuth = 'Basic ' + Buffer.from(`${BILLPLZ_API_KEY}:`).toString('base64');
    const billRes = await fetch('https://www.billplz.com/api/v3/bills', {
      method: 'POST',
      headers: {
        Authorization: billplzAuth,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: billParams.toString(),
    });

    if (!billRes.ok) {
      const errBody = await billRes.text();
      console.error('Billplz bill creation failed:', errBody);
      return NextResponse.json(
        { error: 'Failed to create payment bill. Please try again.' },
        { status: 500 }
      );
    }

    const bill = await billRes.json();

    // Store the Billplz bill ID on the WooCommerce order as transaction ID for later lookup
    await fetch(`${WP_URL}/wp-json/wc/v3/orders/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify({ transaction_id: bill.id }),
    });

    return NextResponse.json({
      orderId: order.id,
      orderKey: order.order_key,
      orderNumber: order.number,
      total: order.total,
      currency: order.currency,
      paymentUrl: bill.url, // Direct Billplz-hosted payment page — clean, no WordPress UI
      confirmUrl: null,
    });
  } catch (err) {
    console.error('Checkout API error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
