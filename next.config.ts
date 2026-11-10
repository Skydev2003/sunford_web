import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { lanUatAddresses, nipHost } from "./scripts/lib/lan-uat.mjs";
import { contentRewrites } from "./src/features/content/data/static-content-params";

const lanOrigins = lanUatAddresses(networkInterfaces()).flatMap((address) => [
  address,
  nipHost(address),
]);

const nextConfig: NextConfig = {
  async rewrites() {
    return contentRewrites.map(({ source, destination }) => ({
      source: encodeURI(source),
      destination,
    }));
  },
  devIndicators: false,
  // Allow both direct LAN IPs and their UAT hostnames; keep the allowlist exact.
  allowedDevOrigins: [
    ...new Set([
      "127.0.0.1",
      ...lanOrigins,
      ...(process.env.UAT_DEV_HOSTS ?? "").split(",").filter(Boolean),
    ]),
  ],
  experimental: {
    agentFeedback: true,
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
