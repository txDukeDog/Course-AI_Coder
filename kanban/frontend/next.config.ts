import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  ...(!isDev && { output: 'export' }),
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5154/api/:path*',
      },
    ];
  },
};

export default nextConfig;
