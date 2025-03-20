/** @type {import('next').NextConfig} */
const nextConfig = {
  // We're using server-side rendering with Netlify integration
  // output: "export", // This would create static HTML which we don't want

  // Disable ESLint errors during build (they'll still show as warnings)
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Disable TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },

  // Enable React strict mode for better development
  reactStrictMode: true,

  // Enable image optimization
  images: {
    unoptimized: process.env.NODE_ENV !== "production",
  },
};

module.exports = nextConfig;
