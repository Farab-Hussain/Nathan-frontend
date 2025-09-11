"use client";
import { useUser } from "@/hooks/useUser";
import { useEffect, useState } from "react";

/**
 * AuthDebugger component to help diagnose authentication issues
 * Only shows in development mode
 */
export const AuthDebugger = () => {
  const { user, loading, error } = useUser();
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // Get all cookies for debugging
    setCookies(document.cookie);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Loading:</strong> {loading ? "Yes" : "No"}</div>
        <div><strong>User:</strong> {user ? `${user.name} (${user.role})` : "null"}</div>
        <div><strong>Error:</strong> {error || "none"}</div>
        <div><strong>Cookies:</strong> {cookies ? "Present" : "None"}</div>
        <div><strong>Token Cookie:</strong> {document.cookie.includes("token") ? "Yes" : "No"}</div>
        <div><strong>Location:</strong> {typeof window !== "undefined" ? window.location.pathname : "SSR"}</div>
      </div>
    </div>
  );
};

export default AuthDebugger;
