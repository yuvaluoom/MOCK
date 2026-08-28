const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // typedRoutes disabled during development — re-enable when all routes are stable
  // experimental: { typedRoutes: true },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google profile images
      },
    ],
  },
  // output: 'standalone', // Enable for Docker/ECS deployment
};

module.exports = withNextIntl(nextConfig);
