import "server-only";
import imageCache from "../../../data/warehouse/images.json";
import type { WarehouseItem } from "@/features/catalog/data/warehouse-products";
import { sameWarehouseImage } from "./warehouse-postgres";

export { readWarehouseProducts as getOfficialProducts } from "./warehouse-postgres";

const images = new Map(imageCache.items.map((item) => [item.sku, item]));

export function savedWarehouseImage(item: Pick<WarehouseItem, "sku" | "image_url">) {
  const saved = images.get(item.sku);
  return saved && sameWarehouseImage(item.image_url, saved) ? saved.local_image : null;
}
