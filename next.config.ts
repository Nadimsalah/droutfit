import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/product/:id',
        destination: '/widget/:id',
        permanent: true,
      },
      {
        source: '/product',
        destination: '/dashboard',
        permanent: true,
      }
    ];
  },
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: [
            {
              key: "Content-Security-Policy",
              value: "frame-ancestors 'self' http://localhost:3000 http://127.0.0.1:3000 http://localhost:3005 http://127.0.0.1:3005 *"
            }
        ]
      },
      {
        // Override for widget specifically to allow all
        source: "/widget/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *"
          }
        ]
      }
    ];
  },
  allowedDevOrigins: ["localhost:3000", "localhost:3005"]
};

export default nextConfig;
