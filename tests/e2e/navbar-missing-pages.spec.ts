import { expect, test, type Page } from "@playwright/test";
import { formatBaht } from "../../src/features/catalog/data/price-format";
import { getProductSubcategoryPageByHref } from "../../src/features/catalog/data/product-subcategory-pages";
import type { Product } from "../../src/features/catalog/types";

const root = "/products/category";
const accessories = `${root}/accessories`;
const printers = `${accessories}/printers`;
const paper = `${accessories}/thermal-paper`;
const labels = `${accessories}/labels`;
const consumables = `${accessories}/consumables`;
const entries = [
  ["เครื่องชั่ง", "นับจำนวนชิ้น", `${root}/scales/counting`, ["/guides/scales"]],
  [
    "เครื่องชั่ง",
    "เตือนน้ำหนักขาด–เกิน",
    `${root}/scales/checkweighing`,
    [`${root}/scales/industrial`, "/solutions/checkweighing"],
  ],
  [
    "อินดิเคเตอร์แท่นชั่ง",
    "เชื่อมต่อ RS232",
    `${root}/indicators/rs232`,
    ["/solutions/rs232", `${accessories}/cables`],
  ],
  [
    "โครงสร้างแท่นชั่ง",
    "โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์",
    `${accessories}/electronics`,
    [`${root}/platforms`, "/guides/indicator-platform-compatibility", `${accessories}/cables`],
  ],
  [
    "ระบบ POS",
    "เครื่องพิมพ์",
    printers,
    [`${root}/pos`, "/solutions/label-printing", paper, labels],
  ],
  [
    "อุปกรณ์เสริม",
    "ลูกตุ้มน้ำหนัก",
    `${accessories}/weights`,
    [`${root}/scales`, "/guides/scales"],
  ],
  ["อุปกรณ์เสริม", "กระดาษความร้อน", paper, [consumables, printers]],
  [
    "อุปกรณ์เสริม",
    "ฉลากและสติ๊กเกอร์",
    labels,
    [consumables, printers, "/solutions/label-printing"],
  ],
] as const;
const menuEntries = [
  ...entries,
  ["อุปกรณ์เสริม", entries[3][1], entries[3][2]],
  ["อุปกรณ์เสริม", entries[4][1], entries[4][2]],
] as const;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test.describe(`Navbar at ${width}px`, () => {
    const touch = width === 390;
    test.use({ viewport: { width, height: 900 }, hasTouch: touch });
    test("all ten submenu entries navigate to their listings", async ({ page }) => {
      test.setTimeout(180_000);
      for (const [parent, label, href] of menuEntries) {
        await test.step(`${parent} → ${label}`, async () => {
          await page.goto("/contact-us");
          const header = page.locator("[data-products-header]:visible");
          await expect(
            header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
          ).toBeEnabled();
          if (touch) {
            await header.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
            await header.getByRole("button", { name: `เปิดเมนูย่อย${parent}`, exact: true }).tap();
          } else {
            await header.getByRole("link", { name: parent, exact: true }).hover();
          }
          const target = header
            .locator("#products-navigation-panel")
            .getByRole("link", { name: label, exact: true });
          await expect(target).toHaveAttribute("href", href);
          if (touch) await target.tap();
          else await target.click();
          await expect(page).toHaveURL(new URL(href, page.url()).href, { timeout: 20_000 });
          await expect(page.getByRole("heading", { level: 1, name: label })).toBeVisible();
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth),
          ).toBeLessThanOrEqual(width);
        });
      }
    });
  });
}

test("the home Navbar supports keyboard activation of the new links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  const trigger = page
    .locator(".desktop-nav")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await trigger.focus();
  await trigger.press("ArrowDown");
  const link = page.locator("#desktop-submenu").getByRole("link", { name: "นับจำนวนชิ้น" });
  await expect(link).toBeVisible();
  await link.focus();
  await link.press("Enter");
  await expect(page.getByRole("heading", { level: 1, name: "นับจำนวนชิ้น" })).toBeVisible({
    timeout: 20_000,
  });
});

