import assert from "node:assert/strict";
import { test } from "node:test";
import pages from "../../src/features/content/data/pages.json";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import type { SourcePage } from "../../src/features/content/types";
import { pageFeatureEntries } from "../../src/features/home/data/category-feature-items";

test("smart belt follows the existing smart page membership and current product images/links", () => {
  const page = pages.find((page) => page.path === "/product/smart-weighing") as SourcePage;
  const products = getSnapshotProducts();
  const member = products.find((product) => product.sourceId === page.productHandles[0])!;
  const visible = [
    { ...member, image: "/images/current-cms-image.webp", slug: "current-cms-slug" },
  ];
  const entries = pageFeatureEntries(page, visible);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].id, member.id);
  assert.equal(entries[0].image, visible[0].image);
  assert.equal(entries[0].href, "/products/current-cms-slug");
  assert.deepEqual(pageFeatureEntries(page, []), []);
});

test("software belt uses the three existing solution images and download anchors", () => {
  const page = pages.find((page) => page.path === "/applications-and-softwares") as SourcePage;
  const entries = pageFeatureEntries(page, getSnapshotProducts());
  assert.equal(entries.length, 3);
  assert.deepEqual(
    entries.map((entry) => entry.href),
    [
      "/software/download#retail-software",
      "/software/download#industrial-software",
      "/software/download#household-software",
    ],
  );
  assert(entries.every((entry) => page.images.includes(entry.image) && entry.title));
});

test("managed page membership uses product IDs and never fills missing membership with unrelated products", () => {
  const page = pages.find((page) => page.path === "/applications-and-softwares") as SourcePage;
  const [product] = getSnapshotProducts();
  const managed = { ...page, productIds: [product.id], productHandles: [] };
  assert.deepEqual(
    pageFeatureEntries(managed, [product]).map((entry) => entry.id),
    [product.id],
  );
  assert.deepEqual(pageFeatureEntries(managed, []), []);
  assert.deepEqual(pageFeatureEntries(undefined, [product]), []);
});
