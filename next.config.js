/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Static export for Netlify
  images: {
    unoptimized: true, // Required for static export
  },
  // Disable server-side features that aren't compatible with static export
  trailingSlash: true,
};

module.exports = nextConfig;
