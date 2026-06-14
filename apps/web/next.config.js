/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@emerald-kingdom/ui", "@emerald-kingdom/types", "@emerald-kingdom/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
    ],
  },
};

module.exports = nextConfig;
