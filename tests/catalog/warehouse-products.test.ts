import assert from "node:assert/strict";
import test from "node:test";
import {
  approvedWarehouseMappings,
  parseWarehouseProducts,
  warehouseCatalog,
  type WarehouseItem,
} from "../../src/features/catalog/data/warehouse-products";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import snapshot from "../../data/warehouse/products.json";
import { existsSync } from "node:fs";
import path from "node:path";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import { getPlatformSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { getAccessorySubcategories } from "../../src/features/catalog/data/accessory-subcategories";

const editorial = getSnapshotProducts();

test("saved Warehouse data supplies unique public products and local images without the API", () => {
  const feed = parseWarehouseProducts(snapshot);
  assert.equal(feed.total_count, snapshot.total_count);
  assert.equal(new Set(feed.items.map((i) => i.sku)).size, feed.total_count);
  for (const item of snapshot.items) {
    if (item.localImage) {
      assert.match(
        item.localImage,
        /^\/images\/warehouse-cache\/[0-9a-f]{64}\.(?:png|jpg|webp|gif|avif)$/,
      );
      assert(existsSync(path.join(process.cwd(), "public", item.localImage)));
    }
  }
  const catalog = warehouseCatalog(feed.items, editorial);
  for (const [sku, category] of [
    ["G-SET03", "scales"],
    ["PCS60FC11NDT", "scales"],
    ["POSP1SETPCS60FC11Drawer", "pos"],
    ["RYGPole_Buzzer", "accessories"],
  ]) {
    assert.equal(catalog.find((i) => i.warehouseSku === sku)?.warehouseCategoryId, category);
  }
  assert(!catalog.find((i) => i.warehouseSku === "G-SET03")?.warehouseModelCodes?.length);
  assert.equal(catalog.find((i) => i.warehouseSku === "G-SET03")?.id, "warehouse-G-SET03");
});
const items: WarehouseItem[] = approvedWarehouseMappings.map((entry) => ({
  sku: entry.sku,
  product_name: entry.name,
  unit: "เครื่อง",
  sale_price: 100,
  image_url: null,
}));

test("only verified SKU mappings inherit legacy content and configurator codes", () => {
  assert.equal(approvedWarehouseMappings.length, 89);
  assert(
    approvedWarehouseMappings.every((item) => item.sku.startsWith("G") && item.status === "mapped"),
  );
  for (const parked of ["TMS60AW31", "G106094", "G-TF003", "G-SET03", "S000005"])
    assert(!approvedWarehouseMappings.some((item) => item.sku === parked));
});

test("API prices/identity replace old prices without reviving deleted or missing records", () => {
  const item = items.find((item) => item.sku === "G106308")!;
  const catalog = warehouseCatalog([item], editorial);
  assert.equal(catalog.length, 1);
  assert.equal(catalog[0].id, "sunford-10630");
  assert.equal(catalog[0].warehouseSku, item.sku);
  assert.equal(catalog[0].name, item.product_name);
  assert.equal(catalog[0].price, 107);
  assert.equal(catalog[0].warehouseNetUnitSatang, 10000);
  assert.equal(warehouseCatalog([{ ...item, sale_price: 200 }], editorial)[0].price, 214);
  assert.deepEqual(warehouseCatalog([], editorial), []);
  assert.equal(
    warehouseCatalog(
      [item],
      editorial.filter((product) => product.id !== catalog[0].id),
    )[0].id,
    `warehouse-${item.sku}`,
  );
  assert.equal(warehouseCatalog([{ ...item, sale_price: null }], editorial)[0].price, null);
  assert.equal(warehouseCatalog([{ ...item, sale_price: 0 }], editorial)[0].price, null);
});

test("identical records appear once; X is excluded and calibration charges remain warehouse-only", () => {
  const rows = [
    "11",
    "X001",
    "x002",
    "72",
    "Calibration Fee Type 2",
    "S000005",
    "S000006",
    "G106612",
  ].map((sku) => ({ ...items[0], sku }));
  const parsed = parseWarehouseProducts({
    total_count: rows.length + 1,
    items: [...rows, rows[0]],
  });
  assert.equal(parsed.total_count, 6);
  assert.deepEqual(
    warehouseCatalog(parsed.items, []).map((p) => p.warehouseSku),
    ["11", "G106612"],
  );
});
test("a complete response validates and partial/conflicting/invalid responses fail closed", () => {
  const item = items[0];
  assert.deepEqual(parseWarehouseProducts({ total_count: 1, items: [item] }).items, [item]);
  for (const invalid of [
    null,
    {},
    { total_count: 2, items: [item] },
    { total_count: 2, items: [item, { ...item, sku: item.sku.toLowerCase() }] },
    ...[NaN, Infinity, -1, "100"].map((sale_price) => ({
      total_count: 1,
      items: [{ ...item, sale_price }],
    })),
    { total_count: 1, items: [{ ...item, unit: "" }] },
  ])
    assert.throws(() => parseWarehouseProducts(invalid));
});

test("all five category projections contain only actual mapped products", () => {
  const products = warehouseCatalog(items, editorial);
  assert.equal(products.length, 89);
  for (const getGroups of [
    getScaleSubcategories,
    getIndicatorSubcategories,
    getPlatformSubcategories,
    getPosSubcategories,
    getAccessorySubcategories,
  ]) {
    const groups = getGroups(products);
    assert(groups.some((group) => group.productIds.length));
    for (const group of groups) {
      const expected = products
        .filter((product) => product.warehouseSubcategoryIds?.includes(group.id))
        .map((product) => product.id);
      assert.deepEqual(group.productIds, expected);
      assert(
        group.entries?.every((entry) => entry.productId && expected.includes(entry.productId)),
      );
    }
  }
});

test("configurator options bind exact Warehouse models and complete kits", () => {
  const options = getWeighingOptions(warehouseCatalog(items, editorial));
  assert(options.every((option) => option.sku?.startsWith("G") && option.productId));
  assert.equal(options.find((option) => option.code === "Indicator-AW31")?.sku, "G107770");
  const kit = options.find((option) => option.code === "TMS-60-AW31");
  assert.equal(kit?.sku, "G106308");
  assert.equal(kit?.includesHead, true);
  assert.equal(kit?.price, 107);
  assert(!options.some((option) => option.code === "CableConnector"));
});
