import assert from "node:assert/strict";
import test from "node:test";
import {
  deduplicateConsumableSizes,
  getConsumableSizeProducts,
} from "../../src/features/catalog/data/consumable-sizes";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

const products = getSnapshotProducts();
const consumables = [
  "Sticker_6040",
  "Sticker_5330",
  "Sticker_5320",
  "Sticker_5750",
  "Sticker_8080",
  "10748",
  "10740",
  "10749",
  "10750",
  "10747",
  "10742",
  "10744",
  "10743",
  "10745",
  "10746",
  "10810",
  "10809",
  "10812",
  "10811",
  "10824",
];

test("consumable selector reuses seven current size representatives without admitting unrelated products", () => {
  const expected = deduplicateConsumableSizes(products).filter((product) =>
    consumables.includes(product.sourceId ?? ""),
  );
  assert.deepEqual(getConsumableSizeProducts(products), expected);
  assert.equal(expected.length, 7);
  assert.deepEqual(
    getConsumableSizeProducts(
      products.filter((product) => !consumables.includes(product.sourceId ?? "")),
    ),
    [],
  );
  assert.deepEqual(getConsumableSizeProducts([]), []);
});

test("twenty existing label and paper records become seven size representatives across materials and packs", () => {
  const result = deduplicateConsumableSizes(products);
  assert.equal(
    products.filter((product) => consumables.includes(product.sourceId ?? "")).length,
    20,
  );
  assert.equal(result.length, products.length - 13);
  assert.deepEqual(
    result
      .filter((product) => consumables.includes(product.sourceId ?? ""))
      .map((product) => product.sourceId),
    [
      "Sticker_6040",
      "Sticker_5330",
      "Sticker_5320",
      "Sticker_5750",
      "Sticker_8080",
      "10748",
      "10749",
    ],
  );
});

test("selection follows current published input order and never restores an omitted representative", () => {
  const input = products.filter((product) => product.sourceId !== "Sticker_6040");
  const result = deduplicateConsumableSizes(input);
  assert(result.some((product) => product.sourceId === "10750"));
  assert(!result.some((product) => product.sourceId === "Sticker_6040"));
  const reversed = deduplicateConsumableSizes([...products].reverse());
  assert(reversed.some((product) => product.sourceId === "10811"));
  assert(!reversed.some((product) => product.sourceId === "10750"));
  assert.deepEqual(deduplicateConsumableSizes([]), []);
});

test("different dimensions and unrelated matching names remain independent original objects", () => {
  const unrelated = products.filter((product) => !consumables.includes(product.sourceId ?? ""));
  const unknown = {
    ...products[0],
    id: "unknown",
    sourceId: undefined,
    name: "40x60 paper platform",
  };
  const input = [...unrelated, unknown, { ...unknown, id: "another-unknown" }];
  assert.deepEqual(deduplicateConsumableSizes(input), input);
  const result = deduplicateConsumableSizes(products);
  for (const sourceId of ["Sticker_5330", "Sticker_5320", "10749", "10748"])
    assert(result.some((product) => product.sourceId === sourceId));
  for (const product of result)
    assert.equal(
      products.find((row) => row.id === product.id),
      product,
    );
});

test("filter is immutable and idempotent; all source rows remain available outside the page projection", () => {
  const before = structuredClone(products);
  const result = deduplicateConsumableSizes(products);
  assert.deepEqual(products, before);
  assert.deepEqual(deduplicateConsumableSizes(result), result);
  assert(products.some((product) => product.sourceId === "10746"));
  assert(!result.some((product) => product.sourceId === "10746"));
});
