'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import './confirmation.css';

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('number') || params.id;
  const total = searchParams.get('total') || '0.00';

  return (
    <div className="confirm-root">
      <header className="confirm-header">
        <a href="/" className="confirm-logo">Minimore</a>
      </header>

      <main className="confirm-main">
        <div className="confirm-card">
          <div className="confirm-icon">✓</div>
          <h1 className="confirm-title">Order confirmed!</h1>
          <p className="confirm-sub">
            Thank you for your order. We've received it and will begin processing it shortly.
          </p>

          <div className="confirm-detail-row">
            <span>Order number</span>
            <strong>#{orderNumber}</strong>
          </div>
          <div className="confirm-detail-row">
            <span>Total paid</span>
            <strong>RM {parseFloat(total).toFixed(2)}</strong>
          </div>
          <div className="confirm-detail-row">
            <span>Payment method</span>
            <strong>Cash on Delivery</strong>
          </div>

          <p className="confirm-note">
            A confirmation email will be sent to you shortly. If you have any questions, feel free to{' '}
            <a href="/contact">contact us</a>.
          </p>

          <Link href="/" className="confirm-cta">Continue Shopping</Link>
        </div>
      </main>
    </div>
  );
}
