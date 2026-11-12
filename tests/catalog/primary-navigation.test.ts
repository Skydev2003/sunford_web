import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";

test("both Header consumers get the approved category order without mutating CMS data", () => {
  const before = JSON.stringify(defaultNavigation);
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.deepEqual(
    items.map(({ label }) => label),
    [
      "ผลิตภัณฑ์ทั้งหมด",
      ...productCategoryDefinitions.map(({ label }) => label),
      "จัดสเปค",
      "บริการ",
    ],
  );
  assert.deepEqual(
    items.slice(1, 6).map(({ href }) => href),
    productCategoryDefinitions.map(({ id }) => `/products/category/${id}`),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("related business labels stay distinct from product child labels after canonicalization", () => {
  const scales = getPrimaryNavigationItems(defaultNavigation).find(
    ({ href }) => href === "/products/category/scales",
  )!;
  assert.deepEqual(
    scales.groups![0].links.map((link) => link.label),
    ["ร้านค้าและตลาดสด", "ร้านกาแฟ", "เครื่องชั่งสำหรับโรงงาน", "เครื่องชั่งสำหรับห้องแล็บ"],
  );
  assert.equal(scales.links.filter((link) => link.label === "อุตสาหกรรมงานผลิต").length, 1);
});

test("product menus retain 23 subcategories and expose the three overview groups", () => {
  const navigation = getPrimaryNavigationItems(defaultNavigation);
  const allProducts = navigation.filter(({ href }) => href === "/products");
  const items = navigation.slice(1, 6);
  const children = defaultNavigation[0].groups!.flatMap(({ links }) => links);
  assert.equal(allProducts.length, 1);
  assert.equal(allProducts[0].label, "ผลิตภัณฑ์ทั้งหมด");
  assert.deepEqual(
    allProducts[0].links,
    items.map(({ label, href }) => ({ label, href })),
  );
  assert.deepEqual(
    allProducts[0].groups?.map((group) => group.links.map((link) => link.href)),
    [
      ["/products", "/technical-specification", "/software/download"],
      ["/service", "/warranty/register", "/contact-us"],
    ],
  );
  assert.equal(items.flatMap(({ links }) => links).length, 23);
  for (const [index, category] of productCategoryDefinitions.entries()) {
    const expected = children.filter(
      ({ href }) => new URLSearchParams(href.split("?")[1]).get("category") === category.id,
    );
    assert.deepEqual(
      items[index].links,
      expected.map(({ href, label }) => ({
        label,
        href: resolveCategoryHref(
          `/products/category/${category.id}?subcategory=${new URLSearchParams(href.split("?")[1]).get("subcategory")}`,
        ),
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
    items.slice(1, 6).map(({ label }) => label),
    productCategoryDefinitions.map(({ label }) => `CMS ${label}`),
  );
  assert.ok(!items.some(({ href }) => ["/about-us", "/contact-us"].includes(href)));
  const services = items.find(({ href }) => href === "/service")!;
  assert.deepEqual(
    services.links.map((link) => link.href),
    ["/solutions", "/applications-and-softwares", "/service", "/service/quotation"],
  );
  const links = [...services.links, ...services.groups!.flatMap(({ links }) => links)];
  for (const href of ["/about-us", "/contact-us", "/warranty/register"])
    assert.ok(links.some((link) => link.href === href));
});
test("the guide appears once at the top level and saved Services copies are removed", () => {
  const href = "/guides/indicator-platform-compatibility";
  const navigation = structuredClone(defaultNavigation);
  const services = navigation.find((item) => item.href === "/service")!;
  services.links.push({ label: "จัดสเปคเครื่องชั่ง", href });
  services.groups![0].links.push({ label: "จัดสเปคเครื่องชั่ง", href });
  navigation.push({ label: "ชื่อเดิม", href, links: [] });
  const before = JSON.stringify(navigation);
  const items = getPrimaryNavigationItems(navigation);
  assert.deepEqual(
    items.filter((item) => item.href === href),
    [{ label: "จัดสเปค", href, links: [], groups: [] }],
  );
  const result = items.find((item) => item.href === "/service")!;
  assert.equal(
    result
      .groups!.find((group) => group.label === "ข้อมูลและความช่วยเหลือ")!
      .links.filter((link) => link.href === href).length,
    0,
  );
  assert.equal(result.links.filter((link) => link.href === href).length, 0);
  assert.equal(JSON.stringify(navigation), before);
});
