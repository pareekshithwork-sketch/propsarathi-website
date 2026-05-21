/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // firebase-admin uses Node.js native modules — tell Next.js not to bundle it
  serverExternalPackages: ['firebase-admin'],
}

export default nextConfig
