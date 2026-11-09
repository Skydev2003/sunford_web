import assert from "node:assert/strict";
import { test } from "node:test";
import {
  catalogFieldValue,
  getCatalogComparisonRows,
  getCatalogDecisionFacts,
} from "../../src/features/catalog/data/catalog-decision-facts";
import type { OverlayProduct } from "../../src/features/catalog/types";
import type { ProductCategory } from "../../src/features/catalog/data/mock-categories";

const product: OverlayProduct = {
  id: "model-a",
  slug: "model-a",
  name: "Model A",
  category: "commercial",
  subtitle: "ข้อมูลที่มีอยู่เดิม",
  description: "",
  image: "/model-a.png",
  capacity: "10 กิโลกรัม",
  readability: "0.5 / 1 กรัม",
  connection: "USB",
};
const category = (
  id: string,
  subcategories: ProductCategory["subcategories"] = [],
): ProductCategory => ({
  id,
  label: id,
  productIds: [product.id],
  subcategoriesAreMock: false,
  subcategories,
});

test("weighing families expose the original capacity, readability and connection values", () => {
  for (const id of ["scales", "platforms", "pos"])
    assert.deepEqual(getCatalogDecisionFacts(product, category(id)), [
      { label: "พิกัดน้ำหนัก", value: "10 กิโลกรัม" },
      { label: "ค่าละเอียด", value: "0.5 / 1 กรัม" },
      { label: "การเชื่อมต่อ", value: "USB" },
    ]);
});

test("indicator facts use explicit membership and do not reuse legacy weighing fields", () => {
  const indicators = category("indicators", [
    { id: "indicator-led", label: "LED", productIds: [product.id] },
    { id: "indicator-waterproof", label: "กันน้ำ", productIds: [product.id] },
  ]);
  assert.deepEqual(getCatalogDecisionFacts(product, indicators), [
    { label: "หน้าจอ", value: "LED" },
    { label: "การเชื่อมต่อ", value: "USB" },
    { label: "การใช้งาน", value: "กันน้ำ" },
  ]);
  assert.deepEqual(
    getCatalogDecisionFacts({ ...product, connection: "—" }, category("indicators")),
    [{ label: "ข้อมูลสินค้า", value: product.subtitle }],
  );
});

test("unrelated membership cannot imply a display type or waterproof claim", () => {
  const indicators = category("indicators", [
    { id: "indicator-lcd", label: "LCD", productIds: ["another-model"] },
    { id: "indicator-waterproof", label: "กันน้ำ", productIds: ["another-model"] },
  ]);
  assert.deepEqual(getCatalogDecisionFacts(product, indicators), [
    { label: "การเชื่อมต่อ", value: "USB" },
  ]);
});

test("accessories do not turn legacy capacity/readability fields into weighing claims", () => {
  assert.deepEqual(getCatalogDecisionFacts(product, category("accessories")), [
    { label: "การเชื่อมต่อ", value: "USB" },
  ]);
});

test("material, operating system and accessory type come only from matching membership", () => {
  for (const [id, prefix, label, value] of [
    ["platforms", "platform-sus304", "วัสดุ", "สแตนเลส SUS304"],
    ["pos", "pos-android", "ระบบปฏิบัติการ", "Android"],
    ["accessories", "accessory-cables", "ประเภท", "สายสัญญาณและหัวต่อ"],
  ]) {
    const child = { id: prefix, label: value, productIds: [product.id] };
    const facts = getCatalogDecisionFacts(product, category(id, [child]));
    assert.deepEqual(facts[0], { label, value });
    assert.ok(facts.length <= 3);
    const unrelated = getCatalogDecisionFacts(
      product,
      category(id, [{ ...child, productIds: ["another-model"] }]),
    );
    assert.ok(unrelated.every((fact) => fact.label !== label));
  }
});

test("missing facts fall back to existing copy without fabricated values", () => {
  const missing = { ...product, capacity: "—", readability: "-", connection: " " };
  assert.deepEqual(getCatalogDecisionFacts(missing, category("scales")), [
    { label: "ข้อมูลสินค้า", value: product.subtitle },
  ]);
  assert.deepEqual(getCatalogDecisionFacts({ ...missing, subtitle: "–" }, category("scales")), []);
  for (const value of [undefined, "", " ", "—", "-", "–"])
    assert.equal(catalogFieldValue(value), null);
  assert.equal(catalogFieldValue("  ไม่รองรับ USB  "), "ไม่รองรับ USB");
});

test("comparison preserves four consistent fields and highlights only known differing text", () => {
  const rows = getCatalogComparisonRows([product, { ...product, capacity: "30 กิโลกรัม" }]);
  assert.deepEqual(
    rows.map((row) => row.key),
    ["subtitle", "capacity", "readability", "connection"],
  );
  assert.deepEqual(
    rows.filter((row) => row.different).map((row) => row.key),
    ["capacity"],
  );
  assert.deepEqual(rows[1].values, ["10 กิโลกรัม", "30 กิโลกรัม"]);
  assert.equal(rows[2].label, "ค่าละเอียด");
});

test("unknown values, a single selection and whitespace are not product differences", () => {
  assert.equal(
    getCatalogComparisonRows([product, { ...product, capacity: "—" }])[1].different,
    false,
  );
  assert.equal(
    getCatalogComparisonRows([product, { ...product, capacity: " 10 กิโลกรัม " }])[1].different,
    false,
  );
  assert.ok(getCatalogComparisonRows([product]).every((row) => !row.different));
  assert.equal(
    getCatalogComparisonRows([product, { ...product, capacity: "-" }])[1].values[1],
    null,
  );
});
