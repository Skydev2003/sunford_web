import { createHash } from "node:crypto";
import sourcePages from "./pages.json";
import { publicPath } from "./public-paths.mjs";

export function contentRoutePath(path: string) {
  const canonical = publicPath(path);
  const safe = canonical
    .split("/")
    .every((segment: string) => encodeURIComponent(segment).length <= 200);
  return safe ? canonical : `/_content/${createHash("sha256").update(canonical).digest("hex")}`;
}

export const contentRewrites = sourcePages
  .filter((page) => page.kind !== "product" && contentRoutePath(page.path) !== page.path)
  .map((page) => ({ source: page.path, destination: contentRoutePath(page.path) }));

const originalPaths = new Map(
  contentRewrites.map(({ source, destination }) => [destination, source]),
);
for (const page of sourcePages) {
  const original = decodeURIComponent(new URL(page.sourceUrl).pathname);
  if (original.split("/").some((segment) => encodeURIComponent(segment).length > 200))
    originalPaths.set(
      `/_content/${createHash("sha256").update(original).digest("hex")}`,
      page.path,
    );
}
export function resolveContentPath(path: string) {
  return publicPath(originalPaths.get(path) ?? path);
}

export function staticContentParams(pages: { path: string; kind: string }[]) {
  return pages
    .filter((page) => page.path !== "/" && page.kind !== "product")
    .map((page) => ({ path: contentRoutePath(page.path).slice(1).split("/") }));
}
