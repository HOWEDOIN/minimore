import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Match Hostinger's trailing-slash enforcement to prevent redirect loops
  trailingSlash: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.minimore.my',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      }
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
