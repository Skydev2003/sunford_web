import { createHash } from "node:crypto";
import sourcePages from "./pages.json";

// Vercel appends prerender sidecars, and Next's runtime cache URL-encodes names.
// Use bounded ASCII paths internally while rewrites preserve the public URL.
export function contentRoutePath(path: string) {
  const safe = path.split("/").every((segment) => encodeURIComponent(segment).length <= 200);
  return safe ? path : `/_content/${createHash("sha256").update(path).digest("hex")}`;
}

export const contentRewrites = sourcePages
  .filter((page) => page.kind !== "product" && contentRoutePath(page.path) !== page.path)
  .map((page) => ({ source: page.path, destination: contentRoutePath(page.path) }));

const originalPaths = new Map(
  contentRewrites.map(({ source, destination }) => [destination, source]),
);
export function resolveContentPath(path: string) {
  return originalPaths.get(path) ?? path;
}

export function staticContentParams(pages: { path: string; kind: string }[]) {
  return pages
    .filter((page) => page.path !== "/" && page.kind !== "product")
    .map((page) => ({ path: contentRoutePath(page.path).slice(1).split("/") }));
}
