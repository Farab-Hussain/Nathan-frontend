"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export type User = {
  name: string;
  email: string;
  role: string;
  // add other fields as needed
};

interface MeResponse {
  user: User;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
    const url = base ? `${base}/auth/me` : "/api/auth/me";
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    Promise.resolve(
      axios
        .get<MeResponse>(url, token ? { withCredentials: true, headers: { Authorization: `Bearer ${token}` } } : { withCredentials: true })
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => setUser(null))
    ).finally(() => setLoading(false));
  }, []);

  return { user, loading };
}


