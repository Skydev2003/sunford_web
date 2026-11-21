import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { parsePublishedScales } from "../data/scale-showcase";
import { readPublishedScaleShelf } from "@/features/services/warehouse-postgres";

export const featuredScalesTag = "published-featured-scales";
async function readCachedScaleShelf() {
  "use cache";
  cacheLife({ stale: 0, revalidate: 60, expire: 86400 });
  cacheTag(featuredScalesTag);
  return parsePublishedScales(await readPublishedScaleShelf());
}

export async function getPublishedScaleShelf() {
  if (process.env.FEATURED_SCALES_ENABLED !== "1") return undefined;
  try {
    return await readCachedScaleShelf();
  } catch {
    // A failed cold read hides this shelf without replacing a previously cached publication.
    console.error("Published scale shelf unavailable");
    return [];
  }
}
