import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/env";
import { homeImageSlots, type HomeImages } from "../data/image-slots";
import type { HomeLinkTargets } from "../data/link-targets";

export async function getHomeImages(): Promise<HomeImages> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-images");
  if (!hasDatabase()) return {};
  const images = await getPrisma().homepageImage.findMany();
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
  if (!hasDatabase()) return {};
  return Object.fromEntries(
    (await getPrisma().homepageImage.findMany())
      .filter(
        (row) =>
          homeImageSlots.some((slot) => slot.id === row.slot) &&
          (row.targetProductId || row.targetPagePath),
      )
      .map((row) => [row.slot, { productId: row.targetProductId, pagePath: row.targetPagePath }]),
  );
}
