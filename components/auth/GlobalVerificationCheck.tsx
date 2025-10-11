"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const VERIFICATION_REQUIRED_PATHS = [
  "/dashboard",
];

const AUTH_PAGES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export default function GlobalVerificationCheck() {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Don't run checks while loading, redirecting, or if already redirected
    if (loading || hasRedirected.current || isRedirecting) {
      return;
    }

    // If user is logged in but not verified, redirect to verification page
    if (user && !user.isVerified) {
      // But allow them to stay on verification-related pages
      if (!pathname.startsWith("/auth/verify")) {
        hasRedirected.current = true;
        setIsRedirecting(true);
        router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
      }
      return;
    }

    // If user is verified and on auth pages, redirect away (ONE TIME ONLY)
    const isOnAuthPage = AUTH_PAGES.some(authPath => pathname.startsWith(authPath));
    if (user && user.isVerified && isOnAuthPage) {
      // Mark as redirected immediately to prevent multiple redirects
      hasRedirected.current = true;
      setIsRedirecting(true);
      
      // Check if there's a redirect URL in the query params
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      
      // Use timeout to allow state to update before redirect
      setTimeout(() => {
        // If there's a specific redirect, use it
        if (redirectTo && redirectTo !== pathname) {
          window.location.href = redirectTo;
          return;
        }
        
        // If admin user and no specific redirect, send to dashboard
        if (user.role === 'admin') {
          window.location.href = '/dashboard/admin';
          return;
        }
        
        // Default redirect for regular users
        window.location.href = '/';
      }, 100);
      
      return;
    }

    // Only protect dashboard - all other pages are public
    const isProtectedPath = VERIFICATION_REQUIRED_PATHS.some(path => pathname.startsWith(path));
    if (!user && isProtectedPath) {
      hasRedirected.current = true;
      setIsRedirecting(true);
      // Save the current path to redirect back after login
      const currentPath = pathname;
      router.replace(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
  }, [user, loading, pathname, router, isRedirecting]);

  // This component doesn't render anything
  return null;
}
