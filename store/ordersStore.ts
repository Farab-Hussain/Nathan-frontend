'use client'
import { create } from 'zustand';
import axios from 'axios';

export type OrderItem = {
  id: string;
  productId: string | null;
  quantity: number;
  price: number;
  total: number;
  product?: {
    id: string;
    name: string;
    imageUrl?: string | null;
  } | null;
};

export type Order = {
  id: string;
  userId: string;
  status: string;
  total: number;
  paymentStatus: string;
  orderNotes?: string | null;
  shippingAddress?: unknown;
  orderItems: OrderItem[];
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type OrdersState = {
  orders: Order[];
  order: Order | null;
  adminOrders: Order[];
  pagination: Pagination | null;
  adminPagination: Pagination | null;
  loading: boolean;
  error: string | null;
  createOrder: (payload: {
    shippingAddress?: unknown;
    orderNotes?: string;
    orderItems?: Array<{ productId: string; quantity: number; price: number; total: number }>;
    total?: number;
  }) => Promise<void>;
  fetchOrders: (params?: { status?: string; page?: number; limit?: number }) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  adminFetchOrders: (params?: { status?: string; paymentStatus?: string; page?: number; limit?: number }) => Promise<void>;
  adminUpdateStatus: (id: string, payload: { status?: string; paymentStatus?: string }) => Promise<void>;
  clearOrder: () => void;
};

const API_BASE_ORDERS = '/api/orders';

export const useOrdersStore = create<OrdersState>((set) => ({
  orders: [],
  order: null,
  adminOrders: [],
  pagination: null,
  adminPagination: null,
  loading: false,
  error: null,

  clearOrder: () => set({ order: null }),

  createOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('auth_token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      }
      await axios.post(`${API_BASE_ORDERS}`, payload, { withCredentials: true, headers });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const url = `${API_BASE_ORDERS}${query.toString() ? `?${query.toString()}` : ''}`;
      const headers: Record<string, string> = { };
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('auth_token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      }
      const { data } = await axios.get<{ orders: Order[]; pagination: Pagination }>(url, { withCredentials: true, headers });
      set({ orders: data.orders, pagination: data.pagination });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = { };
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('auth_token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      }
      const { data } = await axios.get<Order>(`${API_BASE_ORDERS}/${id}`, { withCredentials: true, headers });
      set({ order: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load order';
      set({ error: message, order: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  adminFetchOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const url = `${API_BASE_ORDERS}/admin/all${query.toString() ? `?${query.toString()}` : ''}`;
      const headers: Record<string, string> = { };
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('auth_token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      }
      const { data } = await axios.get<{ orders: Order[]; pagination: Pagination }>(url, { withCredentials: true, headers });
      set({ adminOrders: data.orders, adminPagination: data.pagination });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load admin orders';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  adminUpdateStatus: async (id, payload) => {
    set({ loading: true, error: null });
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (typeof window !== 'undefined') {
        const jwt = localStorage.getItem('auth_token');
        if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
      }
      await axios.put(`${API_BASE_ORDERS}/${id}/status`, payload, { withCredentials: true, headers });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));


