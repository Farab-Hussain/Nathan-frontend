import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Auth endpoints (no /api prefix)
      { source: "/auth/:path*", destination: `${API_PROXY_TARGET}/auth/:path*` },
      // Products API
      { source: "/api/products", destination: `${API_PROXY_TARGET}/products` },
      { source: "/api/products/:path*", destination: `${API_PROXY_TARGET}/products/:path*` },
      // Cart API
      { source: "/cart", destination: `${API_PROXY_TARGET}/cart` },
      { source: "/cart/:path*", destination: `${API_PROXY_TARGET}/cart/:path*` },
      // Orders API
      { source: "/orders", destination: `${API_PROXY_TARGET}/orders` },
      { source: "/orders/:path*", destination: `${API_PROXY_TARGET}/orders/:path*` },
      // Static uploads served by backend API
      { source: "/uploads/:path*", destination: `${API_PROXY_TARGET}/uploads/:path*` },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Allow images served from the backend API (e.g., http://localhost:4000/uploads/...)
      { protocol: 'http', hostname: 'localhost', port: '4000' },
    ],
  },
};

export default nextConfig;