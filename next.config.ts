import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async rewrites() {
    return {
      beforeFiles: [
        // Proxy the WooCommerce checkout sync trigger BEFORE Next.js tries to render the homepage
        {
          source: '/:path*',
          destination: 'https://admin.minimore.my/:path*',
          has: [{ type: 'query', key: 'minimore_checkout_sync' }],
        },
      ],
      afterFiles: [
        // Proxy the checkout page and all its assets
        {
          source: '/checkout/:path*',
          destination: 'https://admin.minimore.my/checkout/:path*',
        },
        // Proxy the order-received page (thank you page)
        {
          source: '/order-received/:path*',
          destination: 'https://admin.minimore.my/order-received/:path*',
        },
        // Proxy WooCommerce frontend assets (block checkout JS/CSS)
        {
          source: '/wp-content/:path*',
          destination: 'https://admin.minimore.my/wp-content/:path*',
        },
        {
          source: '/wp-includes/:path*',
          destination: 'https://admin.minimore.my/wp-includes/:path*',
        },
        // Proxy WooCommerce Store API calls made by the block checkout
        {
          source: '/wp-json/wc/:path*',
          destination: 'https://admin.minimore.my/wp-json/wc/:path*',
        },
        {
          source: '/wc-api/:path*',
          destination: 'https://admin.minimore.my/wc-api/:path*',
        },
      ],
      fallback: []
    };
  },
};

export default nextConfig;
