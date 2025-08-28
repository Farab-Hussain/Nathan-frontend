'use client'
import { create } from 'zustand';
import axios from 'axios';

export type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string | null;
  isActive?: boolean;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type ProductsState = {
  products: Product[];
  categories: string[];
  product: Product | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchProducts: (params?: { category?: string; search?: string; page?: number; limit?: number }) => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  clearProduct: () => void;
};

const API_BASE_PRODUCTS = '/api/products';

export const useProductsStore = create<ProductsState>((set) => ({
  products: [],
  categories: [],
  product: null,
  pagination: null,
  loading: false,
  error: null,

  clearProduct: () => set({ product: null }),

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get<string[]>(`${API_BASE_PRODUCTS}/categories`, { withCredentials: true });
      set({ categories: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load categories';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchProducts: async (params) => {
    set({ loading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));
      const url = `${API_BASE_PRODUCTS}${query.toString() ? `?${query.toString()}` : ''}`;
      const { data } = await axios.get<{ products: Product[]; pagination: Pagination }>(url, { withCredentials: true });
      set({ products: data.products, pagination: data.pagination });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load products';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get<Product>(`${API_BASE_PRODUCTS}/${id}`, { withCredentials: true });
      set({ product: data });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load product';
      set({ error: message, product: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));


