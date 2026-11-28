import assert from "node:assert/strict";
import test from "node:test";
import {
  scaleSubcategoryPages,
  getScaleReturnPage,
  getScaleSubcategoryPage,
} from "../../src/features/catalog/data/scale-subcategory-pages";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";

test("all eight source scale groups have stable, distinct listing routes and safe return contexts", () => {
  assert.deepEqual(
    scaleSubcategoryPages.map((page) => page.slug),
    ["retail", "industrial", "laboratory", "household", "water-dust", "benchtop", "floor", "pole"],
  );
  assert.equal(new Set(scaleSubcategoryPages.map((page) => page.href)).size, 8);
  for (const page of scaleSubcategoryPages) {
    for (const path of ["/products?category=scales&", "/scales?"]) {
      assert.equal(
        resolveCategoryHref(`${path}subcategory=${page.id}&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    }
    assert.equal(getScaleReturnPage(page.returnContext)?.href, page.href);
  }
  assert.equal(getScaleReturnPage("industrial-scales")?.href, "/scales/industrial");
  for (const unknown of ["https://example.com", "/scales/price", "indicator-led", "unknown"]) {
    assert.equal(getScaleReturnPage(unknown), undefined);
    assert.equal(getScaleSubcategoryPage(unknown), undefined);
  }
});

test("scale-looking IDs cannot take over a different parent or an unknown subgroup", () => {
  for (const href of [
    "/products?category=pos&subcategory=scale-price",
    "/platforms/indicators?subcategory=scale-price",
    "/scales?subcategory=unknown",
  ]) {
    assert.equal(resolveCategoryHref(href), href);
  }
});
