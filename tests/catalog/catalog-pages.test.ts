import assert from "node:assert/strict";
import { test } from "node:test";
import {
  catalogProductCategory,
  catalogProductGroup,
  supplementalCatalogGroup,
  supplementalCatalogSection,
} from "../../src/features/catalog/data/catalog-supplements";
import pages from "../../src/features/content/data/pages.json";
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

test("premium gifts never fall back to scales when an old database category is industrial", () => {
  for (const sourceId of ["10792", "10799", "10800"]) {
    const product = getSnapshotProducts().find((p) => p.sourceId === sourceId)!;
    assert.ok(product);
    assert.equal(
      supplementalCatalogGroup({ ...product, category: "industrial" }),
      "/product/scale-accessories",
      product.name,
    );
  }
});

test("displays, columns, paper and ramps are accessories rather than complete scales", () => {
  for (const sourceId of ["LED-R1", "LED-R3", "LED-R5", "TMS", "Sticker_6040", "10768", "10769"]) {
    const product = getSnapshotProducts().find((p) => p.sourceId === sourceId)!;
    assert.ok(product);
    assert.equal(
      supplementalCatalogGroup({ ...product, topics: classifyProductTopics(product) }),
      "/product/scale-accessories",
      product.name,
    );
  }
});

test("specialized equipment is not a complete scale even in the broad legacy scale index", () => {
  const products = getSnapshotProducts();
  for (const [collection, expected] of [
    ["industrial-indicators", "/Indicator"],
    ["scale-platforms", "/product/scale-platforms"],
    ["pos-scale-integration", "/Product/POS"],
    ["scale-accessories", "/product/scale-accessories"],
    ["premium", "/product/scale-accessories"],
  ]) {
    const handles = pages.find(
      (page) => page.path === `/collections/${collection}`,
    )!.productHandles;
    for (const handle of handles) {
      const product = products.find((p) => p.sourceId === handle)!;
      assert.ok(product, handle);
      assert.equal(
        catalogProductGroup({ ...product, category: "industrial" }),
        expected,
        product.name,
      );
    }
  }
  // POS1100 has a weighing platform; a P1W terminal does not.
  assert.equal(catalogProductGroup(products.find((p) => p.sourceId === "10658")!), "/products");
  assert.equal(catalogProductGroup(products.find((p) => p.sourceId === "10659")!), "/products");
});

test("public product categories correct stale imports without altering product content", () => {
  const products = getSnapshotProducts();
  for (const sourceId of [
    "10792",
    "10799",
    "10800",
    "10726",
    "10736",
    "LED-R1",
    "TMS",
    "Sticker_6040",
    "10768",
  ]) {
    const product = products.find((p) => p.sourceId === sourceId)!;
    const stale = { ...product, category: "industrial" };
    const original = structuredClone(stale);
    assert.equal(catalogProductCategory(stale), "accessories", product.name);
    assert.deepEqual(stale, original);
  }
  assert.equal(catalogProductCategory(products.find((p) => p.sourceId === "10801")!), "pos");
  assert.ok(
    products.every((product) => catalogProductGroup(product)),
    "Every imported item has a catalog family",
  );
  assert.equal(
    catalogProductGroup({
      ...products[0],
      id: "unknown",
      sourceId: undefined,
      name: "Unclassified item",
      category: "industrial",
    }),
    undefined,
  );
});

test("items missing from subcategory indexes remain reachable in their own section", () => {
  const products = getSnapshotProducts();
  for (const [sourceId, section] of [
    ["C1-Precision-Balance", "/product/laboratory"],
    ["RLS1100", "/product/commercial"],
    ["TCS-150-AW31", "/product/industrial"],
    ["10648", "/product/industrial"],
    ["LED-R1", "/product/scale-peripherals"],
    ["Sticker_6040", "/product/consumables"],
    ["TMS", "/product/scale-parts"],
    ["10768", "/product/scale-parts"],
  ]) {
    const product = products.find((p) => p.sourceId === sourceId)!;
    assert.equal(supplementalCatalogSection(product), section, product.name);
  }
});
