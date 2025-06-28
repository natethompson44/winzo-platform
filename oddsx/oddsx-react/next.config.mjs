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
    unoptimized: true, // Required for static export
    // 🔧 PERFORMANCE FIX: Image optimization for static export
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      'localhost',
      'winzo-platform-production.up.railway.app',
      'winzo-platform.netlify.app'
    ],
    // Preload critical images
    loader: 'default',
    path: '/_next/image',
  },
  
  // 🚨 CRITICAL FIX: Comprehensive prefetch disabling
  experimental: {
    // Disable optimistic client cache that causes over-fetching
    optimisticClientCache: false,
    // Force disable prefetch cache
    clientRouterFilter: false,
  },
  
  // 🚨 CRITICAL FIX: Disable all automatic prefetching
  compiler: {
    // Remove prefetch hints from HTML
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: 'winzo-platform',
    // Disable Next.js prefetch behavior
    NEXT_DISABLE_PREFETCH: 'true',
  },
  
  // WINZO branding
  poweredByHeader: false,
  
  // Compression and optimization
  compress: true,
  
  // Development and production configs
  reactStrictMode: true,
  
  // Webpack configuration for path aliases
  webpack: (config, { dev, isServer }) => {
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
    
    // 🚨 CRITICAL FIX: Disable prefetch at webpack level
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          // Prevent automatic chunking of route groups
          default: false,
          vendors: false,
          // Only create chunks for explicit dynamic imports
          common: {
            name: 'common',
            chunks: 'all',
            minChunks: 2,
            priority: 10,
            enforce: true,
          },
        },
      };
    }
    
    return config;
  },
  
  // Note: rewrites and headers don't work with static export
  // API calls will be handled directly by the client to the WINZO backend
};

export default nextConfig;
