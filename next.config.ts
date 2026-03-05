import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // Allow framing from Shopify domains and own domain
            value: "frame-ancestors 'self' https://admin.shopify.com https://*.myshopify.com https://*.shopify.com",
          },
          {
            // Remove X-Frame-Options to allow CSP frame-ancestors to take precedence
            // This is necessary because Vercel/Next.js often defaults to SAMEORIGIN
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Some browsers still look for this, but standard is to use CSP
          },
        ],
      },
      {
        // Specific headers for the VTO widget if needed
        source: '/widget/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://admin.shopify.com https://*.myshopify.com https://*.shopify.com",
          }
        ]
      }
    ];
  },
};

export default nextConfig;
