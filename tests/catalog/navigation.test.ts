import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation, resolveNavigationItems } from "../../src/features/site/data/navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import { getPlatformSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { getAccessorySubcategories } from "../../src/features/catalog/data/accessory-subcategories";

test("legacy saved navigation adopts the new company menu without mutating saved data", () => {
  const legacy = [{ label: "เครื่องชั่ง", href: "/products", links: [] }];
  assert.equal(resolveNavigationItems(legacy), defaultNavigation);
  assert.deepEqual(legacy, [{ label: "เครื่องชั่ง", href: "/products", links: [] }]);
});

test("saved content using the current six menu destinations remains authoritative", () => {
  const current = defaultNavigation.map((item) => ({ ...item, label: `CMS ${item.label}` }));
  assert.equal(resolveNavigationItems(current), current);
});

test("primary product navigation uses the actual catalog names and category IDs", () => {
  assert.deepEqual(defaultNavigation[0].links, [
    { label: "ผลิตภัณฑ์ทั้งหมด", href: "/products" },
    ...productCategoryDefinitions.map(({ id, label }) => ({
      label,
      href: `/products?category=${id}`,
    })),
  ]);
});

test("saved product links and stale groups sync without changing other CMS menus or saved data", () => {
  const saved = defaultNavigation.map((item) => ({ ...item }));
  saved[0] = {
    ...saved[0],
    label: "CMS สินค้า",
    submenuLabel: "ชื่อเก่า",
    links: [{ label: "ชื่อเก่า", href: "/Indicator" }],
    groups: [
      { label: "ชุดเก่า", links: [{ label: "ห้องปฏิบัติการ", href: "/product/laboratory" }] },
    ],
  };
  const original = JSON.stringify(saved);
  const synced = resolveNavigationItems(saved);
  assert.deepEqual(synced[0].links, defaultNavigation[0].links);
  assert.equal(synced[0].submenuLabel, "ผลิตภัณฑ์ทั้งหมด");
  assert.equal(synced[0].label, "CMS สินค้า");
  assert.deepEqual(synced[0].groups, defaultNavigation[0].groups);
  for (let index = 1; index < saved.length; index++) assert.equal(synced[index], saved[index]);
  assert.equal(JSON.stringify(saved), original);
});

test("all product secondary groups match the real catalog's23 child IDs, displayed labels and order", () => {
  const resolvers = [
    getScaleSubcategories,
    getIndicatorSubcategories,
    getPlatformSubcategories,
    getPosSubcategories,
    getAccessorySubcategories,
  ];
  const families = productCategoryDefinitions.map(({ id, label }, index) => ({
    label,
    links: resolvers[index]([]).map((child) => ({
      label: id === "scales" ? child.label.replace(/^เครื่องชั่ง/, "") : child.label,
      href: `/products?category=${id}&subcategory=${child.id}`,
    })),
  }));
  const expected = [
    families[0],
    {
      label: "อินดิเคเตอร์และโครงสร้างแท่นชั่ง",
      links: [...families[1].links, ...families[2].links],
    },
    { label: "ระบบ POS และอุปกรณ์เสริม", links: [...families[3].links, ...families[4].links] },
  ];
  assert.deepEqual(defaultNavigation[0].groups, expected);
  const links = expected.flatMap((group) => group.links);
  assert.equal(links.length, 23);
  assert.equal(new Set(links.map((link) => link.href)).size, 23);
});

test("stale secondary groups normalize even when saved primary links already match; no other menu object changes", () => {
  for (const groups of [undefined, [], [{ label: "旧", links: [] }]]) {
    const saved = defaultNavigation.map((item) => ({ ...item }));
    saved[0] = { ...saved[0], groups };
    const before = JSON.stringify(saved);
    const result = resolveNavigationItems(saved);
    assert.deepEqual(result[0].groups, defaultNavigation[0].groups);
    assert.equal(result[0].label, saved[0].label);
    assert.equal(result[0].links, defaultNavigation[0].links);
    for (let index = 1; index < result.length; index++) assert.equal(result[index], saved[index]);
    assert.equal(JSON.stringify(saved), before);
  }
});
