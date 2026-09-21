import type { NextConfig } from "next";

const pocketBaseUrl = process.env.POCKETBASE_URL || "http://127.0.0.1:8090";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [new URL(`${pocketBaseUrl}/api/files/**`)],
  },
};

export default nextConfig;
