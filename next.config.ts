import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force webpack usage for build (Turbopack has symlink issues on Windows)
  webpack: (config) => {
    return config;
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Compression
  compress: true,

  // Powered by header disabled for security
  poweredByHeader: false,

  // Strict mode for development
  reactStrictMode: true,

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },
};

export default nextConfig;
