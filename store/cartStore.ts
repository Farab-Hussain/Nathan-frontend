"use client";
import { create } from "zustand";
import axios from "axios";

export type CartItem = {
  id: string;
  title: string;
  imageUrl?: string | null;
  stikersImgeUrl?: string[];
  stikersName?: string[];
  size?: string | null;
  sizeAndQuantity?: unknown;
  colorsName?: string | null;
  colorsCode?: string | null;
  options?: unknown;
  quantity: number;
  total: number;
  orderNotes?: string | null;
  productId?: string | null;
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (
    payload: Partial<CartItem> & { quantity?: number; total?: number }
  ) => Promise<void>;
  fetchCart: () => Promise<void>;
  updateItem: (
    id: string,
    payload: { quantity?: number; total?: number }
  ) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
};

const API_BASE_CART = "/api/cart";

export const useCartStore = create<CartState>((set) => ({
  items: [],
  loading: false,
  error: null,

  addToCart: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (typeof window !== "undefined") {
        const jwt = localStorage.getItem("auth_token");
        if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      }
      await axios.post(`${API_BASE_CART}/add`, payload, {
        withCredentials: true,
        headers,
      });
      const { data } = await axios.get<CartItem[]>(`${API_BASE_CART}`, {
        withCredentials: true,
        headers,
      });
      set({ items: data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add to cart";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const jwt = localStorage.getItem("auth_token");
        if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      }
      const { data } = await axios.get<CartItem[]>(`${API_BASE_CART}`, {
        withCredentials: true,
        headers,
      });
      set({ items: data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load cart";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateItem: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (typeof window !== "undefined") {
        const jwt = localStorage.getItem("auth_token");
        if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      }
      await axios.put(`${API_BASE_CART}/${id}`, payload, {
        withCredentials: true,
        headers,
      });
      const { data } = await axios.get<CartItem[]>(`${API_BASE_CART}`, {
        withCredentials: true,
        headers,
      });
      set({ items: data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update item";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  removeItem: async (id) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const jwt = localStorage.getItem("auth_token");
        if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      }
      await axios.delete(`${API_BASE_CART}/${id}`, {
        withCredentials: true,
        headers,
      });
      const { data } = await axios.get<CartItem[]>(`${API_BASE_CART}`, {
        withCredentials: true,
        headers,
      });
      set({ items: data });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove item";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== "undefined") {
        const jwt = localStorage.getItem("auth_token");
        if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
      }
      await axios.delete(`${API_BASE_CART}`, {
        withCredentials: true,
        headers,
      });
      set({ items: [] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to clear cart";
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
