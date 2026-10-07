'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { MALAYSIAN_STATES, shippingFor } from '@/lib/checkoutValidation';
import './checkout.css';

export default function CheckoutPage() {
  const { cart } = useCartStore();

  const [step, setStep] = useState<'info' | 'submitting'>('info');
  const [error, setError] = useState<string | null>(null);
  const [sameBilling, setSameBilling] = useState(true);
  const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(
    process.env.NODE_ENV === 'development' ? false : process.env.NEXT_PUBLIC_DISABLE_CHECKOUT !== 'false'
  );
  const [hidePrices, setHidePrices] = useState(true);

  React.useEffect(() => {
    fetch('https://admin.minimore.my/wp-json/minimore/v1/sitewide')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.disable_checkout !== 'undefined') {
          setIsCheckoutDisabled(process.env.NODE_ENV === 'development' ? false : Boolean(data.disable_checkout));
        }
        if (data && typeof data.hide_prices === 'boolean') {
          setHidePrices(data.hide_prices);
        }
      })
      .catch(() => {});
  }, []);

  const [contact, setContact] = useState({ email: '', phone: '' });
  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: 'Selangor', postcode: '', country: 'MY',
  });
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingTotal = shippingFor(shipping.state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckoutDisabled) {
      setError('Purchases are temporarily disabled at the moment. Please check back soon!');
      return;
    }
    setError(null);
    setStep('submitting');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          shipping,
          billing: sameBilling ? null : shipping,
          paymentMethod: 'billplz',
          cartItems: cart.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      if (data.testMode) {
        setError(`Local test passed. Shipping is RM ${data.shippingTotal}. No order or Billplz bill was created.`);
        setStep('info');
        return;
      }

      if (!data.paymentUrl || !data.orderId || !data.orderKey) throw new Error('Payment setup failed.');
      sessionStorage.setItem(`minimore-order-${data.orderId}`, data.orderKey);
      window.location.href = data.paymentUrl;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setStep('info');
    }
  };

  return (
    <div className="checkout-root">
      {/* Left Column */}
      <div className="checkout-left">
        <div className="checkout-left-inner">
          <header className="checkout-header">
            <Link href="/" className="checkout-logo">Minimore</Link>
            <Link href="/" className="checkout-back">← Back to Store</Link>
          </header>

          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Contact */}
            <section className="checkout-section">
            <h2 className="checkout-section-title">Contact</h2>
            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="checkout-email">Email address</label>
                <input
                  id="checkout-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com"
                  value={contact.email}
                  onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="checkout-field">
                <label htmlFor="checkout-phone">Phone (optional)</label>
                <input
                  id="checkout-phone" name="phone" type="tel" autoComplete="tel" placeholder="+60 12 345 6789"
                  value={contact.phone}
                  onChange={e => setContact(p => ({ ...p, phone: e.target.value }))}
                />
              </div>
            </div>
          </section>

          {/* Shipping */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">Shipping address</h2>
            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="shipping-first-name">First name</label>
                <input id="shipping-first-name" name="given-name" autoComplete="shipping given-name" required value={shipping.firstName}
                  onChange={e => setShipping(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="checkout-field">
                <label htmlFor="shipping-last-name">Last name</label>
                <input id="shipping-last-name" name="family-name" autoComplete="shipping family-name" required value={shipping.lastName}
                  onChange={e => setShipping(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="checkout-field">
              <label htmlFor="shipping-address">Address</label>
              <input id="shipping-address" name="address-line1" autoComplete="shipping address-line1" required placeholder="Street address" value={shipping.address1}
                onChange={e => setShipping(p => ({ ...p, address1: e.target.value }))} />
            </div>
            <div className="checkout-field">
              <label htmlFor="shipping-address-2">Apartment, suite, etc. (optional)</label>
              <input id="shipping-address-2" name="address-line2" autoComplete="shipping address-line2" placeholder="Apt, suite, unit, etc." value={shipping.address2}
                onChange={e => setShipping(p => ({ ...p, address2: e.target.value }))} />
            </div>
            <div className="checkout-field-row">
              <div className="checkout-field">
                <label htmlFor="shipping-city">City</label>
                <input id="shipping-city" name="address-level2" autoComplete="shipping address-level2" required value={shipping.city}
                  onChange={e => setShipping(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="checkout-field">
                <label htmlFor="shipping-state">State</label>
                <select id="shipping-state" name="address-level1" autoComplete="shipping address-level1" value={shipping.state}
                  onChange={e => setShipping(p => ({ ...p, state: e.target.value }))}>
                  {MALAYSIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="checkout-field">
                <label htmlFor="shipping-postcode">Postcode</label>
                <input id="shipping-postcode" name="postal-code" autoComplete="shipping postal-code" inputMode="numeric" pattern="[0-9]{5}" required maxLength={5} value={shipping.postcode}
                  onChange={e => setShipping(p => ({ ...p, postcode: e.target.value }))} />
              </div>
            </div>
            <label className="checkout-checkbox-label">
              <input name="same-billing" type="checkbox" checked={sameBilling}
                onChange={e => setSameBilling(e.target.checked)} />
              <span>Same billing address</span>
            </label>
          </section>

          {/* Payment */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">Payment</h2>
            <div className="checkout-payment-options">
              <label className="checkout-payment-option checkout-payment-selected">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input 
                    type="radio" 
                    name="paymentMethod" 
                    value="billplz" 
                    checked
                    readOnly
                    style={{ margin: 0 }}
                  />
                  <span>💳 Billplz (Online Banking / FPX)</span>
                </div>
                <span className="checkout-payment-badge">Selected</span>
              </label>
            </div>
          </section>

          {error && <div className="checkout-error" role="alert">{error}</div>}

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={step === 'submitting' || cart.length === 0 || isCheckoutDisabled}
            style={isCheckoutDisabled ? {
              backgroundColor: '#94a3b8',
              cursor: 'not-allowed',
              opacity: 0.75
            } : {}}
          >
            {isCheckoutDisabled ? 'Checkout Temporarily Disabled' : step === 'submitting' ? 'Placing Order…' : `Pay with Billplz · RM ${(subtotal + shippingTotal).toFixed(2)}`}
          </button>
        </form>
        </div>
      </div>

      {/* Right Column — Order Summary */}
      <div className="checkout-right">
        <div className="checkout-summary-inner">
          <h3 className="checkout-summary-title">Order summary</h3>
          <div className="checkout-items">
            {cart.map(item => (
              <div key={item.id} className="checkout-item">
                <div className="checkout-item-img-wrap">
                  <Image src={item.thumbnail} alt={item.title} fill style={{ objectFit: 'cover' }} />
                  <span className="checkout-item-qty">{item.quantity}</span>
                </div>
                <span className="checkout-item-name">{item.title}</span>
                {!hidePrices && <span className="checkout-item-price">RM {(item.price * item.quantity).toFixed(2)}</span>}
              </div>
            ))}
          </div>
          {!hidePrices && (
            <>
              <div className="checkout-summary-line">
                <span>Subtotal</span><span>RM {subtotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-line">
                <span>{shippingTotal === 15 ? 'East' : 'West'} Malaysia shipping</span><span>RM {shippingTotal.toFixed(2)}</span>
              </div>
              <div className="checkout-summary-line checkout-summary-total">
                <span>Total</span><span>RM {(subtotal + shippingTotal).toFixed(2)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
