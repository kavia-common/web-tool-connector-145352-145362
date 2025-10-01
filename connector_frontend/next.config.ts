import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://vscode-internal-41570-beta.beta01.cloud.kavia.ai:3001',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://vscode-internal-41570-beta.beta01.cloud.kavia.ai:3000',
  },

  // Headers for OAuth and security
  async headers() {
    return [
      {
        source: '/oauth/callback',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Redirects for OAuth handling
  async redirects() {
    return [
      {
        source: '/auth/callback',
        destination: '/oauth/callback',
        permanent: true,
      },
    ];
  },

  // Image optimization
  images: {
    domains: ['*.atlassian.net', 'secure.gravatar.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.atlassian.net',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    optimizePackageImports: ['@/components', '@/services', '@/types'],
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },


};

export default nextConfig;
