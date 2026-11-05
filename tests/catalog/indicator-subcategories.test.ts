import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

const products = getSnapshotProducts();
const children = getIndicatorSubcategories(products);
const product = (sourceId: string) => products.find((row) => row.sourceId === sourceId)!;

test("child model identifiers and order match the owner document, including both missing models", () => {
  const groups = readFileSync("docs/sunford-indicator-models.md", "utf8")
    .split(/^## /m)
    .slice(1)
    .map((group) => [...group.matchAll(/^- (.+)\r?$/gm)].map((match) => match[1].trim()));
  assert.deepEqual(
    children.map((child) => child.label),
    ["LCD", "LED", "กันน้ำ"],
  );
  assert.deepEqual(
    children.map((child) => child.entries!.map((entry) => entry.documentModel)),
    groups,
  );
  assert.deepEqual(
    children.map((child) => child.productIds.length),
    [4, 5, 2],
  );
  assert.deepEqual(
    children.map((child) =>
      child.entries!.filter((entry) => !entry.productId).map((entry) => entry.model),
    ),
    [["LCDC1C5"], ["WP31EUSB"], ["WP31EUSB"]],
  );
  assert(!children.flatMap((child) => child.productIds).includes(product("10776").id));
});

test("display aliases select one current product per model with deterministic priority and numeric fallback", () => {
  const displays = children[1].entries!.filter((entry) => entry.model.startsWith("LED-R"));
  assert.deepEqual(
    displays.map((entry) => entry.productId),
    [product("LED-R1").id, product("LED-R3").id, product("LED-R5").id],
  );
  assert.deepEqual(getIndicatorSubcategories([...products].reverse()), children);
  const numericOnly = getIndicatorSubcategories(
    products.filter((row) => !["LED-R1", "LED-R3", "LED-R5"].includes(row.sourceId ?? "")),
  );
  assert.deepEqual(
    numericOnly[1].entries!.slice(3).map((entry) => entry.productId),
    [product("10725").id, product("10723").id, product("10724").id],
  );
});

test("waterproof models overlap display children; the USB variant never reuses base WP31E", () => {
  const waterproof = children[2].entries!;
  assert.equal(waterproof[0].productId, children[0].entries![3].productId);
  assert.equal(waterproof[1].productId, children[1].entries![1].productId);
  assert.equal(waterproof[2].productId, undefined);
  assert.equal(children[1].entries![2].productId, undefined);
  assert.equal(new Set(children.flatMap((child) => child.productIds)).size, 9);
  assert.equal(
    new Set(
      children
        .flatMap((child) => child.entries!)
        .filter((entry) => !entry.productId)
        .map((entry) => entry.model),
    ).size,
    2,
  );
});

test("missing published inputs become Mock without snapshot resurrection or input mutation", () => {
  const omitted = new Set(["10779", "LED-R1", "10725"]);
  const input = products
    .filter((row) => !omitted.has(row.sourceId ?? ""))
    .map((row) => ({ ...row, id: `edited-${row.id}` }));
  const before = structuredClone(input);
  const result = getIndicatorSubcategories(input);
  assert.equal(result[0].entries![3].productId, undefined);
  assert.equal(result[2].entries![0].productId, undefined);
  assert.equal(result[1].entries![3].productId, undefined);
  assert(result.flatMap((child) => child.productIds).every((id) => id.startsWith("edited-")));
  assert.deepEqual(input, before);
  assert(
    getIndicatorSubcategories([]).every(
      (child) => child.productIds.length === 0 && child.entries!.every((entry) => !entry.productId),
    ),
  );
});

test("exact new published model names resolve Mock entries without fabricated or suffix-near matches", () => {
  const base = product("10780");
  const future = [
    { ...base, id: "published-usb", sourceId: undefined, name: "Indicator WP31EUSB" },
    { ...base, id: "published-lcd", sourceId: undefined, name: "LCDC1C5" },
    { ...base, id: "wrong-near-model", sourceId: undefined, name: "Indicator WP31EUSB2" },
  ];
  const result = getIndicatorSubcategories(future);
  assert.equal(result[1].entries![2].productId, "published-usb");
  assert.equal(result[2].entries![2].productId, "published-usb");
  assert.equal(result[0].entries![4].productId, "published-lcd");
  assert(!result.flatMap((child) => child.productIds).includes("wrong-near-model"));
});
