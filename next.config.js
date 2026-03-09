/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  // Allow images from external sources (e.g., Google OAuth avatars)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // Increase the body size limit for file uploads (10MB)
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'sharp'],
  },

  // Webpack config to handle pdf-parse and other Node-only modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // pdf-parse uses 'fs' module which only works server-side
      config.externals = [...(config.externals || []), 'canvas', 'jsdom'];
    }
    return config;
  },
};

module.exports = nextConfig;
