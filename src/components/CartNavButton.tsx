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
      style={{ 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        fontSize: '0.9rem', 
        color: 'var(--text-primary)',
        padding: '0.5rem',
        textDecoration: 'none'
      }}
    >
      Cart ({mounted ? count : 0})
    </button>
  );
}
