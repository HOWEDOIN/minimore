import { create } from 'zustand'
import Cookies from 'js-cookie'
import { sdk } from '@/lib/medusa'
import { HttpTypes } from '@medusajs/types'

type CartState = {
  cartId: string | null
  cart: HttpTypes.StoreCart | null
  isCartOpen: boolean
  isLoading: boolean
  
  openCart: () => void
  closeCart: () => void
  initCart: () => Promise<void>
  addToCart: (variantId: string, quantity: number) => Promise<void>
  removeFromCart: (lineItemId: string) => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
  cartId: Cookies.get('cart_id') || null,
  cart: null,
  isCartOpen: false,
  isLoading: false,

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  initCart: async () => {
    const { cartId } = get()
    set({ isLoading: true })
    
    try {
      if (cartId) {
        // Fetch existing cart
        const { cart } = await sdk.store.cart.retrieve(cartId)
        set({ cart })
      } else {
        // Create new cart
        const { cart } = await sdk.store.cart.create()
        Cookies.set('cart_id', cart.id, { expires: 7 }) // 7 days
        set({ cartId: cart.id, cart })
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error)
      // If retrieval fails (e.g. cart expired/deleted), create a new one
      Cookies.remove('cart_id')
      set({ cartId: null, cart: null })
      const { cart } = await sdk.store.cart.create().catch(() => ({ cart: null }))
      if (cart) {
        Cookies.set('cart_id', cart.id, { expires: 7 })
        set({ cartId: cart.id, cart })
      }
    } finally {
      set({ isLoading: false })
    }
  },

  addToCart: async (variantId: string, quantity: number) => {
    set({ isLoading: true })
    try {
      let currentCartId = get().cartId
      
      // Ensure we have a cart
      if (!currentCartId) {
        await get().initCart()
        currentCartId = get().cartId
      }
      
      if (!currentCartId) throw new Error("No cart available")

      // Add line item
      const { cart } = await sdk.store.cart.createLineItem(currentCartId, {
        variant_id: variantId,
        quantity,
      })
      
      set({ cart, isCartOpen: true })
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("Failed to add to cart.")
    } finally {
      set({ isLoading: false })
    }
  },

  removeFromCart: async (lineItemId: string) => {
    const currentCartId = get().cartId
    if (!currentCartId) return

    set({ isLoading: true })
    try {
      const { cart } = await sdk.store.cart.deleteLineItem(currentCartId, lineItemId)
      // Note: deleteLineItem might not return the updated cart directly in all SDK versions,
      // if it doesn't, we fetch it manually.
      if (cart) {
        set({ cart })
      } else {
        const { cart: updatedCart } = await sdk.store.cart.retrieve(currentCartId)
        set({ cart: updatedCart })
      }
    } catch (error) {
      console.error("Error removing item:", error)
    } finally {
      set({ isLoading: false })
    }
  }
}))
