import assert from "node:assert/strict";
import test from "node:test";
import {
  indicatorSubcategoryPages,
  platformSubcategoryPages,
  posSubcategoryPages,
  accessorySubcategoryPages,
  getProductSubcategoryPage,
  getProductReturnPage,
  getReadySubcategoryHrefs,
} from "../../src/features/catalog/data/product-subcategory-pages";
import { scaleSubcategoryPages } from "../../src/features/catalog/data/scale-subcategory-pages";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import type { Product } from "../../src/features/catalog/types";

test("Navbar readiness follows the actual listing's Warehouse cards as members appear and disappear", () => {
  const cards = [
    { id: "scale", warehouseSku: "SKU-1" },
    { id: "platform", warehouseSku: "SKU-2" },
    { id: "editorial" },
  ];
  const categories = [
    {
      id: "scales",
      subcategories: [
        { id: "scale-analytical", label: "งานวิเคราะห์", productIds: ["missing", "editorial"] },
      ],
    },
    {
      id: "platforms",
      subcategories: [{ id: "platform-sus304", label: "SUS304", productIds: ["platform"] }],
    },
  ];
  assert.deepEqual(getReadySubcategoryHrefs(categories, []), []);
  assert.deepEqual(getReadySubcategoryHrefs(categories, cards), [
    "/products/category/platforms/sus304",
  ]);
  categories[0].subcategories[0].productIds.push("scale", "scale");
  assert.deepEqual(getReadySubcategoryHrefs(categories, cards), [
    "/products/category/scales/analytical",
    "/products/category/platforms/sus304",
  ]);
  assert.deepEqual(getReadySubcategoryHrefs(categories, cards.slice(1)), [
    "/products/category/platforms/sus304",
  ]);
  assert.deepEqual(getReadySubcategoryHrefs([{ ...categories[1], id: "scales" }], cards), []);
});

