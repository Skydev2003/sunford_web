import assert from "node:assert/strict";
import test from "node:test";
import {
  indicatorSubcategoryPages,
  platformSubcategoryPages,
  posSubcategoryPages,
  accessorySubcategoryPages,
  getProductSubcategoryPage,
  getProductReturnPage,
} from "../../src/features/catalog/data/product-subcategory-pages";
import { scaleSubcategoryPages } from "../../src/features/catalog/data/scale-subcategory-pages";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";

test("LCD LED and waterproof indicators have exact canonical pages and whitelisted returns", () => {
  assert.deepEqual(
    indicatorSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["indicator-lcd", "/products/category/indicators/lcd"],
      ["indicator-led", "/products/category/indicators/led"],
      ["indicator-waterproof", "/products/category/indicators/waterproof"],
    ],
  );
  for (const page of indicatorSubcategoryPages) {
    for (const prefix of ["/products?category=indicators&", "/products/category/indicators?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "scales"), undefined);
  }
});

test("indicator IDs cannot hijack another family and unknown returns stay unresolved", () => {
  for (const href of [
    "/products?category=pos&subcategory=indicator-lcd",
    "/products/category/scales?subcategory=indicator-led",
    "/products/category/indicators?subcategory=scale-price",
    "/products/category/indicators?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  for (const context of ["https://example.com", "/products/category/indicators/lcd", "unknown"])
    assert.equal(getProductReturnPage(context), undefined);
});

test("shared registry retains every existing scale path, title and return alias", () => {
  for (const page of scaleSubcategoryPages) {
    assert.equal(getProductSubcategoryPage(page.id, "scales")?.href, page.href);
    assert.equal(getProductReturnPage(page.returnContext)?.title, page.label);
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
  }
  assert.equal(
    getProductReturnPage("industrial-scales")?.href,
    "/products/category/scales/industrial",
  );
});

test("four platform materials have exact own-parent routes and safe return contexts", () => {
  assert.deepEqual(
    platformSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["platform-carbon-steel", "/products/category/platforms/carbon-steel"],
      ["platform-sus304", "/products/category/platforms/sus304"],
      ["platform-sus201", "/products/category/platforms/sus201"],
      ["platform-abs", "/products/category/platforms/abs"],
    ],
  );
  for (const page of platformSubcategoryPages) {
    for (const prefix of ["/products?category=platforms&", "/products/category/platforms?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "indicators"), undefined);
  }
});

test("platform expansion preserves cross-family boundaries and broader parent aliases", () => {
  for (const href of [
    "/products?category=pos&subcategory=platform-sus304",
    "/products/category/scales?subcategory=platform-abs",
    "/products/category/platforms?subcategory=indicator-lcd",
    "/products/category/platforms?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(
    resolveCategoryHref("/collections/stainless-steel-platforms"),
    "/products/category/platforms",
  );
  assert.equal(resolveCategoryHref("/product/benchtop-platforms"), "/products/category/platforms");
  assert.equal(getProductReturnPage("/products/category/platforms/abs"), undefined);
});

test("three POS platforms have exact own-parent pages and safe originating contexts", () => {
  assert.deepEqual(
    posSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["pos-ios", "/products/category/pos/ios"],
      ["pos-android", "/products/category/pos/android"],
      ["pos-windows", "/products/category/pos/windows"],
    ],
  );
  for (const page of posSubcategoryPages) {
    for (const prefix of ["/products?category=pos&", "/products/category/pos?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "platforms"), undefined);
  }
});

test("POS expansion preserves unknown and cross-family boundaries", () => {
  for (const href of [
    "/products?category=unknown&subcategory=pos-ios",
    "/products/category/platforms?subcategory=pos-android",
    "/products/category/pos?subcategory=indicator-lcd",
    "/products/category/pos?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(getProductReturnPage("/products/category/pos/ios"), undefined);
  assert.equal(resolveCategoryHref("/product/pos"), "/products/category/pos");
});

test("five accessory groups have exact own-parent routes and whitelisted return contexts", () => {
  assert.deepEqual(
    accessorySubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["accessory-displays", "/products/category/accessories/displays"],
      ["accessory-cables", "/products/category/accessories/cables"],
      ["accessory-mechanical", "/products/category/accessories/mechanical"],
      ["accessory-pos", "/products/category/accessories/pos"],
      ["accessory-consumables", "/products/category/accessories/consumables"],
    ],
  );
  for (const page of accessorySubcategoryPages) {
    for (const prefix of ["/products?category=accessories&", "/products/category/accessories?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "pos"), undefined);
  }
});

test("accessory expansion preserves broader aliases and cross-family boundaries", () => {
  for (const href of [
    "/products?category=pos&subcategory=accessory-pos",
    "/products/category/accessories?subcategory=pos-ios",
    "/products/category/indicators?subcategory=accessory-displays",
    "/products/category/accessories?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  for (const href of [
    "/product/data-interfaces",
    "/product/scale-peripherals",
    "/collections/printers",
  ])
    assert.equal(resolveCategoryHref(href), "/products/category/accessories");
  assert.equal(getProductReturnPage("/products/category/accessories/pos"), undefined);
});
