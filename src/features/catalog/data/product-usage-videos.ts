import catalog from "./product-usage-videos.json";
import { productSources } from "./product-sources";
import type { Product } from "../types";

export const productVideoCatalog = catalog;
export type ProductUsageVideo = Omit<(typeof catalog.videos)[number], "sourceIds">;

export function getProductUsageVideos(
  product: Pick<Product, "id" | "slug" | "sourceId">,
): ProductUsageVideo[] {
  const sourceId =
    product.sourceId ??
    productSources[product.id]?.split("/").at(-1) ??
    (product.id.startsWith("sunford-") ? product.id.slice("sunford-".length) : undefined);
  if (!sourceId) return [];
  return catalog.videos
    .filter((video) => video.sourceIds.includes(sourceId))
    .map(({ id, title, url, duration, image, note, kind }) => ({
      id,
      title,
      url,
      duration,
      image,
      note,
      kind,
    }));
}
