import { warehouseSiteProducts } from "../../src/features/catalog/data/warehouse-site-data";
import assert from "node:assert/strict";
import test from "node:test";
import {
  approvedWarehouseMappings,
  parseWarehouseProducts,
  warehouseCatalog,
  type WarehouseItem,
} from "../../src/features/catalog/data/warehouse-products";
import { warehouseDisplayName } from "../../src/features/catalog/data/catalog-card-names";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import imageCache from "../../data/warehouse/images.json";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import { getPlatformSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { getAccessorySubcategories } from "../../src/features/catalog/data/accessory-subcategories";

const editorial = getSnapshotProducts();

test("display titles prefer short names, extract safe models and preserve unextractable source text", () => {
  const cases: [string, string, string | null, string][] = [
    ["11", "SUNFORD ACS-30-FC31", null, "ACS-30-FC31"],
    ["G109019", "8858847109019 SUNFORD ชิ้นส่วน - Platform CCS 3540", null, "CCS 3540"],
    [
      "G107435",
      "8858847107435 SUNFORD วัสดุ - กระดาษความร้อน 57x50 บรรจุ 10 ม้วน",
      null,
      "8858847107435 SUNFORD วัสดุ - กระดาษความร้อน 57x50 บรรจุ 10 ม้วน",
    ],
    [
      "G-SET03",
      "จัดชุด - SUNFORD TCS-150-AW31 พร้อมเครื่องพิมพ์ LP50",
      null,
      "TCS-150-AW31 + LP50",
    ],
    ["new-item", "ชื่อเต็มไม่ควรถูกใช้", "เครื่องชั่ง รุ่น M50-Pro (5 กก.)", "M50-Pro"],
    ["G106476", "ชื่อเต็มไม่ควรถูกใช้", "เครื่องชั่ง TSS-60-SW31S", "TSS-60-SW31S"],
    ["G107015", "ชื่อเต็มไม่ควรถูกใช้", "Adapter", "Adapter"],
  ];
  for (const [sku, product_name, product_short_name, model] of cases) {
    for (const image_url of [null, "/image?v=1"]) {
      const [product] = warehouseCatalog(
        [{ sku, product_name, product_short_name, image_url, unit: "ชิ้น", sale_price: 1 }],
        [],
      );
      assert.equal(product.name, model);
      assert.equal(product.storefrontName, model);
      assert.equal(product.warehouseName, product_name);
      assert.equal(product.warehouseSku, sku);
    }
  }
  assert.equal(warehouseDisplayName("G107015", "Adapter"), "Adapter");
  assert.equal(
    warehouseDisplayName("G107435", "8858847107435 SUNFORD วัสดุ - กระดาษความร้อน"),
    "8858847107435 SUNFORD วัสดุ - กระดาษความร้อน",
  );
});

test("catalog uses the saved photo directly and proxies an unsaved Warehouse photo", () => {
  const cached = imageCache.items.find((row) => row.sku === "G107169")!;
  const item: WarehouseItem = {
    sku: cached.sku,
    product_name: "ทดสอบรูปสินค้า",
    unit: "ชิ้น",
    sale_price: 100,
    image_url:
      "/image?" +
      new URLSearchParams({ master_item_id: cached.master_item_id, v: cached.updated_at }),
  };
  assert.ok(cached.local_image);
  const saved = new URL(
    warehouseCatalog([item], [], () => cached.local_image)[0].image,
    "https://test.invalid",
  );
  assert.equal(saved.pathname, cached.local_image);
  assert.equal(saved.searchParams.get("v"), cached.updated_at);
  const proxy = new URL(warehouseCatalog([item], [], () => null)[0].image, "https://test.invalid");
  assert.equal(proxy.pathname, "/api/products/G107169/image");
  assert.equal(proxy.searchParams.get("v"), cached.updated_at);
  assert.equal(warehouseCatalog([{ ...item, image_url: null }], [], () => null)[0].image, "");
});

test("image-only metadata contains unique identities and intact photos with no product or price fields", () => {
  assert.equal(imageCache.items.length, 75);
  assert.equal(new Set(imageCache.items.map((item) => item.sku)).size, imageCache.items.length);
  for (const item of imageCache.items) {
    assert.deepEqual(Object.keys(item).sort(), [
      "local_image",
      "master_item_id",
      "sku",
      "updated_at",
    ]);
    assert.match(item.master_item_id, /^[1-9]\d*$/);
    assert(Number.isFinite(Date.parse(item.updated_at)));
    assert.match(
      item.local_image,
      /^\/images\/warehouse-cache\/[0-9a-f]{64}\.(?:png|jpg|webp|gif|avif)$/,
    );
    const file = path.join(process.cwd(), "public", item.local_image);
    assert(existsSync(file));
    assert.equal(
      createHash("sha256").update(readFileSync(file)).digest("hex"),
      path.basename(file).split(".")[0],
    );
  }
});

test("category assignments are retained independently of the deleted product snapshot", () => {
  const fixtures = ["G-SET03", "PCS60FC11NDT", "POSP1SETPCS60FC11Drawer", "RYGPole_Buzzer"].map(
    (sku) => ({
      sku,
      product_name: sku,
      unit: "ชุด",
      sale_price: 100,
      image_url: null,
    }),
  );
  const catalog = warehouseCatalog(fixtures, editorial);
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

test("category review moves products without changing their SKU identity or supplying missing specs", () => {
  const skus = ["G-SET03", "G-SET06", "TCS600", "TMS60", "SFCLPOS4m"];
  const rows = warehouseCatalog(
    skus.map((sku) => ({
      sku,
      product_name: sku,
      unit: "ชุด",
      sale_price: 50,
      image_url: null,
    })),
    editorial,
  );
  for (const [i, [category, children]] of (
    [
      ["scales", ["scale-industrial", "scale-floor", "scale-pole"]],
      ["scales", []],
      ["platforms", ["platform-carbon-steel"]],
      ["platforms", []],
      ["pos", ["pos-android"]],
    ] as const
  ).entries()) {
    const item = rows.find((p) => p.warehouseSku === skus[i])!;
    assert.equal(item.id, `warehouse-${skus[i]}`);
    assert.equal(item.warehouseCategoryId, category);
    assert.deepEqual(item.warehouseSubcategoryIds, children);
    assert.deepEqual(item.warehouseModelCodes, []);
  }
});

test("only verified SKU mappings inherit legacy content and configurator codes", () => {
  assert.equal(approvedWarehouseMappings.length, 95);
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
  assert.equal(catalog[0].name, "TMS-60-AW31");
  assert.equal(catalog[0].warehouseName, item.product_name);
  assert.equal(catalog[0].price, 100);
  assert.equal(catalog[0].warehouseNetUnitSatang, 10000);
  assert.equal(warehouseCatalog([{ ...item, sale_price: 200 }], editorial)[0].price, 200);
  for (const sale_price of [0.01, 123.45, 1859.81, 1261.68]) {
    const current = warehouseCatalog([{ ...item, sale_price }], editorial)[0];
    assert.equal(current.price, sale_price);
    assert.equal(current.warehouseNetUnitSatang, Math.round(sale_price * 100));
    if (current.media) assert.equal(current.media.price, sale_price);
  }
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
  assert.equal(parsed.total_count, 2);
  assert.deepEqual(
    warehouseCatalog(parsed.items, []).map((p) => p.warehouseSku),
    ["11", "G106612"],
  );
});
test("website visibility excludes operational groups and explicit glove/thread names but keeps real equipment", () => {
  const hidden: WarehouseItem[] = [
    ...["ค่าบริการ", "ค่าขนส่ง", "ส่วนลด", "บัตรกำนัล", "ถุงมือและอุปกรณ์ป้องกัน"].map(
      (group_name, index) => ({ ...items[0], sku: `NEW-GROUP-${index}`, group_name }),
    ),
    ...[
      "M00001 ด้าย TC3.5 ขาว",
      "M000102 ด้ายTC3.5เทา (เลิกใช้)",
      "ถุงมือกันบาด",
      "Protective Gloves",
      "ค่าบริการ Subscription โปรแกรมรายเดือน",
      "ค่าพัฒนาโปรแกรม",
      "บริการ - ค่าขนส่ง",
      "Customized fee : 500 kg",
      "Calibration Fee Type 3",
    ].map((product_name, index) => ({ ...items[0], sku: `NEW-NAME-${index}`, product_name })),
    { ...items[0], sku: "NEW-SHORT", product_short_name: "ด้าย PP" },
    ...["DEVAPP", "G109767", "G109774", "G109781", "G109798", "G107992", "G108005"].map((sku) => ({
      ...items[0],
      sku: sku.toLowerCase(),
    })),
  ];
  const visible = [
    { ...items[0], sku: "SCALE", product_name: "SUNFORD S1 (Free Certificate of calibration)" },
    { ...items[0], sku: "PART", product_name: "ชิ้นส่วน - Indicator AW31" },
    { ...items[0], sku: "POS", product_name: "SUNFORD Connect POS - Basic" },
    { ...items[0], sku: "PRINTER", product_name: "เครื่องพิมพ์ LP50" },
    { ...items[0], sku: "LABEL", product_name: "สติกเกอร์เลเบล" },
    { ...items[0], sku: "M00009", product_name: "ถุงใส", group_name: "วัตถุดิบ" },
    { ...items[0], sku: "HARDWARE", product_name: "Thread adapter", description: "ค่าบริการ" },
  ];
  const mixed = [...hidden, ...visible];
  const parsed = parseWarehouseProducts({ total_count: mixed.length, items: mixed });
  assert.deepEqual(parsed.items, visible);
  assert.equal(parsed.total_count, visible.length);
  assert.deepEqual(
    warehouseCatalog(mixed, []).map((product) => product.warehouseSku),
    visible.map((item) => item.sku),
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
    { total_count: 1, items: [{ ...item, product_short_name: " " }] },
    { total_count: 1, items: [{ ...item, product_short_name: " padded " }] },
  ])
    assert.throws(() => parseWarehouseProducts(invalid));
});

test("all five category projections contain only actual mapped products", () => {
  const products = warehouseCatalog(items, editorial);
  assert.equal(products.length, 95);
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

test("official accessories keep their SKU routes, live prices and photo priority", () => {
  for (const [sku, id, group] of [
    ["G107121", "10712", "accessory-cables"],
    ["G107145", "10714", "accessory-cables"],
    ["G108456", "10845", "accessory-mechanical"],
    ["G108463", "10846", "accessory-mechanical"],
    ["G108470", "10847", "accessory-mechanical"],
    ["G108494", "10849", "accessory-mechanical"],
    ["G108500", "10850", "accessory-mechanical"],
  ]) {
    const item = items.find((row) => row.sku === sku)!;
    const local = warehouseCatalog([item], editorial)[0];
    assert.equal(local.sourceId, id);
    assert.equal(local.id, `warehouse-${sku}`);
    assert.equal(local.slug, local.id);
    assert.equal(local.category, "accessories");
    assert.deepEqual(local.warehouseSubcategoryIds, [group]);
    assert.match(local.image, /^\/images\/imported\//);
    const updated = warehouseCatalog(
      [{ ...item, sale_price: 12, image_url: "/image?v=2" }],
      editorial,
    )[0];
    assert.equal(updated.image, `/api/products/${sku}/image?v=2`);
    assert.equal(updated.fallbackImage, local.image);
    assert.equal(updated.warehouseNetUnitSatang, 1200);
  }
});

test("configurator uses Warehouse SKU identity and requires source evidence for bundled heads", () => {
  const options = getWeighingOptions(warehouseSiteProducts(warehouseCatalog(items, editorial)));
  assert(options.every((option) => option.sku?.startsWith("G") && option.productId));
  assert.equal(options.find((option) => option.code === "G107770")?.sku, "G107770");
  const kit = options.find((option) => option.code === "G106308");
  assert.equal(kit?.sku, "G106308");
  assert.equal(kit?.includesHead, false);
  assert.equal(kit?.price, 100);
  assert(!options.some((option) => option.code === "CableConnector"));
});
