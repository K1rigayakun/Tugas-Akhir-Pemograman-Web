/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@emerald-kingdom/ui", "@emerald-kingdom/types", "@emerald-kingdom/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "dummyimage.com" },
    ],
  },
};

export default nextConfig;
