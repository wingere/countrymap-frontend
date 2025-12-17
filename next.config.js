/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'countrymap-backend-fixed-production.up.railway.app',
      'minotar.net',
      'crafatar.com',
      'mc-heads.net'
    ],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://countrymap-backend-fixed-production.up.railway.app',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://countrymap-backend-fixed-production.up.railway.app'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://countrymap-backend-fixed-production.up.railway.app'}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;