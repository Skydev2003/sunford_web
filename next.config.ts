import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { lanUatAddresses, nipHost } from "./scripts/lib/lan-uat.mjs";

const lanOrigins = lanUatAddresses(networkInterfaces()).map(nipHost);

const nextConfig: NextConfig = {
  devIndicators: false,
  // Exact LAN nip.io hosts supplied by npm run uat:local; no wildcard DNS access.
  allowedDevOrigins: [
    ...new Set([...lanOrigins, ...(process.env.UAT_DEV_HOSTS ?? "").split(",").filter(Boolean)]),
  ],
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
