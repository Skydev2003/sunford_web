import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

test("every displayed label and column matches the owner-selected specification", () => {
  const spec = readFileSync("spec.md", "utf8").split(
    "## Task: Eight-menu Navbar with three columns and destination audit",
  )[1];
  const items = getPrimaryNavigationItems(defaultNavigation);
  const rows = spec
    .split("\n")
    .filter(
      (line) =>
        line.startsWith("| ") && items.some((item) => line.split("|")[1].trim() === item.label),
    );
  assert.equal(rows.length, 8);
  rows.forEach((row, index) => {
    const expected = row
      .split("|")
      .slice(2, 5)
      .map((column) => column.split(";").map((label) => label.trim()));
    const actual = [items[index].links, ...items[index].groups!.map((group) => group.links)].map(
      (column) => column.map((link) => link.label),
    );
    assert.deepEqual(actual, expected, items[index].label);
  });
});

test("approved navigation keeps all 95 entries in three columns, including unavailable choices", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(items.length, 8);
  assert.ok(items.every((item) => item.groups?.length === 2));
  assert.ok(items.every((item) => item.groups?.[0].label === "การใช้งาน"));
  assert.ok(items.every((item) => item.groups?.[1].label === "ช่วยเหลือ"));
  assert.equal(
    items.flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
      .length,
    95,
  );
  assert.deepEqual(
    items[3].links.map((link) => link.label),
    ["เหล็กคาร์บอน", "สแตนเลส SUS304", "สแตนเลส SUS201", "พลาสติก ABS"],
  );
  assert.ok(items[3].links.every((link) => link.disabled));
});

test("readiness follows the canonical destination across contexts without disabling populated parents", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  const analytical = links.filter((link) => link.href === "/products/category/scales/analytical");
  assert.equal(analytical.length, 2);
  assert.ok(analytical.every((link) => link.disabled));
  for (const link of links.filter((link) => link.href.startsWith("/solutions/")))
    assert.equal(link.disabled, true, link.href);
  for (const href of [
    "/products/category/platforms",
    "/applications-and-softwares",
    "/warranty/register",
    "/contact-us",
  ])
    assert.ok(
      links.filter((link) => link.href === href).every((link) => !link.disabled),
      href,
    );
  assert.ok(links.some((link) => link.href === "/software/download" && link.disabled));
  assert.ok(items.every((item) => item.href.startsWith("/")));
});

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
    ["เชื่อม POS", "พิมพ์ฉลาก", "งานเปียกชื้น"],
  );
  assert.equal(scales.links.filter((link) => link.label === "อุตสาหกรรม").length, 1);
});

test("product menus use short names while leaving the old category definitions intact", () => {
  const navigation = getPrimaryNavigationItems(defaultNavigation);
  const allProducts = navigation.filter(({ href }) => href === "/products");
  const items = navigation.slice(1, 6);
  const children = defaultNavigation[0].groups!.flatMap(({ links }) => links);
  assert.equal(allProducts.length, 1);
  assert.equal(allProducts[0].label, "ผลิตภัณฑ์ทั้งหมด");
  assert.deepEqual(
    allProducts[0].links,
    ["เครื่องชั่ง", "อินดิเคเตอร์", "แท่นชั่ง", "POS", "อุปกรณ์เสริม"].map((label, index) => ({
      label,
      href: items[index].href,
    })),
  );
  assert.deepEqual(
    allProducts[0].groups?.map((group) => group.links.map((link) => link.href)),
    [
      [
        "/products/category/scales/price",
        "/products/category/scales/kitchen",
        "/products/category/scales/industrial",
        "/products/category/scales/analytical",
      ],
      ["/technical-specification", "/warranty/register", "/warranty/policy", "/contact-us"],
    ],
  );
  assert.equal(children.length, 23);
  assert.deepEqual(
    items.map((item) => item.links.length),
    [7, 3, 4, 4, 8],
  );
  assert.ok(items.every((item) => item.links.every(({ label }) => !label.includes("ทั้งหมด"))));
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
    ["/service", "/warranty/register", "/service/quotation"],
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
  const guides = items.filter((item) => item.href === href);
  assert.equal(guides.length, 1);
  assert.equal(guides[0].label, "จัดสเปค");
  assert.equal(guides[0].groups?.length, 2);
  assert.deepEqual(
    guides[0].links.map((link) => link.href),
    ["/products/category/indicators", "/products/category/platforms", href],
  );
  const result = items.find((item) => item.href === "/service")!;
  assert.equal(
    result
      .groups!.find((group) => group.label === "ช่วยเหลือ")!
      .links.filter((link) => link.href === href).length,
    0,
  );
  assert.equal(result.links.filter((link) => link.href === href).length, 0);
  assert.equal(JSON.stringify(navigation), before);
});

test("saved disabled links are preserved after alias normalization without mutating the source", () => {
  const navigation = structuredClone(defaultNavigation);
  const commercial = navigation[1].groups![0].links[0];
  commercial.disabled = true;
  const before = JSON.stringify(navigation);
  const matching = getPrimaryNavigationItems(navigation)
    .flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
    .filter((link) => link.href === "/products/category/scales/price");
  assert.equal(matching.length, 2);
  assert.ok(matching.every((link) => link.disabled));
  assert.equal(JSON.stringify(navigation), before);
});
