'use client'
import { create } from 'zustand';
import axios, { AxiosRequestConfig, RawAxiosRequestHeaders } from 'axios';

type User = {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
} | null;

type AuthState = {
  user: User;
  loading: boolean;
  error: string | null;
  token: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (code: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
};

// Prefer proxying through Next.js (see next.config.ts rewrites) to avoid CORS
const API_BASE_AUTH =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || '/api/auth';

const isPublicAuthEndpoint = (path: string) =>
  ['/login', '/register', '/forgot-password', '/reset-password'].includes(path);

async function axiosRequest<T = unknown>(
  path: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const url = `${API_BASE_AUTH}${path}`;
  const headers: RawAxiosRequestHeaders = {
    'Content-Type': 'application/json',
    ...Object.fromEntries(
      Object.entries(config.headers || {}).filter(
        ([, value]) => value !== null && value !== undefined
      )
    ),
  };

  if (
    typeof window !== 'undefined' &&
    !isPublicAuthEndpoint(path)
  ) {
    const jwt = localStorage.getItem('auth_token');
    if (jwt) headers['Authorization'] = `Bearer ${jwt}`;
  }

  try {
    const response = await axios({
      url,
      withCredentials: true,
      headers,
      ...config,
    });
    return response.data as T;
  } catch (error) {
    let message = 'Request failed.';
    let status: number | undefined;
    if (axios.isAxiosError(error)) {
      status = error.response?.status;
      const data = error.response?.data;
      message =
        (data && (data.message || data.error)) ||
        error.message ||
        'Request failed.';
      if (status === 409) {
        message = 'Email already exists.';
      }
      if (status === 404) {
        message = 'No user exists with this email';
      }
      if (process.env.NODE_ENV !== 'production') {
        console.error('Auth request failed', { url, status, data });
      }
    }
    throw new Error(message);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  token: (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null) || null,

  clearError: () => set({ error: null }),
  setUser: (user: User) => set({ user }),
  setToken: (token: string | null) => {
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('auth_token', token);
      else localStorage.removeItem('auth_token');
    }
    set({ token });
  },

  register: async (name: string, email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest('/register', {
        method: 'POST',
        data: { name, email, password },
      });
      // Try to populate user after register if session is established
      try {
        await get().fetchMe();
      } catch {
        // ignore
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const data = await axiosRequest<{ token?: string; user?: unknown; message?: string }>('/login', {
        method: 'POST',
        data: { email, password },
      });
      if (data && data.token) {
        get().setToken(data.token);
      }
      await get().fetchMe();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  forgotPassword: async (email: string) => {
    set({ loading: true, error: null });
    try {
      await axiosRequest('/forgot-password', {
        method: 'POST',
        data: { email },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed.';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (code: string, password: string, email?: string) => {
    set({ loading: true, error: null });
    try {
      const payload: Record<string, unknown> = {
        code,
        resetToken: code,
        password,
        newPassword: password,
      };
      if (email) payload.email = email;
      await axiosRequest('/reset-password', {
        method: 'POST',
        data: payload,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed.';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axiosRequest('/logout', { method: 'POST' });
      set({ user: null });
      get().setToken(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed.';
      set({ error: message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchMe: async () => {
    set({ loading: true, error: null });
    try {
      const data = await axiosRequest<{ user: User }>('/me', { method: 'GET' });
      set({ user: data?.user ?? null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to fetch profile.';
      set({ error: message, user: null });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));