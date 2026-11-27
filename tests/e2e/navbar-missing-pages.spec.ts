import { expect, test, type Page } from "@playwright/test";
import { formatBaht } from "../../src/features/catalog/data/price-format";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { getProductSubcategoryPageByHref } from "../../src/features/catalog/data/product-subcategory-pages";
import type { Product } from "../../src/features/catalog/types";

const root = "/products/category";
const accessories = `${root}/accessories`;
const printers = `${accessories}/printers`;
const paper = `${accessories}/thermal-paper`;
const labels = `${accessories}/labels`;
const consumables = `${accessories}/consumables`;
const scaleGuide = "/technical-specification?guide=scales";
const entries = [
  ["เครื่องชั่ง", "นับจำนวนชิ้น", `${root}/scales/counting`, [scaleGuide]],
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
  ["อุปกรณ์เสริม", "ลูกตุ้มน้ำหนัก", `${accessories}/weights`, [`${root}/scales`, scaleGuide]],
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
    test("every feature link opens a real listing with the matching filter and products", async ({
      page,
    }) => {
      test.setTimeout(180_000);
      await page.goto("/service");
      const header = page.locator("[data-products-header]:visible");
      const column = header.locator('#products-navigation-panel [data-nav-column="uses"]');
      async function openFeatures(parent: string) {
        await expect(
          header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
        ).toBeEnabled();
        if (touch) {
          await header.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
          await header.getByRole("button", { name: `เปิดเมนูย่อย${parent}`, exact: true }).tap();
        } else {
          await header.getByRole("link", { name: parent, exact: true }).hover();
        }
        await expect(column.getByText("คุณสมบัติ", { exact: true })).toBeVisible();
      }
      for (const { id, label: parent } of productCategoryDefinitions) {
        await openFeatures(parent);
        await expect(column.getByRole("link").first()).toBeVisible();
        const links = await column.getByRole("link").evaluateAll((nodes) =>
          nodes.map((node) => ({
            label: node.textContent!.trim(),
            href: node.getAttribute("href")!,
          })),
        );
        expect(links.length).toBeLessThanOrEqual(6);
        expect(new Set(links.map(({ label }) => label)).size).toBe(links.length);
        for (const [index, { label, href }] of links.entries()) {
          await test.step(`${parent} → ${label}`, async () => {
            if (index > 0) await openFeatures(parent);
            const url = new URL(href, page.url());
            const definition = getProductSubcategoryPageByHref(url.pathname);
            expect(definition?.categoryId).toBe(id);
            expect(url.searchParams.get("feature")).toBeTruthy();
            expect(url.hash).toBe(`#product-listing-${id}`);
            const link = column.getByRole("link", { name: label, exact: true });
            if (touch) await link.tap();
            else await link.click();
            await expect(page).toHaveURL(url.href);
            const listing = page.locator(url.hash);
            const filter = listing.getByRole("button", { name: label, exact: true });
            await expect(filter).toHaveAttribute("aria-pressed", "true");
            await expect(filter).toBeInViewport();
            await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
            await expect(listing.locator("#mock-product-results article").first()).toBeVisible();
            await expect(listing.locator("[data-mock-product]")).toHaveCount(0);
          });
        }
      }
    });
  });
}

