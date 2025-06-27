import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
  // 🚨 EMERGENCY FIX: Disable aggressive prefetching to stop 180+ request crisis
  experimental: {
    // Disable optimistic client cache that causes over-fetching
    optimisticClientCache: false,
    // Disable server actions that trigger excessive RSC requests
    serverActions: {
      allowedOrigins: ['localhost:3000', 'winzo-platform.netlify.app']
    },
  },
  
  // 🚨 EMERGENCY FIX: Prefetching disabled on individual Link components
  // This prevents all sports sections from being loaded simultaneously
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'winzo-platform',
  },
  
  // WINZO branding
  poweredByHeader: false,
  
  // Compression and optimization
  compress: true,
  
  // Development and production configs
  reactStrictMode: true,
  
  // Webpack configuration for path aliases
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': __dirname,
      '@/components': path.join(__dirname, 'components'),
      '@/public': path.join(__dirname, 'public'),
      '@/app': path.join(__dirname, 'app'),
      '@/contexts': path.join(__dirname, 'contexts'),
      '@/services': path.join(__dirname, 'services'),
      '@/utils': path.join(__dirname, 'utils'),
    };
    return config;
  },
  
  // Note: rewrites and headers don't work with static export
  // API calls will be handled directly by the client to the WINZO backend
};

export default nextConfig;
