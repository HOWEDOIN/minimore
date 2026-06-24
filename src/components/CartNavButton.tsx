"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";

import { ShoppingBag } from 'lucide-react';

export default function CartNavButton() {
  const { cart, openCart, initCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initCart();
  }, [initCart]);

  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <button 
      onClick={openCart} 
      className="cart-nav-button"
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        padding: '0.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
      aria-label="Open Cart"
    >
      <ShoppingBag size={22} strokeWidth={1.5} />
      {mounted && count > 0 && (
        <span style={{
          position: 'absolute',
          top: '2px',
          right: '0px',
          backgroundColor: '#ff4d4f',
          color: 'white',
          borderRadius: '50%',
          width: '18px',
          height: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          transform: 'translate(25%, -25%)'
        }}>
          {count}
        </span>
      )}
    </button>
  );
}
