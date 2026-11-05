import assert from "node:assert/strict";
import test from "node:test";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

const products = getSnapshotProducts();
const sourceIds = ["10801", "10802", "10805"];
const parent = products.filter((product) => sourceIds.includes(product.sourceId ?? ""));
const id = (sourceId: string) => parent.find((product) => product.sourceId === sourceId)!.id;

test("owner-confirmed POS platforms keep iOS empty and map P1/P4 Android and P1W Windows", () => {
  assert.equal(parent.length, 3);
  const children = getPosSubcategories(parent);
  assert.deepEqual(
    children.map(({ id, label }) => ({ id, label })),
    [
      { id: "pos-ios", label: "iOS" },
      { id: "pos-android", label: "Android" },
      { id: "pos-windows", label: "Windows" },
    ],
  );
  assert.deepEqual(children[0].productIds, []);
  assert.deepEqual(children[1].productIds, [id("10802"), id("10805")]);
  assert.deepEqual(children[2].productIds, [id("10801")]);
  assert.deepEqual(
    children.flatMap((child) => child.productIds).sort(),
    parent.map((product) => product.id).sort(),
  );
});

test("only current parent rows are assigned, preserving IDs/order and never restoring omitted products", () => {
  const input = parent
    .filter((product) => product.sourceId !== "10802")
    .reverse()
    .map((product) => ({ ...product, slug: `owner-edited-${product.slug}` }));
  const before = structuredClone(input);
  const children = getPosSubcategories(input);
  assert.deepEqual(children[1].productIds, [id("10805")]);
  assert.deepEqual(children[2].productIds, [id("10801")]);
  assert.deepEqual(input, before);
  assert(getPosSubcategories([]).every((child) => child.productIds.length === 0));
});

test("non-POS products do not become platform products from compatibility text", () => {
  const children = getPosSubcategories(products);
  assert.deepEqual(
    children.flatMap((child) => child.productIds).sort(),
    parent.map((product) => product.id).sort(),
  );
});
