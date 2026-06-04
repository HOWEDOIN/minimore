"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import "./cart-drawer.css";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cart, isLoading, removeFromCart, initCart } = useCartStore();

  useEffect(() => {
    initCart();
  }, [initCart]);

  if (!isCartOpen) return null;

  const items = cart?.items || [];
  
  // Calculate total from items since cart.total might not be updated immediately in all SDK flows
  const total = items.reduce((acc, item) => {
    return acc + (item.unit_price * item.quantity);
  }, 0);

  return (
    <>
      <div className="cart-overlay" onClick={closeCart} />
      <div className={`cart-drawer ${isCartOpen ? "open" : ""}`}>
        <div className="cart-header">
          <h2>Your Cart ({items.length})</h2>
          <button className="close-btn" onClick={closeCart}>&times;</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <button className="btn-secondary" onClick={closeCart}>Continue Shopping</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <Image 
                    src={item.thumbnail || "/images/skincare.png"} 
                    alt={item.title} 
                    fill 
                    className="item-img"
                  />
                </div>
                <div className="cart-item-details">
                  <h4 className="item-title">{item.title}</h4>
                  <p className="item-price">RM {item.unit_price}</p>
                  <div className="item-actions">
                    <span className="item-qty">Qty: {item.quantity}</span>
                    <button 
                      className="remove-btn" 
                      onClick={() => removeFromCart(item.id)}
                      disabled={isLoading}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span>Subtotal</span>
              <span>RM {total}</span>
            </div>
            <p className="cart-taxes">Taxes and shipping calculated at checkout</p>
            <Link href="/checkout" className="btn-primary checkout-btn" onClick={closeCart}>
              Go to Checkout
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
