import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://localhost:3001";
const API_PROXY_PREFIX = process.env.API_PROXY_PREFIX || "/auth"; // e.g. "/auth" or "/api/auth"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${API_PROXY_TARGET}${API_PROXY_PREFIX}/:path*`,
      },
    ];
  },
};

export default nextConfig;
