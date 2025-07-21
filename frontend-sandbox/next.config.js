const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' }
    ],
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
    bundlePagesExternals: true,
  },
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }
    return config;
  },
  async rewrites() {
    // Use environment variable to determine API URL
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://peykantravelistanbul.com'  // دامنه اصلی
      : 'http://localhost:8000'; // Local development
    
    return [
      // Health check endpoint - explicit handling
      {
        source: '/api/v1/health',
        destination: `${apiUrl}/api/v1/health/`,
      },
      {
        source: '/api/v1/health/',
        destination: `${apiUrl}/api/v1/health/`,
      },
      // All other API routes - preserve trailing slashes
      {
        source: '/api/v1/:path*',
        destination: `${apiUrl}/api/v1/:path*`,
      },
      // Legacy API routes
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Disable trailing slash to avoid conflicts with API routes
  trailingSlash: false,
};

module.exports = withNextIntl(nextConfig); 