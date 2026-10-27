import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { lanUatAddresses, nipHost } from "./scripts/lib/lan-uat.mjs";
import { contentRewrites } from "./src/features/content/data/static-content-params";

const lanOrigins = lanUatAddresses(networkInterfaces()).map(nipHost);

const nextConfig: NextConfig = {
  async rewrites() {
    return contentRewrites.map(({ source, destination }) => ({
      source: encodeURI(source),
      destination,
    }));
  },
  devIndicators: false,
  // Exact LAN nip.io hosts supplied by npm run uat:local; no wildcard DNS access.
  allowedDevOrigins: [
    ...new Set([...lanOrigins, ...(process.env.UAT_DEV_HOSTS ?? "").split(",").filter(Boolean)]),
  ],
  experimental: {
    agentFeedback: true,
    serverActions: { bodySizeLimit: 4_400_000 },
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
