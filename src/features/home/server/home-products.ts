import "server-only";
import { cacheLife } from "next/cache";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { warehouseCatalog } from "@/features/catalog/data/warehouse-products";
import {
  getOfficialProducts,
  savedWarehouseImage,
} from "@/features/services/warehouse-product.server";

export async function getHomeProducts() {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  const official = await getOfficialProducts();
  return warehouseCatalog(official.items, getSnapshotProducts(), savedWarehouseImage);
}
