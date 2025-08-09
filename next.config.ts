/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "loved-ducks-790a0f88b6.media.strapiapp.com",
      "loved-ducks-790a0f88b6.strapiapp.com",
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
