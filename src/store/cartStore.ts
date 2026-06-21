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
  isLoading: boolean
  
  openCart: () => void
  closeCart: () => void
  initCart: () => Promise<void>
  addToCart: (variantId: string, quantity: number, productData?: any) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
  checkout: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,
      isLoading: false,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      initCart: async () => {
        // Cart is persisted to localStorage automatically via the persist middleware.
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
        // Redirect to our native Next.js checkout page.
        // Cart is persisted in localStorage so it survives the full page navigation.
        window.location.href = '/checkout';
      }
    }),
    {
      name: 'minimore-cart', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the cart array, not UI state like isCartOpen/isLoading
      partialize: (state) => ({ cart: state.cart }),
    }
  )
)
