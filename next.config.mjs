/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Disable cacheComponents - it conflicts with Supabase cookies()
  // We'll use traditional ISR with revalidate instead
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
    // Re-enabled: this was disabling resizing/WebP-AVIF conversion/responsive
    // srcset for every image on the site (a major cause of slow page loads,
    // especially on mobile). Amplify's Next.js SSR hosting supports the
    // built-in image optimizer, so there's no deployment reason to skip it.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'logo.clearbit.com',
      },
      {
        protocol: 'https',
        hostname: 'assets.parqet.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        // Supabase Storage-hosted business photos (uploaded by owners).
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  }
};

export default nextConfig;

