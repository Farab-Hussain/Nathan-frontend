import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://localhost:3001";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Auth endpoints
      {
        source: "/api/auth/:path*",
        destination: `${API_PROXY_TARGET}/auth/:path*`,
      },
      // Root endpoints (exact)
      { source: "/api/products", destination: `${API_PROXY_TARGET}/products` },
      { source: "/api/cart", destination: `${API_PROXY_TARGET}/cart` },
      { source: "/api/orders", destination: `${API_PROXY_TARGET}/orders` },
      // Products endpoints
      {
        source: "/api/products/:path*",
        destination: `${API_PROXY_TARGET}/products/:path*`,
      },
      // Cart endpoints
      {
        source: "/api/cart/:path*",
        destination: `${API_PROXY_TARGET}/cart/:path*`,
      },
      // Orders endpoints
      {
        source: "/api/orders/:path*",
        destination: `${API_PROXY_TARGET}/orders/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;