import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { lanUatAddresses, nipHost } from "./scripts/lib/lan-uat.mjs";
import { contentRewrites } from "./src/features/content/data/static-content-params";
import { technicalManualRedirects } from "./src/features/content/data/technical-manuals";

const lanOrigins = lanUatAddresses(networkInterfaces()).flatMap((address) => [
  address,
  nipHost(address),
]);

const nextConfig: NextConfig = {
  async redirects() {
    return technicalManualRedirects.map(({ source, ...redirect }) => ({
      ...redirect,
      source: encodeURI(source),
    }));
  },
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
    cpus: 1,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      { pathname: "**", search: "" },
      { pathname: "/images/warehouse-cache/**" },
      { pathname: "/api/products/*/image" },
    ],
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
