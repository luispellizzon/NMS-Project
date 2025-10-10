import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'localhost:3000', // Allows requests from localhost on port 3000
    '*.local-origin.dev', // Allows requests from any subdomain of local-origin.dev
    // Add other origins as needed
  ],
};

export default nextConfig;