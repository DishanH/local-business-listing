/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: '/Users/dishan-mac/Documents/dev/nextjs/local-business-listing',
  },
}

export default nextConfig
