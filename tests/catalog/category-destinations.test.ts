import assert from "node:assert/strict";
import test from "node:test";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import { resolveHomeLink } from "../../src/features/home/data/link-targets";
import { getPrimaryNavigationItems } from "../../src/features/cms/data/primary-navigation";
import { defaultNavigation } from "../../src/features/cms/data/navigation";
import { buyingGuides } from "../../src/features/content/data/buying-guides";

test("known category links retain their category and exact current subcategory", () => {
  for (const href of [
    "/products/category/scales?subcategory=scale-industrial",
    "/products?category=scales&subcategory=scale-industrial",
  ])
    assert.equal(resolveCategoryHref(href), "/products/category/scales/industrial");
  for (const [old, expected] of [
    ["/Product/Digital-weighing", "/products/category/scales"],
    ["/Indicator/", "/products/category/indicators"],
    ["/product/scale-platforms", "/products/category/platforms"],
    ["/Product/POS", "/products/category/pos"],
    ["/product/scale-accessories", "/products/category/accessories"],
    ["/product/commercial", "/products/category/scales/price"],
    ["/collections/coffee-scales", "/products/category/scales/kitchen"],
    ["/product/industrial", "/products/category/scales/industrial"],
    ["/product/laboratory", "/products/category/scales/analytical"],
    ["/Product/POS/Android", "/products/category/pos/android"],
    ["/Product/POS/Windows", "/products/category/pos/windows"],
    ["/product/Consumables", "/products/category/accessories/consumables"],
  ])
    assert.equal(resolveCategoryHref(old), expected);
  assert.equal(
    resolveCategoryHref("/collections/stainless-steel-platforms"),
    "/products/category/platforms",
  );
  assert.equal(resolveCategoryHref("/collections/printers"), "/products/category/accessories");
});

test("unrelated links stay unchanged and a corrected category cannot retain stale filters", () => {
  for (const href of [
    "/products",
    "/products?catalog=all",
    "/products/acs30-jc21",
    "/solutions/pos",
    "/solution/mes",
    "/software/download#retail-software",
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
    "/products/category/pos/android?ref=guide#details",
  );
});

test("Home default and CMS category targets normalize while custom and disabled targets remain authoritative", () => {
  assert.equal(resolveHomeLink("digital", undefined, []), "/products/category/scales");
  assert.equal(resolveHomeLink("accessories", undefined, []), "/products/category/accessories");
  assert.equal(
    resolveHomeLink("spotlight", { pagePath: "/Indicator" }, []),
    "/products/category/indicators",
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

test("CMS legacy and corrected links project identically with all related columns retained", () => {
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
  assert.deepEqual(
    legacy.slice(1, 6).map((item) => item.groups![0].links.length),
    [4, 4, 3, 4, 4],
  );
  const services = legacy.find((item) => item.href === "/service")!;
  assert.ok(services.links.some((link) => link.href === "/solutions"));
  const solutions = corrected.find((item) => item.href === "/solutions")!;
  assert.equal(solutions.groups!.flatMap((group) => group.links).length, 18);
  assert.ok(
    solutions.groups![0].links.some(
      (link) => link.label === "ร้านกาแฟ" && link.href === "/products/category/scales/kitchen",
    ),
  );
});

test("each guide returns to its own current Navbar category and has no legacy category targets", () => {
  for (const guide of buyingGuides) {
    assert.equal(guide.productHref, `/products/category/${guide.slug}`);
    for (const { href } of guide.sections.flatMap((section) => section.links))
      assert.ok(
        href.startsWith("/products/category/") || href === "/applications-and-softwares",
        href,
      );
  }
});
