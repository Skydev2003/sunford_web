import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/env";
import { homeImageSlots, type HomeImages } from "../data/image-slots";

export async function getHomeImages(): Promise<HomeImages> {
  "use cache";
  cacheLife("hours");
  cacheTag("home-images");
  if (!hasDatabase()) return {};
  const images = await getPrisma().homepageImage.findMany();
  return Object.fromEntries(
    images
      .filter((row) => homeImageSlots.some((slot) => slot.id === row.slot))
      .map((row) => [row.slot, row.image]),
  );
}
