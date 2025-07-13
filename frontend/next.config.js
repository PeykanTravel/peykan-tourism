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
    // Use environment variable to determine API URL
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'http://backend:8000'  // Docker service name
      : 'http://localhost:8000'; // Local development
    
    return [
      // Handle API routes with trailing slash to match Django requirements
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Disable trailing slash for API routes to avoid conflicts with PUT/POST requests
  trailingSlash: false,
};

module.exports = withNextIntl(nextConfig); 