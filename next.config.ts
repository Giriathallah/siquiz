import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // Opsi ini akan mengabaikan error ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
