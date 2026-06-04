"use client";

import { useCartStore } from "@/store/cartStore";

export default function AddToCartButton({ variantId }: { variantId: string }) {
  const { addToCart, isLoading } = useCartStore();

  const handleAddToCart = () => {
    addToCart(variantId, 1);
  };

  return (
    <button 
      className="btn-primary add-to-cart-btn" 
      onClick={handleAddToCart}
      disabled={isLoading || !variantId}
      style={{ width: '100%', marginBottom: '10px' }}
    >
      {isLoading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
