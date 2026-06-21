import { create } from 'zustand'

export type CartItem = {
  id: string;
  variantId: string;
  title: string;
  quantity: number;
  price: number;
  thumbnail: string;
}

type CartState = {
  cart: CartItem[]
  isCartOpen: boolean
  isLoading: boolean
  
  openCart: () => void
  closeCart: () => void
  initCart: () => Promise<void>
  addToCart: (variantId: string, quantity: number, productData?: any) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
  checkout: () => void
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  isCartOpen: false,
  isLoading: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  initCart: async () => {
    // In a full implementation, this would fetch the cart from WooCommerce Store API
    // For now, we use a simple local array.
  },

  addToCart: async (variantId: string, quantity: number, productData?: any) => {
    set({ isLoading: true })
    try {
      const currentCart = get().cart;
      const existingItem = currentCart.find(item => item.variantId === variantId);
      
      if (existingItem) {
        const updatedCart = currentCart.map(item => 
          item.variantId === variantId 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        set({ cart: updatedCart, isCartOpen: true });
      } else {
        const newItem: CartItem = {
          id: Math.random().toString(),
          variantId,
          title: productData?.name || "Product",
          price: parseFloat(productData?.price || productData?.regular_price || "0"),
          quantity,
          thumbnail: productData?.images?.[0]?.src || "/images/skincare.png"
        };
        set({ cart: [...currentCart, newItem], isCartOpen: true });
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      set({ isLoading: false })
    }
  },

  removeFromCart: async (lineItemId: string) => {
    set({ isLoading: true })
    try {
      const currentCart = get().cart;
      set({ cart: currentCart.filter(item => item.id !== lineItemId) });
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      set({ isLoading: false })
    }
  },
  
  checkout: async () => {
    if (get().cart.length === 0) return;
    // Redirect to our native Next.js checkout page — no WordPress proxy needed.
    window.location.href = '/checkout';
  }
}))
