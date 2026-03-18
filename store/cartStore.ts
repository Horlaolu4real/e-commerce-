'use client'
import { create } from 'zustand'
import { CartItem, CartSummary } from '../types'
import api from '../lib/axios'

interface CartState {
  items: CartItem[]
  summary: CartSummary | null
  isLoading: boolean
  fetchCart: () => Promise<void>
  addToCart: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (cartItemId: number, quantity: number) => Promise<void>
  removeItem: (cartItemId: number) => Promise<void>
  clearCart: () => Promise<void>
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  summary: null,
  isLoading: false,

  fetchCart: async () => {
    set({ isLoading: true })
    try {
      const { data } = await api.get('/cart')
      set({ items: data.data.items, summary: data.data.summary, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  addToCart: async (productId, quantity = 1) => {
    await api.post('/cart', { product_id: productId, quantity })
    get().fetchCart()
  },

  updateQuantity: async (cartItemId, quantity) => {
    await api.put(`/cart/${cartItemId}`, { quantity })
    get().fetchCart()
  },

  removeItem: async (cartItemId) => {
    await api.delete(`/cart/${cartItemId}`)
    get().fetchCart()
  },

  clearCart: async () => {
    await api.delete('/cart/clear')
    set({ items: [], summary: null })
  },
}))