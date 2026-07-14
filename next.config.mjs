/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable cacheComponents to allow dynamic routes with Supabase
  // cacheComponents conflicts with export const dynamic = 'force-dynamic'
  cacheComponents: false,

  experimental: {
    // Next.js 16 (Turbopack): persist the module graph to disk so warm
    // dev restarts are much faster.
    turbopackFileSystemCacheForDev: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.parqet.com',
      }
    ],
  }
};

export default nextConfig;

