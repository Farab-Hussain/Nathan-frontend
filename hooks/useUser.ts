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

  const fetchUser = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    try {
      const res = await axios.get<MeResponse>(`${API_URL}/auth/me`, {
        withCredentials: true,
      });
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
    setLoading(false);
  };

  const clearUser = () => {
    setUser(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  return { user, loading, refreshUser, clearUser };
}
