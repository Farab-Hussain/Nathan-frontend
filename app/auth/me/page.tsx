'use client'
import React, { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AuthCard from '@/components/ui/auth/AuthCard';

const MePage = () => {
  const { user, fetchMe, loading, error } = useAuthStore();

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <AuthCard title="My Profile" subtitle="Account details" footer={null}>
      {loading && <div className="text-black text-center">Loading...</div>}
      {error && <div className="text-red-500 text-center">{error}</div>}
      {!loading && !error && (
        <pre className="text-black text-sm bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(user, null, 2)}</pre>
      )}
    </AuthCard>
  );
};

export default MePage;


