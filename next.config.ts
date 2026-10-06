import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 80, 85],
    localPatterns: [
      { pathname: "/assets/**", search: "" },
      { pathname: "/api/product-images/**", search: "" },
    ],
    // Uploaded photos rarely change once posted; deletes remove the source anyway.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
