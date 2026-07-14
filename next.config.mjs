/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Next.js 16: opt-in to the new caching model.
  // With this flag, all rendering is dynamic by default.
  // Pages/components/functions must explicitly use the "use cache" directive
  // (with optional cacheTag / cacheLife calls) to be cached.
  cacheComponents: true,

  experimental: {
    // Next.js 16 (Turbopack): persist the module graph to disk so warm
    // dev restarts are much faster.
    turbopackFileSystemCacheForDev: true,
  },

  images: {
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

