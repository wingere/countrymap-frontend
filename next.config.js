/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'countrymap.herokuapp.com',
      'minotar.net',
      'crafatar.com',
      'mc-heads.net'
    ],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://countrymap.herokuapp.com',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://countrymap.herokuapp.com'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://countrymap.herokuapp.com'}/api/:path*`
      }
    ];
  }
};

module.exports = nextConfig;