'use client'
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Link from 'next/link';
import AuthCard from '@/components/ui/auth/AuthCard';
import PasswordInput from '@/components/ui/auth/PasswordInput';

const ResetPasswordPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const { resetPassword, forgotPassword, loading, error: storeError, clearError } = useAuthStore();

  useEffect(() => {
    const codeParam = searchParams.get('code') || '';
    const emailParam = searchParams.get('email') || '';
    if (codeParam) setCode(codeParam);
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!code || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await resetPassword(code, form.password, email || undefined);
      setSuccess('Password reset successful!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 800);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Reset failed.';
      setError(message);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendMsg('');
    clearError();
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Missing email. Go back and enter your email.');
      return;
    }
    try {
      setResending(true);
      await forgotPassword(normalizedEmail);
      setResendMsg(`A new 6-digit code has been sent to ${normalizedEmail}.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to resend code.';
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter the token and choose a new password"
      footer={<Link href="/auth/login" className="text-primary hover:underline">Back to login</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {(error || storeError) && (
          <div className="text-red-500 text-sm text-center">{error || storeError}</div>
        )}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        {resendMsg && <div className="text-green-600 text-sm text-center">{resendMsg}</div>}

        <div className="flex flex-col gap-1">
          <label htmlFor="code" className="text-black font-medium">6-digit code</label>
          <input
            id="code"
            name="code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-black placeholder-gray-400 bg-white tracking-widest text-center"
            placeholder="••••••"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleResend}
            className="text-sm text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={resending}
          >
            {resending ? 'Resending...' : 'Resend code'}
          </button>
        </div>

        <PasswordInput
          id="password"
          name="password"
          label="New Password"
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
          {loading ? 'Resetting...' : 'Reset password'}
        </button>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;


