'use client';

import React, { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import './confirmation.css';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number') || params.id;
  const total = searchParams.get('total') || '0.00';
  const paid = searchParams.get('paid');
  const paymentMethod = searchParams.get('method') || 'billplz';

  // Clear cart on arrival (handles Billplz return where cart wasn't cleared pre-redirect)
  useEffect(() => {
    useCartStore.setState({ cart: [], isCartOpen: false });
  }, []);

  // Billplz sets paid=true when payment succeeds, false when cancelled/failed
  const isPaid = paid === 'true' || paid === null; // null = COD flow (always confirmed)
  const isBillplz = paymentMethod === 'billplz' || paid !== null;

  return (
    <div className="confirm-root">
      <header className="confirm-header">
        <a href="/" className="confirm-logo">Minimore</a>
      </header>

      <main className="confirm-main">
        <div className="confirm-card">
          {isPaid ? (
            <>
              <div className="confirm-icon">✓</div>
              <h1 className="confirm-title">Order confirmed!</h1>
              <p className="confirm-sub">
                {isBillplz
                  ? 'Your payment was successful. We've received your order and will begin processing it shortly.'
                  : 'Thank you for your order. We've received it and will begin processing it shortly.'}
              </p>
            </>
          ) : (
            <>
              <div className="confirm-icon" style={{ background: 'var(--confirm-warn, #f59e0b)' }}>!</div>
              <h1 className="confirm-title">Payment incomplete</h1>
              <p className="confirm-sub">
                It looks like your payment wasn't completed. Your order has been saved — you can try paying again or contact us if you need help.
              </p>
            </>
          )}

          <div className="confirm-detail-row">
            <span>Order number</span>
            <strong>#{orderNumber}</strong>
          </div>
          <div className="confirm-detail-row">
            <span>{isPaid ? 'Total paid' : 'Order total'}</span>
            <strong>RM {parseFloat(total).toFixed(2)}</strong>
          </div>
          <div className="confirm-detail-row">
            <span>Payment method</span>
            <strong>{isBillplz ? 'Billplz (Online Banking / FPX)' : 'Cash on Delivery'}</strong>
          </div>
          <div className="confirm-detail-row">
            <span>Status</span>
            <strong style={{ color: isPaid ? 'var(--confirm-success, #22c55e)' : 'var(--confirm-warn, #f59e0b)' }}>
              {isPaid ? 'Paid ✓' : 'Pending payment'}
            </strong>
          </div>

          <p className="confirm-note">
            {isPaid
              ? <>A confirmation email will be sent to you shortly. If you have any questions, feel free to{' '}<a href="mailto:hello@minimore.my">contact us</a>.</>
              : <>Need help? Feel free to{' '}<a href="mailto:hello@minimore.my">contact us</a> and we'll sort it out.</>
            }
          </p>

          <Link href="/" className="confirm-cta">Continue Shopping</Link>
        </div>
      </main>
    </div>
  );
}
