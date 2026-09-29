/** @type {import('next').NextConfig} */
const nextConfig = {
  // ─── Output ──────────────────────────────────────────────────────────────
  // Keep default (server) for Vercel — no 'export' mode with dynamic routes
  // output: 'standalone',  // Uncomment if self-hosting with Docker

  // ─── Experimental ────────────────────────────────────────────────────────
  experimental: {
    // Server Actions are stable in Next.js 14 — no flag needed
  },

  // ─── Images ──────────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.pexels.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },

  // ─── TypeScript / ESLint ─────────────────────────────────────────────────
  // During Vercel builds, ignore type errors that are caught in CI separately
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ─── Webpack ─────────────────────────────────────────────────────────────
  webpack: (config, { isServer }) => {
    // Prisma: exclude server-side native modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // ─── Headers ─────────────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL || '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },

  // ─── Redirects ───────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect bare /admin to /admin/dashboard
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
