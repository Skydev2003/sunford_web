import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation, resolveNavigationItems } from "../../src/features/cms/data/navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

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

test("saved primary product links sync without changing other CMS menus or secondary groups", () => {
  const saved = defaultNavigation.map((item) => ({ ...item }));
  saved[0] = {
    ...saved[0],
    label: "CMS สินค้า",
    submenuLabel: "ชื่อเก่า",
    links: [{ label: "ชื่อเก่า", href: "/Indicator" }],
  };
  const original = JSON.stringify(saved);
  const synced = resolveNavigationItems(saved);
  assert.deepEqual(synced[0].links, defaultNavigation[0].links);
  assert.equal(synced[0].submenuLabel, "ผลิตภัณฑ์ทั้งหมด");
  assert.equal(synced[0].label, "CMS สินค้า");
  assert.equal(synced[0].groups, saved[0].groups);
  for (let index = 1; index < saved.length; index++) assert.equal(synced[index], saved[index]);
  assert.equal(JSON.stringify(saved), original);
});