test("all eight direct URLs show Warehouse listings and related pages at tablet width", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 768, height: 1024 });
  const result = await request.get("/api/products");
  expect(result.ok()).toBe(true);
  const { products } = (await result.json()) as { products: Product[] };
  expect(products.length).toBeGreaterThan(0);
  const relatedPaths = new Set<string>();

  for (const [, title, href, related] of entries) {
    const response = await page.goto(href);
    expect(response?.ok()).toBe(true);
    const main = page.locator("[data-product-subcategory-page]");
    await expect(main.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    const breadcrumb = main.getByRole("navigation", { name: "เส้นทางนำทาง" });
    await expect(
      breadcrumb.locator(`a[href="${href.slice(0, href.lastIndexOf("/"))}"]`),
    ).toBeVisible();
    const links = main.getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" });
    for (const path of related) {
      await expect(links.locator(`a[href="${path}"]`)).toBeVisible();
      relatedPaths.add(path);
    }
    await expect(links.locator('a[href="/contact-us"]')).toBeVisible();
    const definition = getProductSubcategoryPageByHref(href);
    if (!definition || !("matches" in definition)) throw new Error(`Missing listing for ${href}`);
    const expected = products.filter(definition.matches);
    const cards = main.locator("#mock-product-results article");
    if (expected.length > 24) {
      const more = main.getByRole("button", { name: /ดูเพิ่มเติม/ });
      for (let displayed = 24; displayed < expected.length; displayed += 24) await more.click();
    }
    await expect(cards).toHaveCount(expected.length);
    await expect(main.locator("article[data-mock-product]")).toHaveCount(0);
    const actual = await cards
      .locator("h3")
      .evaluateAll((headings) =>
        headings.map((heading) => heading.closest("a")?.getAttribute("href")),
      );
    expect(actual.sort()).toEqual(
      expected.map(({ slug }) => `/products/${slug}?from=${definition.id}`).sort(),
    );
    if (!expected.length) {
      await expect(main.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      768,
    );
  }
  for (const path of relatedPaths) {
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    expect(await response.text(), path).not.toContain('content="noindex"');
  }
  const listing = page.locator("[data-product-subcategory-page]");
  await listing.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-such-sunford-model");
  await expect(listing.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
  await expect(
    listing
      .getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" })
      .locator(`a[href="${printers}"]`),
  ).toBeVisible();
});

async function follow(page: Page, parent: string, label: string, href: string) {
  await page.goto(parent);
  const main = page.getByRole("main");
  const link = main.locator(`a[href="${href}"]`);
  const chapter = main
    .locator("#products-chapters")
    .getByRole("button", { name: label, exact: true });
  const target = link.or(chapter);
  await expect(target).toContainText(label);
  await target.click({ timeout: 12_000 });
  await expect(page).toHaveURL(new URL(href, page.url()).href, { timeout: 20_000 });
}

test("category pages, consumables and product detail connect back to the new listings", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const parents = [
    "scales",
    "scales",
    "indicators",
    "platforms",
    "pos",
    "accessories",
    "accessories",
    "accessories",
    "accessories",
    "accessories",
  ];
  for (const [index, [, label, href]] of menuEntries.entries()) {
    await follow(page, `${root}/${parents[index]}`, label, href);
  }
  await follow(page, consumables, "กระดาษความร้อน", paper);
  await follow(page, consumables, "ฉลากและสติ๊กเกอร์", labels);
  await page.goto(printers);
  const card = page.locator("#mock-product-results article").first();
  await expect(card).toBeVisible();
  const heading = card.getByRole("heading", { level: 3 });
  const detailPath = await heading.locator("..").getAttribute("href");
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  const product = products.find(
    ({ slug }) => detailPath === `/products/${slug}?from=accessory-printers`,
  );
  expect(product?.warehouseSku).toBeTruthy();
  await heading.click();
  await expect(page.locator(".detail-price")).toHaveText(
    product?.price == null ? "สอบถามราคา" : formatBaht(product.price),
  );
  const back = page.locator(".back-link:visible");
  await expect(back).toHaveAttribute("href", printers);
  await back.click();
  await expect(page).toHaveURL(new URL(printers, page.url()).href);
  await expect(card).toBeVisible();
  await page.goto(`${root}/indicators/lcd`);
  await expect(page.locator('[data-product-subcategory-page="indicator-lcd"]')).toBeVisible();
  await page.goto(`${root}/scales/industrial`);
  await expect(page.locator('[data-product-subcategory-page="scale-industrial"]')).toBeVisible();
  await page.goto(`${root}/indicators/unknown-group`);
  await expect(page.locator("[data-product-subcategory-page]")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ไม่พบ");
});
