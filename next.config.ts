import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    // If API target is missing, skip rewrites to avoid build errors.
    if (!API_PROXY_TARGET) {
      console.warn("NEXT_PUBLIC_API_URL is not set; skipping proxy rewrites.");
      return [];
    }
    return [
      {
        source: "/auth/:path*",
        destination: `${API_PROXY_TARGET}/auth/:path*`,
      },
      { source: "/api/products", destination: `${API_PROXY_TARGET}/products` },
      {
        source: "/api/products/:path*",
        destination: `${API_PROXY_TARGET}/products/:path*`,
      },
      { source: "/cart", destination: `${API_PROXY_TARGET}/cart` },
      {
        source: "/cart/:path*",
        destination: `${API_PROXY_TARGET}/cart/:path*`,
      },
      { source: "/orders", destination: `${API_PROXY_TARGET}/orders` },
      {
        source: "/orders/:path*",
        destination: `${API_PROXY_TARGET}/orders/:path*`,
      },
      { source: "/payments", destination: `${API_PROXY_TARGET}/payments` },
      {
        source: "/payments/:path*",
        destination: `${API_PROXY_TARGET}/payments/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${API_PROXY_TARGET}/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.NODE_ENV === "production" 
              ? "https://licorice4good.com" 
              : "http://localhost:3000",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, Cookie",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
