'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AuthCard from '@/components/ui/auth/AuthCard';
import PasswordInput from '@/components/ui/auth/PasswordInput';
const LoginPage = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    // no-op
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.post(`${API_URL}/auth/login`, { email: form.email, password: form.password }, { withCredentials: true });
      setSuccess('Login successful!');
      setTimeout(() => {
        const redirectUrl = process.env.NEXT_PUBLIC_POST_AUTH_REDIRECT_URL || '/';
        if (typeof window !== 'undefined') {
          window.location.href = redirectUrl;
        } else {
          router.push(redirectUrl);
        }
      }, 600);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Enter your credentials to access your account"
      footer={
        <div>
          <span>Don&apos;t have an account? </span>
          <Link href="/auth/register" className="text-primary hover:underline">Register</Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}

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
          autoComplete="current-password"
          required
        />

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <input id="remember" type="checkbox" className="h-4 w-4" />
            <label htmlFor="remember" className="text-gray-700">Remember me</label>
          </div>
          <Link href="/auth/forgot-password" className="text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="bg-primary text-white font-semibold py-2 rounded hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </AuthCard>
  );
};

export default LoginPage;


