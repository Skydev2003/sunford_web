import "server-only";
import {
  parseWarehouseProducts,
  type WarehouseItem,
} from "@/features/catalog/data/warehouse-products";

export type OfficialProduct = WarehouseItem;

export type OfficialProductListResult = {
  total_count: number;
  items: OfficialProduct[];
};

export async function getOfficialProducts(fresh = false): Promise<OfficialProductListResult> {
  const warehouseApiUrl = process.env.WAREHOUSE_API_URL;

  if (!warehouseApiUrl) {
    throw new Error("WAREHOUSE_API_URL is not configured");
  }

  const endpoint = new URL("/api/store/products", warehouseApiUrl);

  const response = await fetch(endpoint, {
    signal: AbortSignal.timeout(10000),
    cache: fresh ? "no-store" : undefined,
    next: fresh ? undefined : { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Warehouse product API failed with status ${response.status}`);
  }

  return parseWarehouseProducts(await response.json());
}
