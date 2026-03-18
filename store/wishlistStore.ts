"use client";
import { create } from "zustand";
import { WishlistItem } from "../types";
import api from "../lib/axios";

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: number) => Promise<void>;
  removeFromWishlist: (wishlistItemId: number) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/wishlist");
      set({ items: data.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addToWishlist: async (productId) => {
    await api.post("/wishlist", { product_id: productId });
    get().fetchWishlist();
  },

  removeFromWishlist: async (wishlistItemId) => {
    await api.delete(`/wishlist/${wishlistItemId}`);
    get().fetchWishlist();
  },
}));
