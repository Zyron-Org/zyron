const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow HMR WebSocket connections from any host (needed for VPS remote dev)
  allowedDevOrigins: ['*'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@farcaster/mini-app-solana': path.resolve(__dirname, 'lib/empty-module.js'),
    };
    return config;
  },
};

module.exports = nextConfig;
