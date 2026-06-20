"use client";

import { useCartStore } from "@/store/cartStore";

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart, isLoading } = useCartStore();

  const handleAddToCart = () => {
    // In WooCommerce, simple products use the product ID as the item identifier
    const variantId = product.id.toString();
    addToCart(variantId, 1, product);
  };

  return (
    <button 
      className="btn-primary add-to-cart-btn" 
      onClick={handleAddToCart}
      disabled={isLoading || !product}
      style={{ width: '100%', marginBottom: '10px' }}
    >
      {isLoading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