test("LCD LED and waterproof indicators have exact canonical pages and whitelisted returns", () => {
  assert.deepEqual(
    indicatorSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["indicator-lcd", "/products/category/indicators/lcd"],
      ["indicator-led", "/products/category/indicators/led"],
      ["indicator-waterproof", "/products/category/indicators/waterproof"],
    ],
  );
  for (const page of indicatorSubcategoryPages) {
    for (const prefix of ["/products?category=indicators&", "/products/category/indicators?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "scales"), undefined);
  }
});

test("indicator IDs cannot hijack another family and unknown returns stay unresolved", () => {
  for (const href of [
    "/products?category=pos&subcategory=indicator-lcd",
    "/products/category/scales?subcategory=indicator-led",
    "/products/category/indicators?subcategory=scale-price",
    "/products/category/indicators?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  for (const context of ["https://example.com", "/products/category/indicators/lcd", "unknown"])
    assert.equal(getProductReturnPage(context), undefined);
});

test("shared registry retains every existing scale path, title and return alias", () => {
  for (const page of scaleSubcategoryPages) {
    assert.equal(getProductSubcategoryPage(page.id, "scales")?.href, page.href);
    assert.equal(getProductReturnPage(page.returnContext)?.title, page.label);
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
  }
  assert.equal(
    getProductReturnPage("industrial-scales")?.href,
    "/products/category/scales/industrial",
  );
});

test("four platform materials have exact own-parent routes and safe return contexts", () => {
  assert.deepEqual(
    platformSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["platform-carbon-steel", "/products/category/platforms/carbon-steel"],
      ["platform-sus304", "/products/category/platforms/sus304"],
      ["platform-sus201", "/products/category/platforms/sus201"],
      ["platform-abs", "/products/category/platforms/abs"],
    ],
  );
  for (const page of platformSubcategoryPages) {
    for (const prefix of ["/products?category=platforms&", "/products/category/platforms?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "indicators"), undefined);
  }
});

test("platform expansion preserves cross-family boundaries and broader parent aliases", () => {
  for (const href of [
    "/products?category=pos&subcategory=platform-sus304",
    "/products/category/scales?subcategory=platform-abs",
    "/products/category/platforms?subcategory=indicator-lcd",
    "/products/category/platforms?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(
    resolveCategoryHref("/collections/stainless-steel-platforms"),
    "/products/category/platforms",
  );
  assert.equal(resolveCategoryHref("/product/benchtop-platforms"), "/products/category/platforms");
  assert.equal(getProductReturnPage("/products/category/platforms/abs"), undefined);
});

test("three POS platforms have exact own-parent pages and safe originating contexts", () => {
  assert.deepEqual(
    posSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["pos-ios", "/products/category/pos/ios"],
      ["pos-android", "/products/category/pos/android"],
      ["pos-windows", "/products/category/pos/windows"],
    ],
  );
  for (const page of posSubcategoryPages) {
    for (const prefix of ["/products?category=pos&", "/products/category/pos?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "platforms"), undefined);
  }
});

test("POS expansion preserves unknown and cross-family boundaries", () => {
  for (const href of [
    "/products?category=unknown&subcategory=pos-ios",
    "/products/category/platforms?subcategory=pos-android",
    "/products/category/pos?subcategory=indicator-lcd",
    "/products/category/pos?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(getProductReturnPage("/products/category/pos/ios"), undefined);
  assert.equal(resolveCategoryHref("/product/pos"), "/products/category/pos");
});

test("five accessory groups have exact own-parent routes and whitelisted return contexts", () => {
  assert.deepEqual(
    accessorySubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["accessory-displays", "/products/category/accessories/displays"],
      ["accessory-cables", "/products/category/accessories/cables"],
      ["accessory-mechanical", "/products/category/accessories/mechanical"],
      ["accessory-pos", "/products/category/accessories/pos"],
      ["accessory-consumables", "/products/category/accessories/consumables"],
    ],
  );
  for (const page of accessorySubcategoryPages) {
    for (const prefix of ["/products?category=accessories&", "/products/category/accessories?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "pos"), undefined);
  }
});

test("accessory expansion preserves broader aliases and cross-family boundaries", () => {
  for (const href of [
    "/products?category=pos&subcategory=accessory-pos",
    "/products/category/accessories?subcategory=pos-ios",
    "/products/category/indicators?subcategory=accessory-displays",
    "/products/category/accessories?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  for (const href of [
    "/product/data-interfaces",
    "/product/scale-peripherals",
    "/collections/printers",
  ])
    assert.equal(resolveCategoryHref(href), "/products/category/accessories");
  assert.equal(getProductReturnPage("/products/category/accessories/pos"), undefined);
});

test("additional listings have distinct canonical paths and safe product return contexts", () => {
  for (const [category, slug, id] of [
    ["scales", "counting", "scale-counting"],
    ["scales", "checkweighing", "scale-checkweighing"],
    ["indicators", "rs232", "indicator-rs232"],
    ["accessories", "electronics", "accessory-electronics"],
    ["accessories", "printers", "accessory-printers"],
    ["accessories", "scanners-and-cash-drawers", "accessory-scanners-and-cash-drawers"],
    ["accessories", "weights", "accessory-weights"],
    ["accessories", "thermal-paper", "accessory-thermal-paper"],
    ["accessories", "labels", "accessory-labels"],
  ]) {
    const href = `/products/category/${category}/${slug}`;
    assert.equal(getProductSubcategoryPage(id, category)?.href, href);
    assert.equal(getProductReturnPage(id)?.href, href);
    assert.equal(getProductReturnPage(href), undefined);
    assert.equal(resolveCategoryHref(`/products?category=${category}&subcategory=${id}`), href);
    assert.equal(getProductSubcategoryPage(id, "pos"), undefined);
  }
});

test("new listings require matching Warehouse identity, group or specification", () => {
  const check = (id: string, categoryId: string, fields: Partial<Product>, expected: boolean) => {
    const page = getProductSubcategoryPage(id, categoryId);
    assert.ok(page && "matches" in page);
    const product = {
      warehouseSku: "example",
      warehouseCategoryId: categoryId,
      ...fields,
    } as Product;
    assert.equal(page.matches(product), expected, id);
    assert.equal(page.matches({ ...product, warehouseSku: undefined }), false, id);
    assert.equal(page.matches({ ...product, warehouseCategoryId: "pos" }), false, id);
  };
  check("scale-counting", "scales", { warehouseName: "เครื่องชั่ง-นับจำนวน" }, true);
  check("scale-counting", "scales", { name: "เครื่องชั่งนับจำนวน" }, false);
  check(
    "scale-counting",
    "scales",
    {
      warehouseName: "เครื่องชั่งนับจำนวน",
      warehouseSpecifications: [{ label: "นับจำนวนชิ้น", value: "ไม่รองรับ" }],
    },
    false,
  );
  check(
    "scale-checkweighing",
    "scales",
    { warehouseSpecifications: [{ label: "เตือนน้ำหนักขาด–เกิน", value: "รองรับ" }] },
    true,
  );
  check(
    "scale-checkweighing",
    "scales",
    { warehouseName: "เตือนเมื่อชั่งน้ำหนักเกินพิกัด" },
    false,
  );
  check(
    "indicator-rs232",
    "indicators",
    {
      warehouseSpecifications: [
        { label: "เงื่อนไขการเชื่อมต่อ", value: "ส่งข้อมูลผ่านพอร์ท RS232" },
      ],
    },
    true,
  );
  check(
    "indicator-rs232",
    "indicators",
    { warehouseSpecifications: [{ label: "พอร์ตเสริม", value: "RS-232 (optional)" }] },
    false,
  );
  check("indicator-rs232", "indicators", { warehouseName: "สาย RS232" }, false);
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "SUNFORD ชิ้นส่วน - Load cell" },
    true,
  );
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "SUNFORD ชิ้นส่วน - Loadcell Cable" },
    false,
  );
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "โครงแท่นพร้อมโหลดเซลล์" },
    false,
  );
  for (const part of [
    "PCB",
    "ส่วนขยายวงจร บลูทูธ BTA",
    "ส่วนขยายวงจร บลูทูธ BTB",
    "อุปกรณ์ส่งสัญญาณ บลูทูธ 1,000ม BTL",
    "วงจรแท่นชั่งเทอร์มินอล ABT",
  ]) {
    check(
      "accessory-electronics",
      "accessories",
      { warehouseGroup: "ชิ้นส่วน", warehouseName: `SUNFORD ชิ้นส่วน - ${part}` },
      true,
    );
  }
  for (const part of ["สาย PCB", "แท่นชั่งพร้อมวงจรแท่นชั่ง ABT", "PCB พร้อมแท่นชั่ง"]) {
    check(
      "accessory-electronics",
      "accessories",
      { warehouseGroup: "ชิ้นส่วน", warehouseName: `SUNFORD ชิ้นส่วน - ${part}` },
      false,
    );
  }
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "วัตถุดิบ", warehouseName: "SUNFORD ชิ้นส่วน - PCB" },
    false,
  );
  check("accessory-printers", "accessories", { warehouseGroup: "เครื่องพิมพ์" }, true);
  const scannerListing = "accessory-scanners-and-cash-drawers";
  for (const warehouseSku of [
    "G107374",
    "G107381",
    "G107411",
    "SUNFORDDRW350-B",
    "SUNFORDDRW350-W",
  ])
    check(scannerListing, "accessories", { warehouseSku }, true);
  check(
    scannerListing,
    "accessories",
    { warehouseSku: "G107374-OTHER", warehouseSubcategoryIds: ["accessory-pos"] },
    false,
  );
  check(
    "accessory-printers",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "ขาตั้งเครื่องพิมพ์" },
    false,
  );
  check("accessory-weights", "accessories", { warehouseGroup: "ลูกตุ้มและตุ้มน้ำหนัก" }, true);
  check("accessory-weights", "accessories", { warehouseName: "ตุ้มน้ำหนัก" }, false);
  const paper = { warehouseGroup: "วัสดุสิ้นเปลือง", warehouseName: "กระดาษความร้อน 57x50" };
  const sticker = { warehouseGroup: "วัสดุสิ้นเปลือง", warehouseName: "สติ๊กเกอร์เลเบล 40x60" };
  check("accessory-thermal-paper", "accessories", paper, true);
  check("accessory-thermal-paper", "accessories", sticker, false);
  check("accessory-labels", "accessories", sticker, true);
  check("accessory-labels", "accessories", paper, false);
});
