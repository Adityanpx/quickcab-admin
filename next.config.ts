import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "*.wasabisys.com",
      },
      {
        protocol: "https",
        hostname: "s3.wasabisys.com",
      },
      {
        protocol: "https",
        hostname: "s3.ap-southeast-1.wasabisys.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
