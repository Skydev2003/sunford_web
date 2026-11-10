import assert from "node:assert/strict";
import test from "node:test";
import {
  approvedWarehouseMappings,
  parseWarehouseProducts,
  warehouseCatalog,
  type WarehouseItem,
} from "../../src/features/catalog/data/warehouse-products";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import { getPlatformSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { getAccessorySubcategories } from "../../src/features/catalog/data/accessory-subcategories";

const editorial = getSnapshotProducts();
const items: WarehouseItem[] = approvedWarehouseMappings.map((entry) => ({
  sku: entry.sku,
  product_name: entry.name,
  unit: "เครื่อง",
  sale_price: 100,
  image_url: null,
}));

test("only mapped G sales SKUs with unambiguous models/content are eligible", () => {
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
  assert.deepEqual(
    warehouseCatalog(
      [item],
      editorial.filter((product) => product.id !== catalog[0].id),
    ),
    [],
  );
  assert.equal(warehouseCatalog([{ ...item, sale_price: null }], editorial)[0].price, null);
  assert.equal(warehouseCatalog([{ ...item, sale_price: 0 }], editorial)[0].price, null);
});

test("a complete response validates and partial/duplicate/invalid responses fail closed", () => {
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
