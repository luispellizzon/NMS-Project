import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000', // Allows requests from localhost on port 3000
    '*.local-origin.dev', // Allows requests from any subdomain of local-origin.dev
    // Add other origins as needed
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'appleid.cdn-apple.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;