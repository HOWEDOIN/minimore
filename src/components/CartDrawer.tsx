"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import "./cart-drawer.css";

export default function CartDrawer() {
  const { isCartOpen, closeCart, cart, isLoading, removeFromCart, initCart } = useCartStore();
  const [isCheckoutDisabled, setIsCheckoutDisabled] = useState(
    process.env.NEXT_PUBLIC_DISABLE_CHECKOUT !== "false"
  );

  useEffect(() => {
    initCart();
    fetch("https://admin.minimore.my/wp-json/minimore/v1/sitewide")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.disable_checkout !== "undefined") {
          setIsCheckoutDisabled(Boolean(data.disable_checkout));
        }
      })
      .catch(() => {});
  }, [initCart]);

  if (!isCartOpen) return null;

  const items = cart || [];
  
  const total = items.reduce((acc, item) => {
    return acc + (item.price * item.quantity);
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
              <button className="btn-outline" onClick={closeCart}>Continue Shopping</button>
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
                  <p className="item-price">RM {item.price}</p>
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
            <p className="cart-taxes">
              {isCheckoutDisabled 
                ? "Purchases are temporarily disabled." 
                : "Taxes and shipping calculated at checkout"}
            </p>
            <button 
              className={`btn-primary checkout-btn ${isCheckoutDisabled ? "checkout-disabled-btn" : ""}`}
              onClick={() => {
                if (!isCheckoutDisabled) {
                  useCartStore.getState().checkout();
                }
              }}
              disabled={isCheckoutDisabled}
              title={isCheckoutDisabled ? "Purchases are temporarily disabled." : "Proceed to Checkout"}
              style={isCheckoutDisabled ? {
                backgroundColor: "#94a3b8",
                color: "#f1f5f9",
                cursor: "not-allowed",
                boxShadow: "none",
                transform: "none",
                opacity: 0.75,
                border: "none"
              } : {}}
            >
              {isCheckoutDisabled ? "Checkout Temporarily Disabled" : "Go to Checkout"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
