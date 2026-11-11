import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDocuments } from "@/features/site/server/documents";
import { homeImageSlots, type HomeImages } from "../data/image-slots";
import type { HomeLinkTargets } from "../data/link-targets";
import { defaultHomePagePaths } from "../data/link-targets";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { publicPath } from "@/features/content/data/public-paths.mjs";

async function localHomeImages() {
  return (await getDocuments("homepage-image"))
    .filter((row) => !row.deletedAt)
    .map(({ id, data }) => ({
      slot: String(data.slot ?? id),
      image: typeof data.image === "string" ? data.image : "",
      targetProductId: typeof data.targetProductId === "string" ? data.targetProductId : null,
      targetPagePath: typeof data.targetPagePath === "string" ? data.targetPagePath : null,
    }));
}

export async function getHomeImages(): Promise<HomeImages> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-images");
  const images = await localHomeImages();
  return Object.fromEntries(
    images
      .filter((row) => row.image && homeImageSlots.some((slot) => slot.id === row.slot))
      .map((row) => [row.slot, row.image]),
  );
}

export async function getHomeLinkTargets(): Promise<HomeLinkTargets> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-images");
  const images = await localHomeImages();
  if (!images.length) return {};
  const targets: HomeLinkTargets = Object.fromEntries(
    images
      .filter(
        (row) =>
          homeImageSlots.some((slot) => slot.id === row.slot) &&
          (row.targetProductId || row.targetPagePath),
      )
      .map((row) => [
        row.slot,
        {
          productId: row.targetProductId,
          pagePath: row.targetPagePath ? publicPath(row.targetPagePath) : null,
        },
      ]),
  );
  const pages = await getContentPageIndex();
  homeImageSlots.forEach(({ id }) => {
    const target = targets[id];
    if (target?.productId) return;
    const path = target?.pagePath ?? (id === "spotlight" ? undefined : defaultHomePagePaths[id]);
    if (!path || ["/", "/products", "/explore"].includes(path)) return;
    const page = pages[decodeURIComponent(path).replace(/\/$/, "").toLowerCase()];
    if (!page) targets[id] = { ...target, disabled: true };
    else if (page.managed && page.path !== path) targets[id] = { ...target, pagePath: page.path };
  });
  return targets;
}
