"use client";
import { useState } from "react";

export default function QuantitySelector() {
  const [qty, setQty] = useState(1);

  return (
    <div className="quantity-selector">
      <button
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span>{qty}</span>
      <button
        onClick={() => setQty((q) => q + 1)}
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
