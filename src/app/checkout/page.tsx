'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import './checkout.css';

const MALAYSIAN_STATES = [
  'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
  'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
  'Terengganu', 'Kuala Lumpur', 'Labuan', 'Putrajaya',
];

export default function CheckoutPage() {
  const { cart, isLoading: cartLoading } = useCartStore();
  const router = useRouter();

  const [step, setStep] = useState<'info' | 'submitting'>('info');
  const [error, setError] = useState<string | null>(null);
  const [sameBilling, setSameBilling] = useState(true);

  const [contact, setContact] = useState({ email: '', phone: '' });
  const [shipping, setShipping] = useState({
    firstName: '', lastName: '', address1: '', address2: '',
    city: '', state: 'Selangor', postcode: '', country: 'MY',
  });
  const [paymentMethod] = useState('cod');

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          paymentMethod,
          cartItems: cart.map(i => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong.');
      }

      // Clear cart and go to confirmation
      useCartStore.setState({ cart: [], isCartOpen: false });
      router.push(`/order-confirmation/${data.orderId}?key=${data.orderKey}&number=${data.orderNumber}&total=${data.total}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setStep('info');
    }
  };

  return (
    <div className="checkout-root">
      {/* Left Column */}
      <div className="checkout-left">
        <div className="checkout-left-inner">
          <header className="checkout-header">
            <a href="/" className="checkout-logo">Minimore</a>
            <a href="/" className="checkout-back">← Back to Store</a>
          </header>

          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Contact */}
            <section className="checkout-section">
            <h2 className="checkout-section-title">Contact</h2>
            <div className="checkout-field-row">
              <div className="checkout-field">
                <label>Email address</label>
                <input
                  type="email" required placeholder="you@example.com"
                  value={contact.email}
                  onChange={e => setContact(p => ({ ...p, email: e.target.value }))}
                />
              </div>
              <div className="checkout-field">
                <label>Phone (optional)</label>
                <input
                  type="tel" placeholder="+60 12 345 6789"
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
                <label>First name</label>
                <input required value={shipping.firstName}
                  onChange={e => setShipping(p => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="checkout-field">
                <label>Last name</label>
                <input required value={shipping.lastName}
                  onChange={e => setShipping(p => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="checkout-field">
              <label>Address</label>
              <input required placeholder="Street address" value={shipping.address1}
                onChange={e => setShipping(p => ({ ...p, address1: e.target.value }))} />
            </div>
            <div className="checkout-field">
              <label>Apartment, suite, etc. (optional)</label>
              <input placeholder="Apt, suite, unit, etc." value={shipping.address2}
                onChange={e => setShipping(p => ({ ...p, address2: e.target.value }))} />
            </div>
            <div className="checkout-field-row">
              <div className="checkout-field">
                <label>City</label>
                <input required value={shipping.city}
                  onChange={e => setShipping(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="checkout-field">
                <label>State</label>
                <select value={shipping.state}
                  onChange={e => setShipping(p => ({ ...p, state: e.target.value }))}>
                  {MALAYSIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="checkout-field">
                <label>Postcode</label>
                <input required maxLength={5} value={shipping.postcode}
                  onChange={e => setShipping(p => ({ ...p, postcode: e.target.value }))} />
              </div>
            </div>
            <label className="checkout-checkbox-label">
              <input type="checkbox" checked={sameBilling}
                onChange={e => setSameBilling(e.target.checked)} />
              <span>Same billing address</span>
            </label>
          </section>

          {/* Payment */}
          <section className="checkout-section">
            <h2 className="checkout-section-title">Payment</h2>
            <div className="checkout-payment-option checkout-payment-selected">
              <span>💵 Cash on Delivery</span>
              <span className="checkout-payment-badge">Selected</span>
            </div>
          </section>

          {error && <div className="checkout-error">{error}</div>}

          <button
            type="submit"
            className="checkout-submit-btn"
            disabled={step === 'submitting' || cart.length === 0}
          >
            {step === 'submitting' ? 'Placing Order…' : `Place Order · RM ${subtotal.toFixed(2)}`}
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
                <span className="checkout-item-price">RM {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="checkout-summary-line">
            <span>Subtotal</span><span>RM {subtotal.toFixed(2)}</span>
          </div>
          <div className="checkout-summary-line">
            <span>Shipping</span><span className="checkout-free">Free</span>
          </div>
          <div className="checkout-summary-line checkout-summary-total">
            <span>Total</span><span>RM {subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
