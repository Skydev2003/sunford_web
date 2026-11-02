import assert from "node:assert/strict";
import { test } from "node:test";
import { groupProductDetails } from "../../src/features/catalog/data/product-detail-groups";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import sources from "../../src/features/content/data/products.json";
import {
  productOverview,
  productPresentation,
} from "../../src/features/catalog/data/product-presentation";
import {
  mergeProductContentRows,
  productContentRows,
} from "../../src/features/catalog/data/product-content";

test("long details group related specifications without rewriting values or losing links", () => {
  const rows = [
    { label: "พิกัดน้ำหนักสูงสุด", html: "30kg" },
    { label: "แบตเตอรี่", html: "6V 4Ah" },
    { label: "การเชื่อมต่อ", html: '<a href="/software/download">RS232</a>' },
    { label: "น้ำหนักสุทธิ", html: "3.2kg" },
    { label: "รับประกันคุณภาพ", html: "1 ปี" },
    { label: "คุณสมบัติพิเศษที่ไม่รู้จัก", html: "ข้อมูลต้องเก็บครบ" },
  ];
  const groups = groupProductDetails(rows);
  assert.equal(groups.length, 6);
  assert.equal(groups.find((group) => group.id === "weighing")?.rows[0], rows[0]);
  assert.equal(groups.find((group) => group.id === "power")?.rows[0], rows[1]);
  assert.equal(groups.find((group) => group.id === "connectivity")?.rows[0], rows[2]);
  assert.equal(groups.find((group) => group.id === "construction")?.rows[0], rows[3]);
  assert.equal(groups.find((group) => group.id === "assurance")?.rows[0], rows[4]);
  assert.ok(groups.flatMap((group) => group.rows).includes(rows[5]));
  assert.deepEqual(groupProductDetails([]), []);
});

test("all 150 product detail layouts retain every original attribute exactly once", () => {
  for (const product of getSnapshotProducts()) {
    const source = sources.find((source) => source.sourceId === product.sourceId)!;
    const presentation = productPresentation(product, product, source);
    const overview = productOverview(product, presentation.specifications);
    const rows = mergeProductContentRows([
      ...productContentRows(presentation.descriptionHtml ?? ""),
      ...overview.additionalSpecifications,
      ...productContentRows(source.detailsHtml, true),
    ]).filter((row) => row.label !== "รายละเอียดสินค้า");
    const grouped = groupProductDetails(rows).flatMap((group) => group.rows);
    assert.equal(grouped.length, rows.length, product.name);
    for (const row of rows)
      assert.equal(grouped.filter((item) => item === row).length, 1, product.name);
    for (const group of groupProductDetails(rows)) assert.ok(group.rows.length > 0);
  }
});
