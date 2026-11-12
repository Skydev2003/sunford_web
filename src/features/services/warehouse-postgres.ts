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

const fromItems = `
  from master_data.master_item item
  join master_data.master_unit unit
    on unit.master_unit_id = item.base_master_unit_id
   and unit.is_deleted = false
  where item.master_company_id = $1
    and item.is_deleted = false
    and item.is_active = true
    and item.is_saleable = true
    and item.standard_sale_price >= 0`;

type ItemRow = {
  description?: string | null;
  group_name?: string | null;
  usage_family?: string | null;
  sku: string;
  product_name: string;
  unit: string;
  sale_price: string;
  master_item_id: string;
  image_object_key: string | null;
  image_mime_type: string | null;
  updated_at: string;
  read_at: Date;
};

export function warehouseRows(rows: ItemRow[]) {
  return parseWarehouseProducts({
    total_count: rows.length,
    items: rows.map((row) => ({
      sku: row.sku,
      product_name: row.product_name,
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
  const result = await queryWarehouse<ItemRow>(
    `select item.item_code as sku, item.item_name as product_name, item.item_description as description, unit.unit_name as unit,
      (select g.item_group_name from master_data.master_item_group g where g.master_company_id=item.master_company_id and g.master_item_group_id=item.master_item_group_id and not g.is_deleted) as group_name,
      (select t.item_usage_family from master_data.master_item_type t where t.master_company_id=item.master_company_id and t.master_item_type_id=item.master_item_type_id and not t.is_deleted) as usage_family,
      item.standard_sale_price::text as sale_price, item.master_item_id::text,
      item.image_object_key, item.image_mime_type, item.updated_at::text,
      statement_timestamp() as read_at ${fromItems}
      order by item.item_code, item.master_item_id`,
    [Number(process.env.WAREHOUSE_COMPANY_ID)],
  );
  return {
    ...warehouseRows(result.rows),
    readAt: (result.rows[0]?.read_at ?? new Date()).toISOString(),
  };
}

export async function readWarehouseCardFacts(skus: string[]): Promise<WarehouseCardFact[]> {
  if (!skus.length) return [];
  const result = await queryWarehouse<WarehouseCardFact>(
    `select item.item_code as sku, attribute.title, fact.value_text,
      fact.value_number::text, fact.value_options, attribute.unit
     from master_data.ai_products product
     join master_data.master_item item on item.master_item_id = product.master_item_id
       and item.master_company_id = product.master_company_id
     join master_data.ai_product_facts fact on fact.product_id = product.id
       and fact.master_company_id = product.master_company_id
     join master_data.ai_attributes attribute on attribute.id = fact.attribute_id
       and attribute.master_company_id = product.master_company_id
     where product.master_company_id = $1 and product.is_active = true
       and attribute.is_active = true and fact.verification = 'verified'
       and item.is_deleted = false and item.item_code = any($2::text[])
     order by item.item_code, attribute.title, attribute.id`,
    [Number(process.env.WAREHOUSE_COMPANY_ID), skus],
  );
  return result.rows;
}

export async function readWarehouseComponents(skus: string[]) {
  if (!skus.length) return [];
  const result = await queryWarehouse<{
    root_sku: string;
    sku: string;
    quantity: string;
  }>(
    `select root.item_code as root_sku, component.item_code as sku, line.quantity::text
 from master_data.master_item_component_line line
 join master_data.master_item root on root.master_item_id=line.root_master_item_id and root.master_company_id=line.master_company_id
 join master_data.master_item component on component.master_item_id=line.component_master_item_id and component.master_company_id=line.master_company_id
 where line.master_company_id=$1 and not line.is_deleted and not root.is_deleted
 and not component.is_deleted and root.item_code=any($2::text[])`,
    [Number(process.env.WAREHOUSE_COMPANY_ID), skus],
  );
  return result.rows;
}

export async function readWarehouseImage(sku: string) {
  const result = await queryWarehouse<ItemRow>(
    `select item.item_code as sku, item.master_item_id::text, item.image_object_key,
      item.image_mime_type, item.updated_at::text ${fromItems} and item.item_code = $2 limit 2`,
    [Number(process.env.WAREHOUSE_COMPANY_ID), sku],
  );
  if (result.rows.length > 1) throw new Error("Conflicting Warehouse SKU");
  const row = result.rows[0];
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
