import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

const selectedSpec = readFileSync("spec.md", "utf8")
  .split("## Task: Fix product tooltip and Contact hydration before UAT delivery")[1]
  .split("## Task:")[0];

test("every displayed label and column matches the owner-selected specification", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  const rows = selectedSpec
    .split("\n")
    .filter(
      (line) =>
        line.startsWith("| ") && items.some((item) => line.split("|")[1].trim() === item.label),
    );
  assert.equal(rows.length, 8);
  rows.forEach((row, index) => {
    const columns = row
      .split("|")
      .slice(2, 5)
      .map((column) => column.trim().split(":"));
    assert.deepEqual(
      [items[index].submenuLabel, ...items[index].groups!.map((group) => group.label)],
      columns.map(([label]) => label),
    );
    const expected = columns.map(([, links]) =>
      links.split(";").map((label) => label.trim().replace(/\s+\[[ABC]\]$/, "")),
    );
    const actual = [items[index].links, ...items[index].groups!.map((group) => group.links)].map(
      (column) => column.map((link) => link.label),
    );
    assert.deepEqual(actual, expected, items[index].label);
  });
});

test("owner-edited Navbar keeps 99 entries in three columns with 71 ready and 28 unavailable", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(items.length, 8);
  assert.ok(items.every((item) => item.groups?.length === 2));
  assert.deepEqual(
    items.map((item) => item.groups![0].label),
    [
      "การใช้งาน",
      "คุณสมบัติ",
      "การใช้งาน",
      "เลือกอุปกรณ์ร่วม",
      "ระบบและอุปกรณ์",
      "วัสดุสิ้นเปลือง",
      "ตรวจสอบก่อนเลือก",
      "ซอฟต์แวร์และเอกสาร",
    ],
  );
  assert.ok(items.every((item) => item.groups?.[1].label === "ช่วยเหลือ"));
  assert.equal(
    items.flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
      .length,
    99,
  );
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  assert.equal(links.filter((link) => !link.disabled).length, 71);
  assert.equal(links.filter((link) => link.disabled).length, 28);
  assert.deepEqual(
    items[3].links.map((link) => link.label),
    ["พลาสติก ABS", "เหล็กคาร์บอน", "สแตนเลส SUS304", "สแตนเลส SUS201", "แท่นชั่งทั้งหมด"],
  );
  assert.ok(!items[3].links.at(-1)!.disabled);
  assert.ok(items[3].links.slice(0, -1).every((link) => link.disabled));
  for (const item of items)
    for (const column of [item.links, ...item.groups!.map((group) => group.links)])
      assert.ok(
        column.every(
          (link, index) => !index || column[index - 1].label.length <= link.label.length,
        ),
      );
});

test("readiness follows the canonical destination across contexts without disabling populated parents", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  const analytical = links.filter((link) => link.href === "/products/category/scales/analytical");
  assert.equal(analytical.length, 1);
  assert.ok(analytical.every((link) => link.disabled));
  const rows = selectedSpec
    .split("\n")
    .map((line) => line.split("|").map((part) => part.trim()))
    .filter((parts) => /^\d+\.\d+\.\d+$/.test(parts[1] ?? ""));
  assert.equal(rows.length, 99);
  for (const row of rows) {
    const [menu, column, index] = row[1].split(".").map(Number);
    const item = items[menu - 1];
    const link = [item.links, ...item.groups!.map((group) => group.links)][column - 1][index - 1];
    assert.equal(link.href, row[4].replaceAll("`", ""));
    assert.equal(Boolean(link.disabled), row[3] !== "A", row[2]);
  }
  assert.ok(!links.some((link) => link.href.startsWith("/solutions/")));
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

test("product functions stay separate from machine families and pending functions remain disabled", () => {
  const scales = getPrimaryNavigationItems(defaultNavigation).find(
    ({ href }) => href === "/products/category/scales",
  )!;
  assert.deepEqual(
    scales.groups![0].links.map((link) => link.label),
    ["กันน้ำ", "ตั้งโต๊ะ", "ตั้งพื้น", "นับจำนวนชิ้น", "เตือนน้ำหนักขาด–เกิน"],
  );
  assert.equal(scales.links.filter((link) => link.label === "งานผลิตและอุตสาหกรรม").length, 1);
  assert.ok(!scales.groups![0].links[0].disabled);
  assert.ok(scales.groups![0].links.slice(3).every((link) => link.disabled));
});

test("product menus keep selected full names and all-items links without changing legacy categories", () => {
  const navigation = getPrimaryNavigationItems(defaultNavigation);
  const allProducts = navigation.filter(({ href }) => href === "/products");
  const items = navigation.slice(1, 6);
  const children = defaultNavigation[0].groups!.flatMap(({ links }) => links);
  assert.equal(allProducts.length, 1);
  assert.equal(allProducts[0].label, "ผลิตภัณฑ์ทั้งหมด");
  assert.deepEqual(
    allProducts[0].links.toSorted((a, b) => a.href.localeCompare(b.href)),
    ["เครื่องชั่ง", "อินดิเคเตอร์แท่นชั่ง", "โครงสร้างแท่นชั่ง", "ระบบ POS", "อุปกรณ์เสริม"]
      .map((label, index) => ({
        label,
        href: items[index].href,
      }))
      .toSorted((a, b) => a.href.localeCompare(b.href)),
  );
  assert.deepEqual(
    allProducts[0].groups?.map((group) => group.links.map((link) => link.href)),
    [
      [
        "/products/category/scales/kitchen",
        "/applications-and-softwares",
        "/products/category/scales/price",
        "/products/category/scales/industrial",
      ],
      ["/technical-specification", "/contact-us", "/warranty/policy", "/warranty/register"],
    ],
  );
  assert.equal(children.length, 23);
  assert.deepEqual(
    items.map((item) => item.links.length),
    [7, 4, 5, 5, 8],
  );
  assert.ok(
    items.every((item) => item.links.some((link) => link.href === item.href && !link.disabled)),
  );
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
    ["/service/quotation", "/service", "/warranty/register"],
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
    [
      "/products/category/platforms",
      "/products/category/accessories",
      href,
      "/products/category/indicators",
    ],
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
