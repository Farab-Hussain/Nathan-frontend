"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

const VERIFICATION_REQUIRED_PATHS = [
  "/cart",
  "/checkout", 
  "/orders",
  "/profile",
  "/dashboard",
];

const PUBLIC_PATHS = [
  "/auth/verify-email",
  "/auth/verify-success",
  "/",
  "/shop",
  "/products",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export default function GlobalVerificationCheck() {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't run checks while loading
    if (loading) {
      return;
    }

    // If user is logged in but not verified, redirect to verification page
    if (user && !user.isVerified) {
      // But allow them to stay on verification-related pages
      if (!pathname.startsWith("/auth/verify")) {
        router.replace(`/auth/verify-email?email=${encodeURIComponent(user.email)}`);
      }
      return;
    }

    // If user is verified and on auth pages (login/register), redirect to main site
    if (user && user.isVerified && 
        (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register") || pathname.startsWith("/auth/forgot-password"))) {
      console.log('Redirecting verified user away from auth pages');
      const redirectUrl = process.env.NEXT_PUBLIC_POST_AUTH_REDIRECT_URL || "/";
      router.replace(redirectUrl);
      return;
    }

    // If user is not logged in but trying to access protected routes, redirect to login
    if (!user && VERIFICATION_REQUIRED_PATHS.some(path => pathname.startsWith(path))) {
      router.replace("/auth/login");
      return;
    }
  }, [user, loading, pathname, router]);

  // This component doesn't render anything
  return null;
}
