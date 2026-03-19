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
      localStorage.setItem("user", JSON.stringify(data.user));
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
      localStorage.setItem("user", JSON.stringify(data.user));
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
    localStorage.removeItem("user");
    set({ user: null });
  },

  refreshAuth: async () => {
    // First restore user from localStorage
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        set({ user });
        // Try to get a fresh access token silently
        try {
          const { data } = await api.post<AuthResponse>("/auth/refresh");
          setAccessToken(data.accessToken);
          localStorage.setItem("user", JSON.stringify(data.user));
          set({ user: data.user });
        } catch {
          // refresh token failed but user is still in localStorage
          // they can still browse but will need to login again for protected actions
        }
        return true;
      } catch {
        localStorage.removeItem("user");
      }
    }
    setAccessToken(null);
    set({ user: null });
    return false;
  },

  clearError: () => set({ error: null }),
}));
