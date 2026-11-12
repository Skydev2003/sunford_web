import test from "node:test";
import assert from "node:assert/strict";
import { warehouseStorefrontProducts } from "../../src/features/catalog/data/warehouse-storefront-selection";
import selection from "../../src/features/catalog/data/warehouse-storefront-selection.json";
import { warehouseCatalog } from "../../src/features/catalog/data/warehouse-products";
import { warehouseDetailProduct } from "../../src/features/catalog/data/warehouse-detail-data";
import {
  clientProductData,
  productCardData,
} from "../../src/features/catalog/data/client-products";
import { findCatalogProduct } from "../../src/features/catalog/data/product-lookup";
import { pricedProducts } from "../../src/features/catalog/data/quotation";

function liveProduct(sku: string, price = 100) {
  return warehouseDetailProduct(
    warehouseCatalog(
      [
        {
          sku,
          product_name: `SUNFORD เครื่องชั่ง รุ่นเต็ม ${sku}`,
          unit: "เครื่อง",
          sale_price: price,
          image_url: null,
          description: "คำอธิบายจริงจาก Warehouse",
        },
      ],
      [],
    )[0],
  );
}

test("saved selection is exactly five NAV families with unique identities and no commercial snapshots", () => {
  assert.equal(selection.items.length, 547);
  assert.equal(selection.source.sheets.length, 5);
  assert.deepEqual([...new Set(selection.items.map((item) => item.categoryId))].sort(), [
    "accessories",
    "indicators",
    "platforms",
    "pos",
    "scales",
  ]);
  assert.equal(new Set(selection.items.map((item) => item.sku.toUpperCase())).size, 547);
  assert.equal(new Set(selection.items.map((item) => item.masterItemId)).size, 547);
  for (const item of selection.items) {
    assert.deepEqual(Object.keys(item).sort(), ["categoryId", "masterItemId", "name", "sku"]);
  }
  assert.equal(selection.items.find((item) => item.sku === "G-MK013")?.name, "KAH5000S");
  assert.equal(selection.items.find((item) => item.sku === "G107527")?.name, "FCS 3040");
});

test("selected names survive cards, client search data and repeated detail projection", () => {
  for (const categoryId of ["scales", "indicators", "platforms", "pos", "accessories"]) {
    const entry = selection.items.find((item) => item.categoryId === categoryId)!;
    const source = liveProduct(entry.sku);
    const before = structuredClone(source);
    const [product] = warehouseStorefrontProducts([source], "1");
    const detail = warehouseDetailProduct(warehouseDetailProduct(product));
    assert.equal(detail.name, entry.name);
    assert.equal(productCardData(product).name, entry.name);
    assert.equal(clientProductData(detail).name, entry.name);
    assert.equal(clientProductData(product).warehouseName, source.warehouseName);
    assert.equal(product.warehouseCategoryId, categoryId);
    assert.equal(product.category, categoryId);
    assert.deepEqual(source, before, "selection must not mutate the shared source/home product");
  }
});

test("live public products outside Excel remain searchable and routable under their real source name", () => {
  const included = liveProduct("G-MK013");
  const additional = { ...liveProduct("NOT-IN-THE-FIVE-SHEETS"), name: "Old display label" };
  const before = structuredClone(additional);
  const catalog = warehouseStorefrontProducts([included, additional], "1");
  assert.deepEqual(
    catalog.map((product) => product.warehouseSku),
    ["G-MK013", "NOT-IN-THE-FIVE-SHEETS"],
  );
  const product = findCatalogProduct(catalog, additional.warehouseSku!)!;
  assert.equal(findCatalogProduct(catalog, additional.slug), product);
  assert.equal(product.name, additional.warehouseName);
  assert.equal(productCardData(product).name, additional.warehouseName);
  assert.equal(clientProductData(warehouseDetailProduct(product)).name, additional.warehouseName);
  assert.equal(product.warehouseCategoryId, additional.warehouseCategoryId);
  assert.deepEqual(additional, before);
  assert.equal(findCatalogProduct(catalog, included.slug)?.warehouseSku, "G-MK013");
  assert.deepEqual(warehouseStorefrontProducts([], "1"), []);
});

