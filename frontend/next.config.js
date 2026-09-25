/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow HMR WebSocket connections from any host (needed for VPS remote dev)
  allowedDevOrigins: ['*'],
};

module.exports = nextConfig;
