import test from "node:test";
import assert from "node:assert/strict";
import { warehouseSiteProducts } from "../../src/features/catalog/data/warehouse-site-data";
import { warehouseCatalog } from "../../src/features/catalog/data/warehouse-products";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { getWeighingOptions } from "../../src/features/content/data/weighing-options";
import { warehouseContentPage } from "../../src/features/content/data/warehouse-content";
import type { SourcePage } from "../../src/features/content/types";
import { classifyWarehouseProduct } from "../../src/features/catalog/data/warehouse-classification";

test("Warehouse categories distinguish whole devices from cable and wheel substrings", () => {
  const [base] = warehouseCatalog(
    [{ sku: "test", product_name: "test", unit: "ชิ้น", sale_price: 1, image_url: null }],
    [],
  );
  const classify = (
    name: string,
    group: string,
    description = "",
    specifications: { label: string; value: string }[] = [],
  ) =>
    classifyWarehouseProduct({
      ...base,
      warehouseName: name,
      warehouseGroup: group,
      description,
      warehouseSpecifications: specifications,
    });
  for (const name of ["สแกนเนอร์ 1D ไร้สาย", "สแกนเนอร์มีสาย", "คีย์บอร์ดและเม้าส์ ไร้สาย"])
    assert.deepEqual(classify(name, "อุปกรณ์ต่อพ่วง").subcategoryIds, ["accessory-pos"]);
  assert.deepEqual(classify("กล้องถ่ายภาพ AI CAM1100", "อุปกรณ์ต่อพ่วง").subcategoryIds, []);
  assert.deepEqual(classify("Data Cable RS232-USB", "ชิ้นส่วน").subcategoryIds, [
    "accessory-cables",
  ]);
  assert.deepEqual(classify("ล้อ PU30M16", "ชิ้นส่วน").subcategoryIds, ["accessory-mechanical"]);
  assert.equal(classify("CHECKWEIGHER CW-T2-SP31", "สินค้าอื่น ๆ").categoryId, "scales");
  assert.equal(
    classify("TCS600", "เครื่องชั่ง", "แท่นเหล็ก 6080 | แท่นชั่งพร้อมโหลดเซลส์ - Platform")
      .categoryId,
    "platforms",
  );
  assert.equal(classify("บริการซ่อมเครื่องชั่ง", "ค่าบริการ").categoryId, undefined);
  assert.equal(classify("ถุงมือ", "ถุงมือและอุปกรณ์ป้องกัน").categoryId, undefined);
  assert.equal(classify("ลูกตุ้มน้ำหนัก", "ลูกตุ้มและตุ้มน้ำหนัก").categoryId, "accessories");
  const posAccessory = classify("Accessory for POS - Basic", "อุปกรณ์ต่อพ่วง");
  assert.equal(posAccessory.categoryId, "accessories");
  assert.deepEqual(posAccessory.subcategoryIds, ["accessory-pos"]);
});

