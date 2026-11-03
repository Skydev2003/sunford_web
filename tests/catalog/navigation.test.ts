import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation, resolveNavigationItems } from "../../src/features/cms/data/navigation";

test("legacy saved navigation adopts the new company menu without mutating saved data", () => {
  const legacy = [{ label: "เครื่องชั่ง", href: "/products", links: [] }];
  assert.equal(resolveNavigationItems(legacy), defaultNavigation);
  assert.deepEqual(legacy, [{ label: "เครื่องชั่ง", href: "/products", links: [] }]);
});

test("saved content using the current six menu destinations remains authoritative", () => {
  const current = defaultNavigation.map((item) => ({ ...item, label: `CMS ${item.label}` }));
  assert.equal(resolveNavigationItems(current), current);
});
