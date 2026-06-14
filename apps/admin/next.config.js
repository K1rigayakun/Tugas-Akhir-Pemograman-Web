/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@emerald-kingdom/ui", "@emerald-kingdom/types"],
  async rewrites() {
    const apiTarget =
      process.env.NEXT_PUBLIC_API_PROXY_TARGET ||
      process.env.API_PROXY_TARGET ||
      "http://127.0.0.1:3001";

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget.replace(/\/+$/, "")}/api/:path*`,
      },
    ];
  },
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
