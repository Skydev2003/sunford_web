import assert from "node:assert/strict";
import { test } from "node:test";
import { relatedProducts } from "../../src/features/catalog/data/related-products";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";

const products = getSnapshotProducts();

test("related selection uses canonical families and published input order for every product", () => {
  for (const product of products) {
    const input = products.filter((candidate) => candidate.id !== product.id).reverse();
    const expected = input
      .filter((candidate) => catalogProductGroup(candidate) === catalogProductGroup(product))
      .slice(0, 3);
    assert.deepEqual(relatedProducts(product, input), expected);
  }
});

test("self and duplicate IDs or slugs are excluded without mutating the input", () => {
  const family = products.filter((product) => catalogProductGroup(product) === "/Product/POS");
  const [current, first, second] = family;
  const input = Object.freeze([
    current,
    { ...current, id: "same-slug" },
    { ...current, slug: "same-id" },
    first,
    { ...first, slug: "duplicate-id" },
    { ...first, id: "duplicate-slug" },
    second,
  ]);
  const before = JSON.stringify(input);
  assert.deepEqual(relatedProducts(current, input), [first, second]);
  assert.equal(JSON.stringify(input), before);
});

test("unknown families and absent candidates never resurrect snapshot products", () => {
  const unknown = {
    ...products[0],
    id: "unknown",
    slug: "unknown",
    sourceId: undefined,
    name: "Unknown",
    category: "unknown",
  };
  assert.deepEqual(relatedProducts(unknown, products), []);
  assert.deepEqual(relatedProducts(products[0], []), []);
  assert.deepEqual(relatedProducts(products[0], [products[0]]), []);
  const other = products.find((p) => catalogProductGroup(p) !== catalogProductGroup(products[0]))!;
  assert.deepEqual(relatedProducts(products[0], [other]), []);
});
