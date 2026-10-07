import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  
  openCart: () => void
  closeCart: () => void
  addToCart: (variantId: string, quantity: number, productData?: { name?: string; price?: string; regular_price?: string; images?: Array<{ src?: string }> }) => void
  removeFromCart: (lineItemId: string) => void
  checkout: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: (variantId, quantity, productData) => {
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
              id: crypto.randomUUID(),
              variantId,
              title: productData?.name || "Product",
              price: parseFloat(productData?.price || productData?.regular_price || "0"),
              quantity,
              thumbnail: productData?.images?.[0]?.src || "/images/skincare.png"
          };
          set({ cart: [...currentCart, newItem], isCartOpen: true });
        }
      },

      removeFromCart: (lineItemId) => set({ cart: get().cart.filter(item => item.id !== lineItemId) }),
      
      checkout: () => {
        if (get().cart.length === 0) return;
        // Redirect to our native Next.js checkout page.
        // Cart is persisted in localStorage so it survives the full page navigation.
        window.location.href = '/checkout';
      }
    }),
    {
      name: 'minimore-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the cart array, not UI state.
      partialize: (state) => ({ cart: state.cart }),
    }
  )
)
