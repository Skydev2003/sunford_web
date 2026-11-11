import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";
import {
  closeWarehousePool,
  readWarehouseProducts,
  sameWarehouseImage,
  warehouseConnectionOptions,
  warehouseRows,
} from "../../src/features/services/warehouse-postgres";
import { readWarehouseStorageImage } from "../../src/features/services/warehouse-storage";

test("Warehouse configuration never falls back to CMS and enforces bounded read-only sessions", () => {
  assert.throws(
    () =>
      warehouseConnectionOptions({
        DATABASE_URL: "postgresql://cms/db",
        WAREHOUSE_COMPANY_ID: "1",
      }),
    /WAREHOUSE_DATABASE_URL/,
  );
  for (const company of ["", "0", "-1", "1;select", "9007199254740992"])
    assert.throws(
      () =>
        warehouseConnectionOptions({
          WAREHOUSE_DATABASE_URL: "postgresql://warehouse/db",
          WAREHOUSE_COMPANY_ID: company,
        }),
      /WAREHOUSE_COMPANY_ID/,
    );
  const options = warehouseConnectionOptions({
    DATABASE_URL: "postgresql://cms/db",
    WAREHOUSE_DATABASE_URL: "postgresql://warehouse/db",
    WAREHOUSE_COMPANY_ID: "1",
  });
  assert.equal(options.connectionString, "postgresql://warehouse/db");
  assert.equal(options.options, "-c default_transaction_read_only=on");
  assert.equal(options.max, 3);
  assert.equal(options.statement_timeout, 10000);
});

const row = {
  sku: "G123",
  product_name: "สินค้า",
  unit: "เครื่อง",
  sale_price: "100.25",
  master_item_id: "84",
  image_object_key: "master-item-images/1/84/photo.webp",
  image_mime_type: "image/webp",
  updated_at: "2026-11-10 04:53:04.79205+00",
  read_at: new Date("2026-11-11T01:00:00Z"),
};

test("source rows preserve exact names/units/net price and reject conflicting or invalid source values", () => {
  const data = warehouseRows([row]);
  assert.equal(data.items[0].sale_price, 100.25);
  assert.equal(data.items[0].unit, "เครื่อง");
  assert.equal(
    new URL(data.items[0].image_url!, "https://test.invalid").searchParams.get("master_item_id"),
    "84",
  );
  assert.throws(() => warehouseRows([{ ...row, sale_price: "Infinity" }]));
  assert.throws(() => warehouseRows([row, { ...row, sale_price: "101" }]));
  assert.equal(warehouseRows([{ ...row, image_object_key: null }]).items[0].image_url, null);
});

test("each direct read sees updated prices and includes zero-priced inquiry products", async () => {
  const original = { ...process.env };
  process.env.WAREHOUSE_DATABASE_URL = "postgresql://warehouse-test/db";
  process.env.WAREHOUSE_COMPANY_ID = "1";
  let price = "100.25";
  const query = mock.method(Pool.prototype, "query", (async () => ({
    rows: [{ ...row, sale_price: price }],
  })) as unknown as typeof Pool.prototype.query);
  try {
    assert.equal((await readWarehouseProducts()).items[0].sale_price, 100.25);
    price = "205.50";
    assert.equal((await readWarehouseProducts()).items[0].sale_price, 205.5);
    price = "0.00";
    assert.equal((await readWarehouseProducts()).items[0].sale_price, 0);
    assert.equal(query.mock.callCount(), 3);
    const args = query.mock.calls[0].arguments;
    assert.match(String(args[0]), /standard_sale_price >= 0/);
    assert.deepEqual(args[1], [1]);
  } finally {
    query.mock.restore();
    await closeWarehousePool();
    process.env = original;
  }
});

test("saved photos match item identity and timestamp, not just SKU or timezone formatting", () => {
  const saved = { master_item_id: "84", updated_at: "2026-11-10T04:53:04.79205+00:00" };
  const current = warehouseRows([row]).items[0].image_url;
  assert.equal(sameWarehouseImage(current, saved), true);
  assert.equal(sameWarehouseImage(current, { ...saved, master_item_id: "85" }), false);
  assert.equal(
    sameWarehouseImage(current, { ...saved, updated_at: "2026-11-11T04:53:04Z" }),
    false,
  );
  assert.equal(sameWarehouseImage(null, saved), false);
  assert.equal(sameWarehouseImage("/image?v=invalid", { ...saved, updated_at: "invalid" }), false);
});

test("storage reads GET directly, bounds images and rejects HTML or oversized content", async () => {
  const original = { ...process.env };
  Object.assign(process.env, {
    WAREHOUSE_S3_ENDPOINT: "https://storage.invalid",
    WAREHOUSE_S3_BUCKET: "photos",
    WAREHOUSE_S3_REGION: "test",
    WAREHOUSE_S3_KEY: "test-key",
    WAREHOUSE_S3_SECRET: "test-secret",
  });
  const fetcher = mock.method(
    globalThis,
    "fetch",
    async (_input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      assert.equal(init?.method, "GET");
      assert.equal(init?.redirect, "error");
      return new Response(new Uint8Array([1, 2, 3]), { headers: { "Content-Type": "image/webp" } });
    },
  );
  try {
    const image = await readWarehouseStorageImage(row.image_object_key!);
    assert.equal(image.mime, "image/webp");
    assert.equal(image.bytes.length, 3);
    await assert.rejects(() => readWarehouseStorageImage("../private"));
    fetcher.mock.mockImplementation(
      async () => new Response("html", { headers: { "Content-Type": "text/html" } }),
    );
    await assert.rejects(() => readWarehouseStorageImage(row.image_object_key!));
    fetcher.mock.mockImplementation(
      async () =>
        new Response("too big", {
          headers: { "Content-Type": "image/webp", "Content-Length": String(11 * 1024 * 1024) },
        }),
    );
    await assert.rejects(() => readWarehouseStorageImage(row.image_object_key!));
  } finally {
    fetcher.mock.restore();
    process.env = original;
  }
});

test("Warehouse retries a disconnected read once and surfaces persistent failures", async () => {
  const original = { ...process.env };
  process.env.WAREHOUSE_DATABASE_URL = "postgresql://warehouse-test/db";
  process.env.WAREHOUSE_COMPANY_ID = "1";
  let attempts = 0;
  const query = mock.method(Pool.prototype, "query", (async () => {
    attempts++;
    if (attempts === 1)
      throw Object.assign(new Error("Connection terminated unexpectedly"), { code: "ECONNRESET" });
    return { rows: [row] };
  }) as unknown as typeof Pool.prototype.query);
  try {
    assert.equal((await readWarehouseProducts()).items[0].sku, row.sku);
    assert.equal(attempts, 2);
    query.mock.mockImplementation((async () => {
      throw Object.assign(new Error("Disconnected"), { code: "ECONNRESET" });
    }) as unknown as typeof Pool.prototype.query);
    const before = query.mock.callCount();
    await assert.rejects(() => readWarehouseProducts(), /Disconnected/);
    assert.equal(query.mock.callCount() - before, 2);
    query.mock.mockImplementation((async () => {
      throw Object.assign(new Error("Schema failure"), { code: "42P01" });
    }) as unknown as typeof Pool.prototype.query);
    const schemaBefore = query.mock.callCount();
    await assert.rejects(() => readWarehouseProducts(), /Schema failure/);
    assert.equal(query.mock.callCount() - schemaBefore, 1);
  } finally {
    query.mock.restore();
    await closeWarehousePool();
    process.env = original;
  }
});