test("the home Navbar supports keyboard activation of the new links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  const trigger = page
    .locator(".desktop-nav")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await trigger.focus();
  await trigger.press("ArrowDown");
  const link = page
    .locator("#products-navigation-panel")
    .getByRole("link", { name: "นับจำนวนชิ้น" });
  await expect(link).toBeVisible();
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(
    /\/scales\/counting\?feature=scale-counting#product-listing-scales$/,
  );
  await expect(page.getByRole("heading", { level: 1, name: "นับจำนวนชิ้น" })).toBeVisible({
    timeout: 20_000,
  });
  const listing = page.locator("#product-listing-scales:visible");
  await expect(listing).toBeInViewport();
  await expect(listing.getByRole("button", { name: "นับจำนวนชิ้น", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("catalog bookmarks and submenu navigation keep the heading and search reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/category/scales/analytical#product-listing-scales");
  const main = page.locator("main:visible");
  await expect(main.getByRole("heading", { level: 1 })).toBeInViewport();
  await expect(main.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toBeInViewport();
  const start = await page.evaluate(() => performance.timeOrigin);
  await main
    .getByRole("navigation", { name: "หมวดย่อยสินค้า" })
    .getByRole("link", { name: "ครัวเรือน" })
    .click();
  await expect(page).toHaveURL("/products/category/scales/kitchen");
  await expect(main.getByRole("heading", { level: 1 })).toBeInViewport();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(start);

  await page.evaluate(() =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }),
  );
  const header = page.locator("header[data-products-header]:visible");
  await header.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).hover();
  await header
    .locator('#products-navigation-panel [data-nav-column="primary"]')
    .getByRole("link", { name: "ระบบ POS", exact: true })
    .click();
  await expect(page).toHaveURL("/products/category/pos#product-lineup-pos");
  await expect(main.getByRole("heading", { name: "ระบบ POS", level: 1 })).toBeInViewport();
  expect(await page.evaluate(() => performance.timeOrigin)).toBe(start);
});

test.describe("catalog touch navigation", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("a bookmarked listing can switch category in the same document", async ({ page }) => {
    await page.goto("/products/category/scales/analytical#product-listing-scales");
    const main = page.locator("main:visible");
    await expect(main.locator("#mock-product-results article").first()).toBeVisible();
    await expect(page.getByRole("button", { name: "เปิดเมนู", exact: true })).toBeEnabled();
    const before = await page.evaluate(() => performance.timeOrigin);
    await main
      .getByRole("navigation", { name: "หมวดย่อยสินค้า" })
      .getByRole("link", { name: "ครัวเรือน", exact: true })
      .tap();
    await expect(page).toHaveURL("/products/category/scales/kitchen");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("เครื่องชั่งงานครัวและกาแฟ");
    await expect(main.getByRole("heading", { level: 1 })).toBeInViewport();
    expect(await page.evaluate(() => performance.timeOrigin)).toBe(before);
  });
});

test("the POS scanner and cash drawer listing shows only the selected SKUs and has a return link", async ({
  page,
  request,
}) => {
  const href = `${accessories}/scanners-and-cash-drawers`;
  const from = "accessory-scanners-and-cash-drawers";
  const skus = ["G107374", "G107381", "G107411", "SUNFORDDRW350-B", "SUNFORDDRW350-W"];
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  const expectedPaths = skus.map((sku) => {
    const product = products.find(({ warehouseSku }) => warehouseSku === sku);
    expect(product, sku).toBeDefined();
    return `/products/${product!.slug}?from=${from}`;
  });

  await page.goto(href);
  const listing = page.locator(`[data-product-subcategory-page="${from}"]`);
  await expect(
    listing.getByRole("heading", { level: 1, name: "สแกนเนอร์และลิ้นชัก" }),
  ).toBeVisible();
  const headings = listing.locator("#mock-product-results article h3");
  await expect(headings).toHaveCount(skus.length);
  const actualPaths = await headings.evaluateAll((nodes) =>
    nodes.map((node) => node.closest("a")?.getAttribute("href")),
  );
  expect(actualPaths.sort()).toEqual(expectedPaths.sort());
  await headings.first().click();
  const back = page.locator(".back-link:visible");
  await expect(back).toHaveAttribute("href", href);
  await back.click();
  await expect(listing).toBeVisible();
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
    await expect(links.locator('a[href="/service?section=contact"]')).toBeVisible();
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

async function follow(
  page: Page,
  parent: string,
  label: string,
  href: string,
  fromChapter = false,
) {
  await page.goto(parent);
  const main = page.getByRole("main");
  const target = fromChapter
    ? main.locator("#products-chapters").getByRole("button", { name: label, exact: true })
    : main.locator(`a[href="${href}"]`);
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
    const parent = parents[index];
    const fromChapter =
      parent === "accessories" &&
      [`${accessories}/weights`, `${accessories}/electronics`, printers].includes(href);
    await follow(page, `${root}/${parent}`, label, href, fromChapter);
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
