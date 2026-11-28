import { getProductSubcategoryPageByHref } from "../../src/features/catalog/data/product-subcategory-pages";
import assert from "node:assert/strict";
import test from "node:test";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import { resolveHomeLink } from "../../src/features/home/data/link-targets";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { buyingGuides } from "../../src/features/content/data/buying-guides";
import { isProductCategoryPath } from "../../src/features/catalog/data/category-paths";

test("known category links retain their category and exact current subcategory", () => {
  for (const href of [
    "/scales?subcategory=scale-industrial",
    "/products/scales?subcategory=scale-industrial",
    "/products?category=scales&subcategory=scale-industrial",
  ])
    assert.equal(resolveCategoryHref(href), "/scales/industrial");
  for (const [old, expected] of [
    ["/Product/Digital-weighing", "/scales"],
    ["/Indicator/", "/platforms/indicators"],
    ["/product/scale-platforms", "/platforms"],
    ["/Product/POS", "/pos"],
    ["/product/scale-accessories", "/accessories"],
    ["/product/commercial", "/scales/retail"],
    ["/collections/coffee-scales", "/scales/household"],
    ["/product/industrial", "/scales/industrial"],
    ["/product/laboratory", "/scales/laboratory"],
    ["/Product/POS/Android", "/pos/android"],
    ["/Product/POS/Windows", "/pos/windows"],
    ["/product/Consumables", "/accessories/consumables"],
  ])
    assert.equal(resolveCategoryHref(old), expected);
  assert.equal(resolveCategoryHref("/collections/stainless-steel-platforms"), "/platforms");
  assert.equal(resolveCategoryHref("/collections/printers"), "/accessories");
});

test("unrelated links stay unchanged and a corrected category cannot retain stale filters", () => {
  for (const href of [
    "/products",
    "/products?catalog=all",
    "/products/acs30-jc21",
    "/solutions/pos",
    "/mes",
    "/software#retail-software",
    "/custom-page",
    "https://www.sunford.co/Indicator",
    "//example.com/Indicator",
    "#business-1",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(
    resolveCategoryHref(
      "/Product/POS/Android?category=scales&subcategory=wrong&catalog=all&ref=guide#details",
    ),
    "/pos/android?ref=guide#details",
  );
});

test("renamed main pages preserve queries and use the correct section anchor", () => {
  assert.equal(
    resolveCategoryHref("/products/category/platforms?ref=guide"),
    "/platforms?ref=guide",
  );
  assert.equal(
    resolveCategoryHref("/products/indicators#product-lineup-indicators"),
    "/platforms/indicators#product-lineup-indicators",
  );
  assert.equal(
    resolveCategoryHref("/software/download?ref=guide#retail-software"),
    "/software?ref=guide#retail-software",
  );
  assert.equal(
    resolveCategoryHref("/guides/indicator-platform-compatibility"),
    "/platforms/custom-spec",
  );
  assert.equal(
    resolveCategoryHref("/products/mes/batch-control?ref=guide"),
    "/mes/batch-control?ref=guide",
  );
});

test("new listing routes only consume filter parameters for their own category", () => {
  assert.equal(
    resolveCategoryHref(
      "/products?category=accessories&subcategory=accessory-printers&catalog=all&ref=menu#details",
    ),
    "/accessories/printers?ref=menu#details",
  );
  const crossCategory = "/pos?subcategory=accessory-printers&ref=menu";
  assert.equal(resolveCategoryHref(crossCategory), crossCategory);
});

test("Home default and CMS category targets normalize while custom and disabled targets remain authoritative", () => {
  assert.equal(resolveHomeLink("digital", undefined, []), "/scales");
  assert.equal(resolveHomeLink("accessories", undefined, []), "/accessories");
  assert.equal(
    resolveHomeLink("spotlight", { pagePath: "/Indicator" }, []),
    "/platforms/indicators",
  );
  assert.equal(resolveHomeLink("smart", { pagePath: "/about-us" }, []), "/about-us");
  assert.equal(resolveHomeLink("digital", { pagePath: "/products" }, []), "/products");
  assert.equal(
    resolveHomeLink("digital", { pagePath: "/Indicator", disabled: true }, []),
    undefined,
  );
  assert.equal(
    resolveHomeLink("digital", { productId: "missing", pagePath: "/Indicator" }, []),
    undefined,
  );
});

test("CMS legacy and corrected links project identically with live feature columns", () => {
  const before = structuredClone(defaultNavigation);
  const corrected = defaultNavigation.map((item) => ({
    ...item,
    groups: item.groups?.map((group) => ({
      ...group,
      links: group.links.map((link) => ({ ...link, href: resolveCategoryHref(link.href) })),
    })),
  }));
  const legacy = getPrimaryNavigationItems(defaultNavigation);
  assert.deepEqual(getPrimaryNavigationItems(corrected), legacy);
  assert.deepEqual(defaultNavigation, before);
  assert.equal(legacy.find(({ href }) => href === "/scales")?.groups?.[0].links.length, 5);
  const services = legacy.find((item) => item.href === "/service")!;
  assert.ok(services.groups![0].links.some((link) => link.href === "/service/articles"));
  assert.ok(
    !services.groups!.flatMap((group) => group.links).some((link) => link.href === "/solutions"),
  );
  const solutions = corrected.find((item) => item.href === "/solutions")!;
  assert.equal(solutions.groups!.flatMap((group) => group.links).length, 18);
  assert.ok(
    solutions.groups![0].links.some(
      (link) => link.label === "ร้านกาแฟ" && link.href === "/scales/household",
    ),
  );
});

test("each guide returns to its own current Navbar category and has no legacy category targets", () => {
  for (const guide of buyingGuides) {
    assert.equal(guide.productHref, `/${guide.slug}`);
    for (const { href } of guide.sections.flatMap((section) => section.links))
      assert.ok(
        Boolean(getProductSubcategoryPageByHref(href)) ||
          isProductCategoryPath(href) ||
          href === "/software",
        href,
      );
  }
});
