/** @type {import('next').NextConfig} */
const hasSupabasePublicEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Safe diagnostic: helps confirm Netlify build had env vars (does not print secrets).
console.log(`[build] Supabase public env present: ${hasSupabasePublicEnv}`);

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'framerusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    loader: 'default',
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;
