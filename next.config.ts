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
  async redirects() {
    return [
      {
        source: '/cart',
        destination: '/',
        permanent: true,
      },
      {
        source: '/product/:slug*',
        destination: '/products/:slug*',
        permanent: true,
      },
      // WooCommerce redirects users here after payment — route to our confirmation page
      {
        source: '/checkout/order-received/:id/',
        destination: '/order-confirmation/:id',
        permanent: false,
      },
      {
        source: '/checkout/order-received/:id',
        destination: '/order-confirmation/:id',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
