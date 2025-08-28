'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AuthCard from '@/components/ui/auth/AuthCard';

const LogoutPage = () => {
  const [status, setStatus] = useState('Logging out...');
  const { logout, error: storeError } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout();
        setStatus('Logged out successfully.');
        setTimeout(() => router.replace('/'), 600);
      } catch {
        setStatus('');
      }
    };
    doLogout();
  }, [logout, router]);

  return (
    <AuthCard title="Logging out" subtitle="We\'re ending your session" footer={null}>
      <div className="text-center">
        {status && <div className="text-black mb-2">{status}</div>}
        {storeError && <div className="text-red-500">{storeError}</div>}
        <button
          onClick={() => router.replace('/')}
          className="mt-4 bg-primary text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition-colors"
        >
          Go home
        </button>
      </div>
    </AuthCard>
  );
};

export default LogoutPage;


