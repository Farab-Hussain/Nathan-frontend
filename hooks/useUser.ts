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
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    Promise.resolve(
      axios
        .get<MeResponse>(`${API_URL}/auth/me`, {
          withCredentials: true,
        })
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => setUser(null))
    ).finally(() => setLoading(false));
  }, []);

  return { user, loading };
}
