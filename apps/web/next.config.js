/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@emerald-kingdom/ui", "@emerald-kingdom/types"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
    ],
  },
};

module.exports = nextConfig;
