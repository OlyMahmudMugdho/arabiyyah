import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["typeorm", "pg", "cloudinary"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/**": [
      "./node_modules/pg/**/*",
      "./node_modules/pg-pool/**/*",
      "./node_modules/pg-protocol/**/*",
      "./node_modules/pg-types/**/*",
    ],
  },
};

export default nextConfig;
