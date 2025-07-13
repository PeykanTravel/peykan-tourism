const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'peykantravelistanbul.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    // Use environment variable to determine API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://peykantravelistanbul.com/api/v1';
    
    return [
      // Handle API routes with trailing slash to match Django requirements
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      // Add specific rewrites for events and tours
      {
        source: '/api/v1/events/:path*',
        destination: `${apiUrl}/events/:path*`,
      },
      {
        source: '/api/v1/tours/:path*',
        destination: `${apiUrl}/tours/:path*`,
      },
    ];
  },
  // Disable trailing slash for API routes to avoid conflicts with PUT/POST requests
  trailingSlash: false,
};

module.exports = withNextIntl(nextConfig); 