"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";

type Product = {
  id: number | string;
  name: string;
  manage_stock?: boolean;
  stock_quantity?: number | null;
  price?: string;
  regular_price?: string;
  images?: Array<{ src?: string }>;
};

export default function AddToCartButton({ product, whatsappUrl }: { product: Product; whatsappUrl: string }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [quantity, setQuantity] = useState(1);
  const maxQuantity = product.manage_stock ? Math.max(1, product.stock_quantity || 1) : 99;

  const handleAddToCart = () => {
    const variantId = product.id.toString();
    addToCart(variantId, quantity, product);
  };

  return (
    <div className="actions-group">
      <div className="quantity-selector" role="group" aria-label="Product quantity">
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          aria-label="Decrease quantity"
          disabled={quantity === 1}
        >
          −
        </button>
        <span role="status" aria-label={`Quantity: ${quantity}`}>{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
          aria-label="Increase quantity"
          disabled={quantity === maxQuantity}
        >
          +
        </button>
      </div>
      <div className="dual-cta">
        <button
          type="button"
          className="btn-primary add-to-cart-btn"
          onClick={handleAddToCart}
          style={{ width: "100%", marginBottom: "10px" }}
        >
          {`Add ${quantity} to Cart`}
        </button>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
          style={{ display: "block", textAlign: "center", width: "100%", padding: "0.5rem", fontSize: "0.875rem", color: "#9b7a4b", opacity: 0.85, border: "none", textDecoration: "underline" }}
        >
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}
