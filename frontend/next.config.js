const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  async rewrites() {
    // Use environment variable to determine API URL
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://peykantravelistanbul.com'  // دامنه اصلی
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
      // Add specific rewrites for events and tours
      {
        source: '/api/v1/events/:path*',
        destination: `${apiUrl}/api/v1/events/:path*`,
      },
      {
        source: '/api/v1/tours/:path*',
        destination: `${apiUrl}/api/v1/tours/:path*`,
      },
    ];
  },
  // Disable trailing slash for API routes to avoid conflicts with PUT/POST requests
  trailingSlash: false,
};

module.exports = withNextIntl(nextConfig); 