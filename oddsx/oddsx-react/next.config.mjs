/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static exports for Netlify deployment
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  
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
  
  // Note: rewrites and headers don't work with static export
  // API calls will be handled directly by the client to the WINZO backend
};

export default nextConfig;
