import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { lanUatAddresses, nipHost } from "./scripts/lib/lan-uat.mjs";
import { contentRewrites } from "./src/features/content/data/static-content-params";
import { contactPath, legacyContactPath } from "./src/features/content/data/contact-route";
import { technicalManualRedirects } from "./src/features/content/data/technical-manuals";
import {
  legacyScaleOverviewPaths,
  mainPageRedirects,
  sectionPageRedirects,
} from "./src/features/site/data/main-page-paths";
import importedProductImageAliases from "./src/features/content/data/imported-product-image-aliases.json";

const lanOrigins = lanUatAddresses(networkInterfaces()).flatMap((address) => [
  address,
  nipHost(address),
]);

const nextConfig: NextConfig = {
  async redirects() {
    return [
      ...mainPageRedirects.map((redirect) => ({
        ...redirect,
        permanent: true,
        // Keep legacy scale selections available to Proxy so it can remove consumed filters.
        ...(legacyScaleOverviewPaths.includes(redirect.source) && {
          missing: [{ type: "query" as const, key: "subcategory" }],
        }),
      })),
      {
        source: "/Indicator",
        destination: "/platforms/indicators",
        permanent: true,
      },
      { source: legacyContactPath, destination: contactPath, permanent: false },
      ...technicalManualRedirects.map(({ source, ...redirect }) => ({
        ...redirect,
        source: encodeURI(source),
      })),
      ...sectionPageRedirects.map((redirect) => ({ ...redirect, permanent: true })),
    ];
  },
  async rewrites() {
    return [
      ...contentRewrites.map(({ source, destination }) => ({
        source: encodeURI(source),
        destination,
      })),
      // Return image bytes at legacy URLs so Next's image optimizer can still read them.
      ...Object.entries(importedProductImageAliases).map(([source, destination]) => ({
        source: `/images/imported/${source}`,
        destination: `/images/imported/${destination}`,
      })),
    ];
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
    cpus: 2,
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
