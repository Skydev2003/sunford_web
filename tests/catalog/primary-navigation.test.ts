import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation } from "../../src/features/cms/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/cms/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

test("both Header consumers get the approved category order without mutating CMS data", () => {
  const before = JSON.stringify(defaultNavigation);
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.deepEqual(
    items.map(({ label }) => label),
    [
      ...productCategoryDefinitions.map(({ label }) => label),
      "โซลูชันตามธุรกิจ",
      "ซอฟต์แวร์",
      "บริการ",
    ],
  );
  assert.deepEqual(
    items.slice(0, 5).map(({ href }) => href),
    productCategoryDefinitions.map(({ id }) => `/products/category/${id}`),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("category menus retain all23children and no duplicate all-products item", () => {
  const items = getPrimaryNavigationItems(defaultNavigation).slice(0, 5);
  const children = defaultNavigation[0].groups!.flatMap(({ links }) => links);
  assert.equal(items.flatMap(({ links }) => links).length, 23);
  for (const [index, category] of productCategoryDefinitions.entries()) {
    const expected = children.filter(
      ({ href }) => new URLSearchParams(href.split("?")[1]).get("category") === category.id,
    );
    assert.deepEqual(
      items[index].links,
      expected.map(({ href, label }) => ({
        label,
        href: `/products/category/${category.id}?subcategory=${new URLSearchParams(href.split("?")[1]).get("subcategory")}`,
      })),
    );
    assert.ok(items[index].links.every(({ label }) => !label.includes("ทั้งหมด")));
  }
});

test("company destinations stay under Services and CMS category labels stay authoritative", () => {
  const input = defaultNavigation.map((item) =>
    item.href === "/products"
      ? { ...item, links: item.links.map((link) => ({ ...link, label: `CMS ${link.label}` })) }
      : item,
  );
  const items = getPrimaryNavigationItems(input);
  assert.deepEqual(
    items.slice(0, 5).map(({ label }) => label),
    productCategoryDefinitions.map(({ label }) => `CMS ${label}`),
  );
  assert.ok(!items.some(({ href }) => ["/about-us", "/contact-us"].includes(href)));
  const services = items.find(({ href }) => href === "/service")!;
  const links = [...services.links, ...services.groups!.flatMap(({ links }) => links)];
  for (const href of ["/about-us", "/contact-us", "/warranty/register"])
    assert.ok(links.some((link) => link.href === href));
});
