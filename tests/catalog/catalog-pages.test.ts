import assert from "node:assert/strict";
import { test } from "node:test";
import { supplementalCatalogGroup } from "../../src/features/catalog/data/catalog-supplements";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { classifyProductTopics } from "../../src/features/catalog/data/product-topics";

test("new source supplies remain available in accessories instead of the scale group", () => {
  const product = getSnapshotProducts().find((p) => p.sourceId === "Sticker_6040")!;
  assert.ok(product);
  assert.equal(
    supplementalCatalogGroup({ ...product, topics: classifyProductTopics(product) }),
    "/product/scale-accessories",
  );
});

test("new scales omitted from legacy indexes remain in the scale catalogue", () => {
  const product = getSnapshotProducts().find((p) => p.sourceId === "TCS-150-AW31")!;
  assert.ok(product);
  assert.equal(
    supplementalCatalogGroup({ ...product, topics: classifyProductTopics(product) }),
    "/products",
  );
});

test("existing indexed indicators keep their authoritative collection membership", () => {
  const product = getSnapshotProducts().find((p) => p.sourceId === "10777")!;
  assert.ok(product);
  assert.equal(supplementalCatalogGroup(product), undefined);
});