test("Warehouse subcategories use explicit facts and report absent or conflicting evidence", () => {
  const [base] = warehouseCatalog(
    [{ sku: "test", product_name: "test", unit: "ชิ้น", sale_price: 1, image_url: null }],
    [],
  );
  const classify = (
    name: string,
    group: string,
    specifications: { label: string; value: string }[] = [],
    description = "",
  ) =>
    classifyWarehouseProduct({
      ...base,
      warehouseName: name,
      warehouseGroup: group,
      description,
      warehouseSpecifications: specifications,
    });
  assert.deepEqual(
    classify("เครื่องชั่ง A", "เครื่องชั่ง", [{ label: "คำนวณราคาสินค้า", value: "รองรับ" }])
      .subcategoryIds,
    ["scale-price"],
  );
  assert.deepEqual(
    classify("เครื่องชั่ง A", "เครื่องชั่ง", [{ label: "คำนวณราคาสินค้า", value: "ไม่รองรับ" }])
      .subcategoryIds,
    [],
  );
  assert.deepEqual(
    classify("Platform A", "ชิ้นส่วน", [{ label: "วัสดุจาน / แท่นชั่ง", value: "SUS304" }])
      .subcategoryIds,
    [],
  );
  assert.deepEqual(
    classify("Platform A", "ชิ้นส่วน", [{ label: "วัสดุโครงสร้าง", value: "SUS 304" }])
      .subcategoryIds,
    ["platform-sus304"],
  );
  assert.deepEqual(
    classify("Platform A", "ชิ้นส่วน", [{ label: "วัสดุโครงสร้าง", value: "SUS304 / SUS201" }])
      .subcategoryIds,
    [],
  );
  assert.deepEqual(classify("POS P1", "ระบบขายและเวิร์กสเตชัน").subcategoryIds, []);
  assert.deepEqual(
    classify("POS P1", "ระบบขายและเวิร์กสเตชัน", [], "Set POS P1 (Android)").subcategoryIds,
    ["pos-android"],
  );
  assert.deepEqual(
    classify("เครื่องชั่ง A พร้อมเครื่องพิมพ์", "สินค้าจำหน่ายแบบแพ็ก").subcategoryIds,
    [],
  );
  const conflict = classify("เครื่องชั่ง WPS10KS", "เครื่องชั่ง", [
    { label: "จุดเด่นสินค้า", value: "SUNFORD WPS6KS เครื่องชั่งกันน้ำ IP67" },
  ]);
  assert.deepEqual(conflict.subcategoryIds, []);
  assert(conflict.reviewReasons.some((reason) => reason.includes("WPS6KS")));
  const kit = classify("TMS60AW31LP50", "เครื่องชั่ง", [], "SUNFORD TCS-60-AW31 พร้อมเครื่องพิมพ์");
  assert(kit.reviewReasons.some((reason) => reason.includes("TCS-60-AW31")));
  const reference = {
    ...base,
    warehouseGroup: "เครื่องชั่ง",
    warehouseSpecifications: [{ label: "รุ่นสินค้า", value: "TMS-60-AW31" }],
  };
  const packageProduct = {
    ...base,
    warehouseName: "จัดชุด SUNFORD TMS-60-AW31 พร้อมเครื่องพิมพ์ LP50",
    warehouseGroup: "สินค้าจำหน่ายแบบแพ็ก",
  };
  const packageCategory = classifyWarehouseProduct(packageProduct, [reference]);
  assert.equal(packageCategory.categoryId, "scales");
  assert.deepEqual(packageCategory.subcategoryIds, []);
  assert.equal(
    classifyWarehouseProduct(
      {
        ...packageProduct,
        warehouseName: "จัดชุด SUNFORD TMS-60-AW31S พร้อมเครื่องพิมพ์",
      },
      [reference],
    ).categoryId,
    undefined,
  );
});

test("sitewide public products exclude every editorial fallback while retaining URL identity", () => {
  const [raw] = warehouseCatalog(
    [
      {
        sku: "G106308",
        product_name: "SUNFORD เครื่องชั่ง TMS-60-AW31",
        unit: "เครื่อง",
        sale_price: 0,
        image_url: null,
        description: "",
        group_name: "เครื่องชั่ง",
      },
    ],
    getSnapshotProducts(),
  );
  const [product] = warehouseSiteProducts([raw]);
  assert.equal(product.id, raw.id);
  assert.equal(product.slug, raw.slug);
  for (const key of [
    "image",
    "description",
    "subtitle",
    "capacity",
    "readability",
    "connection",
  ] as const)
    assert.equal(product[key], "");
  assert.equal(product.badge, null);
  assert.equal(product.featured, false);
  assert.equal(product.fallbackImage, undefined);
  assert.equal(product.price, null);
  assert.equal(product.warehouseCategoryId, "scales");
  const [head] = warehouseSiteProducts([
    { ...raw, warehouseSku: "HEAD", warehouseName: "Indicator AW31", name: "AW31" },
  ]);
  assert.equal(
    getWeighingOptions([head, product]).find((o) => o.sku === "HEAD")?.compatibleCodes?.length,
    0,
  );
  const [kit] = warehouseSiteProducts(
    [raw],
    [{ root_sku: raw.warehouseSku!, sku: "HEAD", quantity: "1" }],
  );
  const options = getWeighingOptions([head, kit]);
  assert.equal(options.find((o) => o.sku === kit.warehouseSku)?.includesHead, true);
  assert.deepEqual(options.find((o) => o.sku === "HEAD")?.compatibleCodes, [kit.warehouseSku]);
});

test("legacy product documents keep structural tags but clear prose and media without Warehouse content", () => {
  const source: SourcePage = {
    path: "/solutions/rs232",
    sourceUrl: "/solutions/rs232",
    title: "RS232",
    kind: "page",
    html: '<section class="layout"><h2>OLD PRODUCT</h2><img src="/old.jpg" width="400" height="300"><p>OLD SPEC</p></section>',
    text: "OLD SPEC",
    images: ["/old.jpg"],
    productHandles: [],
    collectionIds: [],
  };
  const document = warehouseContentPage(source, []);
  assert.equal(document.text, "");
  assert.deepEqual(document.images, []);
  assert.match(document.html, /class="layout"/);
  assert.match(document.html, /width="400" height="300"/);
  assert.doesNotMatch(document.html, /OLD|old.jpg/);
});
