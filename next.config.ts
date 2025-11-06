import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sequelize', 'pg', 'pg-hstore', 'sequelize-cli', 'bcryptjs', 'jsonwebtoken'],
  async headers() {
    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_BASE_URL || 'https://bsgeartech.yahyatarique.dev',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-User-Role, X-Requested-With',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400', // 24 hours
          },
        ],
      },
    ];
  },
};

export default nextConfig;