test("X, calibration and legacy-only records stay hidden even without the Excel inclusion restriction", () => {
  const base = liveProduct("G-MK013");
  const hidden = ["X000000", "x-local", "72", "Calibration Fee Type 2", "S000005", "S000006"].map(
    (sku) => ({ ...base, id: sku, slug: `warehouse-${sku}`, warehouseSku: sku }),
  );
  const legacy = { ...base, id: "legacy-only", slug: "legacy-only", warehouseSku: undefined };
  assert.deepEqual(warehouseStorefrontProducts([...hidden, legacy], "1"), []);
  const catalog = warehouseStorefrontProducts([base, ...hidden, legacy], "1");
  assert.equal(catalog.length, 1);
  for (const product of [...hidden, legacy]) {
    assert.equal(findCatalogProduct(catalog, product.slug), undefined);
  }
});

test("selection changes only names and taxonomy, preserving live facts, missing photos and VAT", () => {
  const source = {
    ...liveProduct("G-MK013", 123.45),
    warehouseSpecifications: [{ label: "พิกัด", value: "5 kg" }],
    warehouseComponents: [{ sku: "LIVE-COMPONENT", quantity: 2 }],
  };
  const [selected] = warehouseStorefrontProducts([source], "1");
  const { name, storefrontName, category, warehouseCategoryId, warehouseSubcategoryIds, ...facts } =
    selected;
  const {
    name: originalName,
    category: originalCategory,
    warehouseCategoryId: originalFamily,
    warehouseSubcategoryIds: originalChildren,
    ...originalFacts
  } = source;
  assert.ok(name && storefrontName && category && warehouseCategoryId);
  assert.deepEqual(warehouseSubcategoryIds, source.warehouseSubcategoryIds);
  assert.ok(originalName && originalCategory);
  assert.equal(originalFamily, "scales");
  assert.deepEqual(originalChildren, warehouseSubcategoryIds);
  assert.deepEqual(facts, originalFacts);
  assert.equal(selected.image, "");
  assert.deepEqual(
    pricedProducts([selected]).map((item) => item.unitSatang),
    [12345],
  );
  assert.equal(selected.price, 132.09);
  const [inquiry] = warehouseStorefrontProducts([liveProduct("G-MK013", 0)], "1");
  assert.equal(inquiry.price, null);
  assert.equal(inquiry.warehouseNetUnitSatang, 0);
});

test("owner primary categories discard incompatible children and retain supported matching children", () => {
  const product = {
    ...liveProduct("G107527"),
    warehouseCategoryId: "scales",
    warehouseSubcategoryIds: ["scale-floor", "platform-sus304", "invented-child"],
  };
  const [selected] = warehouseStorefrontProducts([product], "1");
  assert.equal(selected.warehouseCategoryId, "platforms");
  assert.deepEqual(selected.warehouseSubcategoryIds, ["platform-sus304"]);
});

test("wrong-company and ambiguous selection records fail rather than publishing unrelated products", () => {
  assert.throws(() => warehouseStorefrontProducts([], "2"), /different company/);
  const entry = selection.items[0];
  for (const items of [
    [entry, { ...entry, masterItemId: "999999", sku: entry.sku.toLowerCase() }],
    [entry, { ...entry, sku: "DIFFERENT-SKU" }],
    [{ ...entry, name: " " }],
    [{ ...entry, categoryId: "uncategorized" }],
  ]) {
    assert.throws(
      () => warehouseStorefrontProducts([], "1", { companyId: "1", items }),
      /Invalid or duplicate/,
    );
  }
});

test("uncurated homepage and quotation products keep their existing naming and eligibility", () => {
  const source = liveProduct("NOT-IN-THE-FIVE-SHEETS");
  assert.equal(source.storefrontName, undefined);
  assert.equal(productCardData(source).name, warehouseDetailProduct(source).name);
  assert.equal(pricedProducts([source]).length, 1);
  assert.equal(warehouseStorefrontProducts([source], "1")[0].name, source.warehouseName);
  assert.equal(pricedProducts([source])[0].documentName, source.warehouseName);
});
