"use client";
import { create } from "zustand";
import { User, AuthResponse, ApiError } from "../types";
import api, { setAccessToken } from "../lib/axios";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      setAccessToken(data.accessToken);
      set({ user: data.user, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message ?? "Login failed",
        isLoading: false,
      });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });
      setAccessToken(data.accessToken);
      set({ user: data.user, isLoading: false });
    } catch (err: unknown) {
      const error = err as ApiError;
      set({
        error: error.response?.data?.message ?? "Registration failed",
        isLoading: false,
      });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    set({ user: null });
  },

  refreshAuth: async () => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/refresh");
      setAccessToken(data.accessToken);
      set({ user: data.user });
      return true;
    } catch {
      setAccessToken(null);
      set({ user: null });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
