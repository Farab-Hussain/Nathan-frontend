'use client'
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import axios from 'axios';

const NavLink = ({ href, label }: { href: string; label: string }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
        isActive
          ? 'bg-white/15 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.2)]'
          : 'text-white/85 hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  );
};

const DashboardHeader = () => {
  const { user } = useUser();
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const onLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
      router.replace('/');
    } catch {
      // no-op
    }
  };

  return (
    <div className="w-full bg-primary">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-white drop-shadow">Dashboard</span>
          <span className="text-xs text-white/80 hidden sm:inline">Admin</span>
        </div>
        <nav className="flex items-center gap-2">
          <NavLink href="/dashboard" label="Overview" />
          <NavLink href="/dashboard/orders" label="Orders" />
          <NavLink href="/dashboard/addProducts" label="Products" />
        </nav>
        <div className="flex items-center gap-3">
          {user && user.role === 'admin' ? (
            <>
              <span className="hidden sm:inline text-sm text-white/90">
                {user.name} ({user.role})
              </span>
              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-md text-sm bg-white/15 text-white hover:bg:white/20 transition shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="px-3 py-1.5 rounded-md text-sm bg-white/15 text-white hover:bg:white/20 transition shadow-[0_0_0_1px_rgba(255,255,255,0.25)]"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
