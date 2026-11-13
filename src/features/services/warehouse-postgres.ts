import { Pool, type PoolConfig, type QueryResultRow } from "pg";
import type { WarehouseCardFact } from "../catalog/data/warehouse-card-data";
import { parseWarehouseProducts } from "../catalog/data/warehouse-products";

export function warehouseConnectionOptions(
  env: Record<string, string | undefined> = process.env,
): PoolConfig {
  const connectionString = env.WAREHOUSE_DATABASE_URL?.trim();
  const company = env.WAREHOUSE_COMPANY_ID ?? "";
  if (!connectionString || !/^postgres(?:ql)?:\/\//.test(connectionString))
    throw new Error("Configure WAREHOUSE_DATABASE_URL separately from CMS DATABASE_URL");
  if (!/^[1-9]\d*$/.test(company) || !Number.isSafeInteger(Number(company)))
    throw new Error("Configure a positive WAREHOUSE_COMPANY_ID");
  return {
    connectionString,
    max: 3,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    statement_timeout: 10000,
    options: "-c default_transaction_read_only=on",
    application_name: "sunford_web_warehouse",
  };
}

const shared = globalThis as unknown as { warehousePool?: Pool; warehousePoolUrl?: string };
export function getWarehousePool(): Pool {
  const options = warehouseConnectionOptions();
  if (!shared.warehousePool || shared.warehousePoolUrl !== options.connectionString) {
    const previous = shared.warehousePool;
    shared.warehousePool = new Pool(options);
    shared.warehousePoolUrl = options.connectionString;
    shared.warehousePool.on("error", () => console.error("Warehouse database connection failed"));
    if (previous) void previous.end().catch(() => {});
  }
  return shared.warehousePool;
}

export async function closeWarehousePool() {
  const pool = shared.warehousePool;
  shared.warehousePool = undefined;
  shared.warehousePoolUrl = undefined;
  await pool?.end();
}

async function queryWarehouse<Row extends QueryResultRow>(sql: string, values: unknown[]) {
  try {
    return await getWarehousePool().query<Row>(sql, values);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    const disconnected =
      ["ECONNRESET", "ETIMEDOUT", "EPIPE", "08006", "57P01"].includes(String(code)) ||
      (error instanceof Error &&
        /^Connection terminated|^timeout exceeded when trying to connect/i.test(error.message));
    if (!disconnected) throw error;
    return getWarehousePool().query<Row>(sql, values);
  }
}

type ItemRow = {
  description?: string | null;
  group_name?: string | null;
  usage_family?: string | null;
  sku: string;
  product_name: string;
  product_short_name: string | null;
  unit: string;
  sale_price: string;
  master_item_id: string;
  image_object_key: string | null;
  image_mime_type: string | null;
  updated_at: string;
  read_at: Date;
};

type RpcRow = ItemRow & {
  image_size_bytes?: number | null;
  specifications: Omit<WarehouseCardFact, "sku">[];
  components: { sku: string; quantity: string }[];
};

async function readWarehouseRpc(skus: string[] | null = null) {
  const result = await queryWarehouse<RpcRow>(
    "select * from ecommerce.get_website_products($1::bigint, $2::text[])",
    [Number(process.env.WAREHOUSE_COMPANY_ID), skus],
  );
  for (const row of result.rows) {
    if (
      !Object.hasOwn(row, "product_short_name") ||
      (row.product_short_name !== null &&
        (typeof row.product_short_name !== "string" ||
          !row.product_short_name.trim() ||
          row.product_short_name !== row.product_short_name.trim()))
    )
      throw new Error("Invalid Warehouse RPC short name");
    if (typeof row.sale_price !== "string" || !row.sale_price.trim())
      throw new Error("Invalid Warehouse RPC price");
    if (!Array.isArray(row.specifications) || !Array.isArray(row.components))
      throw new Error("Invalid Warehouse RPC collections");
    for (const fact of row.specifications) {
      if (
        !fact ||
        !Object.hasOwn(fact, "value_options") ||
        typeof fact.title !== "string" ||
        (fact.value_text !== null && typeof fact.value_text !== "string") ||
        (fact.value_number !== null &&
          (typeof fact.value_number !== "string" ||
            !fact.value_number.trim() ||
            !Number.isFinite(Number(fact.value_number)))) ||
        (fact.unit !== null && typeof fact.unit !== "string")
      )
        throw new Error("Invalid Warehouse RPC specification");
    }
    for (const component of row.components) {
      if (
        !component ||
        typeof component.sku !== "string" ||
        !component.sku.trim() ||
        typeof component.quantity !== "string" ||
        !component.quantity.trim() ||
        !Number.isFinite(Number(component.quantity))
      )
        throw new Error("Invalid Warehouse RPC component");
    }
  }
  return result.rows;
}

function rpcFacts(rows: RpcRow[]): WarehouseCardFact[] {
  return rows.flatMap((row) =>
    row.specifications.map((fact) => ({
      sku: row.sku,
      title: fact.title,
      value_text: fact.value_text,
      value_number: fact.value_number,
      value_options: fact.value_options,
      unit: fact.unit,
    })),
  );
}

function rpcComponents(rows: RpcRow[]) {
  return rows.flatMap((row) =>
    row.components.map((component) => ({
      root_sku: row.sku,
      sku: component.sku,
      quantity: component.quantity,
    })),
  );
}

export function warehouseRows(rows: ItemRow[]) {
  return parseWarehouseProducts({
    total_count: rows.length,
    items: rows.map((row) => ({
      sku: row.sku,
      product_name: row.product_name,
      product_short_name: row.product_short_name,
      description: row.description,
      group_name: row.group_name,
      usage_family: row.usage_family,
      unit: row.unit,
      sale_price: Number(row.sale_price),
      image_url: warehouseImageUrl(row),
    })),
  });
}

export function warehouseImageUrl(
  row: Pick<ItemRow, "master_item_id" | "updated_at" | "image_object_key">,
) {
  return row.image_object_key
    ? "/api/store/products/image?" +
        new URLSearchParams({ master_item_id: row.master_item_id, v: row.updated_at })
    : null;
}

export async function readWarehouseProducts() {
  const rows = await readWarehouseRpc();
  const feed = warehouseRows(rows);
  const skus = new Set(feed.items.map((item) => item.sku));
  const retained = rows.filter((row) => skus.has(row.sku));
  return {
    ...feed,
    facts: rpcFacts(retained),
    components: rpcComponents(retained),
    readAt: (rows[0]?.read_at ?? new Date()).toISOString(),
  };
}

export async function readWarehouseCardFacts(skus: string[]): Promise<WarehouseCardFact[]> {
  if (!skus.length) return [];
  return rpcFacts(await readWarehouseRpc(skus));
}

export async function readWarehouseComponents(skus: string[]) {
  if (!skus.length) return [];
  return rpcComponents(await readWarehouseRpc(skus));
}

export async function readWarehouseImage(sku: string) {
  const rows = await readWarehouseRpc([sku]);
  if (rows.length > 1) throw new Error("Conflicting Warehouse SKU");
  const row = rows[0];
  if (!row?.image_object_key) return null;
  if (
    !row.image_object_key.startsWith(
      `master-item-images/${process.env.WAREHOUSE_COMPANY_ID}/${row.master_item_id}/`,
    )
  )
    throw new Error("Unexpected Warehouse image key");
  return row;
}

export type WarehouseCachedImage = {
  sku: string;
  master_item_id: string;
  updated_at: string;
  local_image: string;
};

export function sameWarehouseImage(
  current: string | null,
  saved: Pick<WarehouseCachedImage, "master_item_id" | "updated_at">,
): boolean {
  if (!current) return false;
  const a = new URL(current, "https://warehouse.invalid");
  const av = Date.parse(a.searchParams.get("v") ?? "");
  const bv = Date.parse(saved.updated_at);
  const id = a.searchParams.get("master_item_id");
  return (
    id !== null &&
    /^[1-9]\d*$/.test(id) &&
    id === saved.master_item_id &&
    Number.isFinite(av) &&
    av === bv
  );
}
