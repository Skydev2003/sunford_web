import "server-only";
import snapshot from "../../../data/warehouse/products.json";
import {
  parseWarehouseProducts,
  type WarehouseItem,
} from "@/features/catalog/data/warehouse-products";

export type OfficialProduct = WarehouseItem;

export type OfficialProductListResult = {
  total_count: number;
  items: OfficialProduct[];
  capturedAt?: string;
};

const saved = { ...parseWarehouseProducts(snapshot), capturedAt: snapshot.capturedAt };
const savedImages = new Map(snapshot.items.map((item) => [item.sku, item]));

export function savedWarehouseImage(item: WarehouseItem) {
  const cached = savedImages.get(item.sku);
  if (!cached?.localImage || !item.image_url) return null;
  const source = new URL(item.image_url, "http://warehouse.local");
  return cached.image_url === source.pathname + source.search ? cached.localImage : null;
}

export async function getOfficialProducts(fresh = false): Promise<OfficialProductListResult> {
  const warehouseApiUrl = process.env.WAREHOUSE_API_URL;

  if (!warehouseApiUrl) {
    return saved;
  }

  const endpoint = new URL("/api/store/products", warehouseApiUrl);

  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(10000),
    cache: fresh ? "no-store" : undefined,
    next: fresh ? undefined : { revalidate: 60 },
  }).catch(() => null);

  if (!response || response.status >= 500) return saved;

  if (!response.ok) {
    throw new Error(`Warehouse product API failed with status ${response.status}`);
  }

  return parseWarehouseProducts(await response.json());
}
