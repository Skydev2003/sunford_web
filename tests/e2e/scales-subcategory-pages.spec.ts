import { expect, test, type Page, type APIRequestContext } from "@playwright/test";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import { scaleSubcategoryPages } from "../../src/features/catalog/data/scale-subcategory-pages";
import { catalogModelLabel } from "../../src/features/catalog/data/catalog-card-names";
import type { Product } from "../../src/features/catalog/types";

const pages = scaleSubcategoryPages.filter((page) => page.id !== "scale-industrial");
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function sourceGroup(request: APIRequestContext, id: string) {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  return getScaleSubcategories(products).find((group) => group.id === id)!;
}

async function verifyListing(page: Page, request: APIRequestContext, id: string, href: string) {
  const source = await sourceGroup(request, id);
  const models = source.entries!.map((entry) => catalogModelLabel(entry.model));
  await page.goto(href);
  const main = page.locator(`[data-scale-subcategory-page="${id}"]:visible`);
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(source.label);
  const cards = main.locator("#mock-product-results article");
  await expect(cards.locator("h3")).toHaveText(models.slice(0, 24));
  if (models.length > 24) await main.getByRole("button", { name: /ดูเพิ่มเติม/ }).click();
  await expect(cards.locator("h3")).toHaveText(models);
  const mockCount = source.entries!.filter((entry) => !entry.productId).length;
  await expect(main.locator("article[data-mock-product]")).toHaveCount(mockCount);
  await expect(main.locator("article[data-mock-product] :is(a,button)")).toHaveCount(0);
  await expect(main.getByRole("status")).toHaveText(
    `${source.productIds.length} รายการ${mockCount ? ` · ${mockCount} รุ่นตัวอย่าง (Mock)` : ""}`,
  );
  await expect(main.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(":is(.site-header,[data-products-header]):visible")).toHaveCount(1);
  await expect(page.locator(".site-footer:visible")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { main, models };
}

for (const width of [390, 1440]) {
  for (const definition of pages) {
    test(`${definition.id} exact entries, pagination, Mock and refresh at ${width}px`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await verifyListing(page, request, definition.id, definition.href);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: test.info().outputPath(`${definition.slug}-${width}.png`) });
      await page.reload();
      await expect(
        page.locator(`[data-scale-subcategory-page="${definition.id}"]:visible h1`),
      ).toHaveText(definition.label);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  }
}

for (const width of [320, 768, 834]) {
  test(`all seven group layouts remain contained at ${width}px`, async ({ page, request }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    for (const definition of pages)
      await verifyListing(page, request, definition.id, definition.href);
  });
}

for (const definition of pages) {
  test(`${definition.id} local controls, comparison and contextual detail return`, async ({
    page,
    request,
    context,
  }) => {
    const { main, models } = await verifyListing(page, request, definition.id, definition.href);
    const search = main.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" });
    await search.fill("not-a-model");
    await expect(main.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
    await main.getByRole("button", { name: "ล้างตัวกรองทั้งหมด", exact: true }).click();
    await expect(main.locator("#mock-product-results article h3")).toHaveText(models.slice(0, 24));
    await expect(main.getByRole("button", { name: "สินค้าแนะนำ", exact: true })).toHaveCount(0);
    await expect(main.getByRole("group", { name: "รูปแบบรายการสินค้า" })).toHaveCount(0);
    await expect(main.getByRole("button", { name: /แสดงแบบรายการ|แสดงแบบตาราง/ })).toHaveCount(0);
    const detail = main.locator("article[data-model-only] a").first();
    const href = (await detail.getAttribute("href"))!;
    expect(href).toContain(`?from=${definition.returnContext}`);
    await detail.click();
    await page.getByRole("link", { name: `กลับรายการ${definition.label}`, exact: true }).click();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
    const tab = await context.newPage();
    await tab.goto(href);
    await expect(tab.locator(".back-link")).toHaveAttribute("href", definition.href);
    await tab.goto(href.split("?")[0]);
    await expect(tab.locator(".back-link")).toHaveAttribute("href", "/products");
    await tab.close();
    await main.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    const controls = main.locator("article[data-model-only] button");
    await controls.nth(0).click();
    await controls.nth(1).click();
    await page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
    await expect(
      page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true }),
    ).toBeVisible();
  });
}

test("all legacy scale queries and recognized thematic URLs reach their own listings", async ({
  page,
}) => {
  test.slow();
  for (const definition of pages) {
    for (const href of [
      `/products?category=scales&subcategory=${definition.id}`,
      `/products/category/scales?subcategory=${definition.id}`,
    ]) {
      await page.goto(href);
      await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  }
  for (const [old, slug] of [
    ["/product/commercial", "price"],
    ["/product/laboratory", "analytical"],
    ["/collections/coffee-scales", "kitchen"],
  ]) {
    await page.goto(old);
    await expect(page).toHaveURL(new RegExp(`/products/category/scales/${slug}$`));
  }
});

test("Navbar entries, cached Back and per-group search remain separate", async ({ page }) => {
  test.slow();
  await page.goto("/products");
  for (const definition of pages) {
    const trigger = page
      .locator("[data-products-nav]")
      .getByRole("link", { name: "เครื่องชั่ง", exact: true });
    await trigger.focus();
    await trigger.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
    await page
      .locator("#products-navigation-panel")
      .getByRole("link", { name: definition.label.replace(/^เครื่องชั่ง/, ""), exact: true })
      .click();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
    await page.goBack();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto(pages[0].href);
  await page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("not-a-model");
  await page.goto(pages[1].href);
  await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toHaveValue("");
  await expect(page.locator("#mock-product-results article")).toHaveCount(9);
});

test("every new heading retains latest motion and reduced-motion fallback", async ({ page }) => {
  await recordStaggerMotion(page);
  for (const definition of pages) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(definition.href);
    await expectStaggerMotion(page.locator("h1"));
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("h1")).toHaveCSS("animation-name", "none");
    expect(
      await page
        .locator("h1")
        .evaluate(
          (el) => el.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length,
        ),
    ).toBe(0);
    await expect(page.locator("h1")).toHaveCSS("translate", "none");
  }
});

test("native Home mobile submenu reaches every new group and returns from detail", async ({
  browser,
  baseURL,
}) => {
  test.slow();
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  for (const definition of pages) {
    await page.goto("/");
    await page
      .locator(".site-header:visible")
      .getByRole("button", { name: "เปิดเมนู", exact: true })
      .tap();
    const group = page.locator("#mobile-navigation .mobile-nav-category").first();
    await group.locator("summary").tap();
    await group
      .getByRole("link", { name: definition.label.replace(/^เครื่องชั่ง/, ""), exact: true })
      .tap();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.locator("#mock-product-results article[data-model-only] a").first().tap();
    await page.getByRole("link", { name: `กลับรายการ${definition.label}`, exact: true }).tap();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
  }
  await context.close();
});
