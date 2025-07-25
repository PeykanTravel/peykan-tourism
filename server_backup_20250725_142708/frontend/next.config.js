const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      // Handle API routes with trailing slash to match Django requirements
      {
        source: '/api/v1/:path*',
        destination: 'http://167.235.140.125:8000/api/v1/:path*/',
      },
      {
        source: '/api/:path*',
        destination: 'http://167.235.140.125:8000/api/:path*/',
      },
    ];
  },
  // Disable trailing slash for API routes to avoid conflicts with PUT/POST requests
  trailingSlash: false,
};

module.exports = withNextIntl(nextConfig); 