/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  devIndicators: false,
  images: { formats: ['image/avif', 'image/webp'] },
  async redirects() {
    return [
      { source: '/ai-innovations', destination: '/playground', permanent: true },
      { source: '/ai', destination: '/playground', permanent: true },
    ]
  },
}
export default nextConfig
