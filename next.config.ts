import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    agentFeedback: true,
    serverActions: { bodySizeLimit: "6mb" },
  },
  images: {
    remotePatterns: process.env.SUPABASE_URL
      ? [
          {
            protocol: "https",
            hostname: new URL(process.env.SUPABASE_URL).hostname,
            pathname: "/storage/v1/object/public/product-images/**",
            search: "",
          },
        ]
      : [],
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
