"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthCard from "@/components/ui/auth/AuthCard";
import PasswordInput from "@/components/ui/auth/PasswordInput";
import { useUser } from "@/hooks/useUser";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, loading: userLoading } = useUser();

  useEffect(() => {
    if (userLoading) return;
    if (user) {
      const redirectUrl =
        process.env.NEXT_PUBLIC_POST_AUTH_REDIRECT_URL || "/";
      if (typeof window !== "undefined") {
        window.location.href = redirectUrl;
      } else if (router) {
        router.replace(redirectUrl);
      }
    }
  }, [user, userLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
    // no-op
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // no-op

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${API_URL}/auth/register`, { name, email, password }, { withCredentials: true });
      setSuccess("Registration successful!");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
      setTimeout(() => {
        const redirectUrl =
          process.env.NEXT_PUBLIC_POST_AUTH_REDIRECT_URL || "/";
        if (typeof window !== "undefined") {
          window.location.href = redirectUrl;
        }
      }, 600);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const serverMsg = (err.response?.data as { message?: string } | undefined)?.message;
        if (serverMsg) {
          setError(serverMsg);
        } else if (status === 400 || status === 409) {
          setError("Invalid details or email already in use");
        } else {
          setError("Registration failed. Please try again.");
        }
      } else {
        const message = err instanceof Error ? err.message : "Registration failed.";
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Join us to start your fundraising journey"
      footer={
        <div>
          <span>Already have an account? </span>
          <Link href="/auth/login" className="text-primary hover:underline">
            Login
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm text-center">{success}</div>
        )}
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-black font-medium">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white"
            autoComplete="name"
            required
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-black font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white"
            autoComplete="email"
            required
          />
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="Password"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          className="bg-primary text-white font-semibold py-2 rounded hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </AuthCard>
  );
};

export default RegisterPage;
