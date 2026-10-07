import type { NextConfig } from "next";

const scriptSrc = process.env.NODE_ENV === 'development'
  ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
  : "script-src 'self' 'unsafe-inline'";
const upgradeInsecureRequests = process.env.NODE_ENV === 'production' ? '; upgrade-insecure-requests' : '';

const nextConfig: NextConfig = {
  poweredByHeader: false,
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
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://admin.minimore.my https://www.billplz.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'${upgradeInsecureRequests}` },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
      ],
    }];
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
