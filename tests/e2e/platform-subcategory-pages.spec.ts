import { catalogSubmenuDestination } from "../../src/features/catalog/data/catalog-submenu-destinations";
import { siteMenuLabel } from "../../src/features/site/data/site-menu-labels";
import { expect, test, type Page, type APIRequestContext } from "@playwright/test";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";
import { getPlatformSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import {
  platformPlacementPages,
  platformSubcategoryPages,
} from "../../src/features/catalog/data/product-subcategory-pages";
import type { Product } from "../../src/features/catalog/types";

const pages = platformSubcategoryPages;
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function sourceGroup(request: APIRequestContext, id: string) {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  return getPlatformSubcategories(products).find((group) => group.id === id)!;
}

async function verifyListing(
  page: Page,
  request: APIRequestContext,
  { id, href, title }: (typeof pages)[number],
) {
  const source = await sourceGroup(request, id);
  const models = (source.entries ?? [])
    .filter(({ productId }) => productId)
    .map(({ model }) => model);
  await page.goto(href);
  const main = page.locator(`[data-product-subcategory-page="${id}"]:visible`);
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(title);
  const cards = main.locator("#mock-product-results article");
  if (models.length) {
    await expect(cards.locator("h3")).toHaveText(models.slice(0, 24));
    while ((await cards.count()) < models.length)
      await main.getByRole("button", { name: /ดูเพิ่มเติม/ }).click();
    await expect(cards.locator("h3")).toHaveText(models);
    await expect(main.getByRole("status")).toHaveText(`${models.length} รายการ`);
  } else {
    await expect(main.getByText("ยังไม่มีรายการสินค้าที่เผยแพร่ในหมวดนี้")).toBeVisible();
    await expect(cards).toHaveCount(0);
  }
  await expect(main.locator("article[data-mock-product]")).toHaveCount(0);
  await expect(main.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(":is(.site-header,[data-products-header]):visible")).toHaveCount(1);
  await expect(page.locator(".site-footer:visible")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { main, models };
}

for (const width of [390, 1440]) {
  for (const definition of pages) {
    test(`${definition.id} retains its material listing and refresh at ${width}px`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await verifyListing(page, request, definition);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: test.info().outputPath(`${definition.slug}-${width}.png`) });
      await page.reload();
      await expect(
        page.locator(`[data-product-subcategory-page="${definition.id}"]:visible h1`),
      ).toHaveText(definition.title);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  }
}

for (const width of [320, 768, 834]) {
  test(`all four group layouts remain contained at ${width}px`, async ({ page, request }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    for (const definition of pages) await verifyListing(page, request, definition);
  });
}

for (const definition of pages) {
  test(`${definition.id} local controls, comparison and contextual detail return`, async ({
    page,
    request,
    context,
  }) => {
    const { main, models } = await verifyListing(page, request, definition);
    if (!models.length) {
      const alternatives = main.getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" });
      for (const placement of platformPlacementPages)
        await expect(
          alternatives.getByRole("link", { name: new RegExp(placement.label) }),
        ).toHaveAttribute("href", placement.href);
      return;
    }
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
    await page.getByRole("link", { name: "กลับหน้าก่อนหน้า", exact: true }).click();
    await expect(page).toHaveURL((url) => url.pathname === definition.href);
    const tab = await context.newPage();
    await tab.goto(href);
    await expect(tab.locator(".back-link")).toHaveAttribute("href", definition.href);
    await tab.goto(href.split("?")[0]);
    await expect(tab.locator(".back-link")).toHaveAttribute("href", "/products");
    await tab.close();
    if (models.length < 2) return;
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

test("legacy platform query URLs reach their own listings", async ({ page }) => {
  test.slow();
  for (const definition of pages) {
    for (const href of [
      `/products?category=platforms&subcategory=${definition.id}`,
      `/products/category/platforms?subcategory=${definition.id}`,
    ]) {
      await page.goto(href);
      await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  }
});

test("Navbar entries, cached Back and per-group search remain separate", async ({ page }) => {
  test.slow();
  await page.goto("/products");
  for (const definition of platformPlacementPages) {
    const trigger = page
      .locator("[data-products-nav]")
      .getByRole("link", { name: "โครงสร้างแท่นชั่ง", exact: true });
    await trigger.focus();
    await trigger.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
    await page
      .locator("#products-navigation-panel")
      .getByRole("link", { name: definition.label, exact: true })
      .click();
    await expect(page).toHaveURL(
      new URL(catalogSubmenuDestination(definition.href), page.url()).href,
    );
    await page.goBack();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto(platformPlacementPages[0].href);
  await page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("not-a-model");
  await page.goto(platformPlacementPages[1].href);
  await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toHaveValue("");
  await expect(page.locator("#mock-product-results article").first()).toBeVisible();
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

test("native Home mobile submenu reaches both platform placements with valid detail return", async ({
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
  for (const definition of platformPlacementPages) {
    await page.goto("/");
    await page
      .locator(".site-header:visible")
      .getByRole("button", { name: "เปิดเมนู", exact: true })
      .tap();
    const group = page.locator("#products-navigation-panel");
    await group.getByRole("button", { name: "เปิดเมนูย่อยโครงสร้างแท่นชั่ง", exact: true }).tap();
    await group
      .getByRole("link", {
        name: siteMenuLabel(definition.href, definition.label.replace(/^เครื่องชั่ง/, "")),
        exact: true,
      })
      .tap();
    await expect(page).toHaveURL(
      new URL(catalogSubmenuDestination(definition.href), page.url()).href,
    );
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.locator("#mock-product-results article[data-model-only] a").first().tap();
    const returnLink = page.getByRole("link", { name: "กลับหน้าก่อนหน้า", exact: true });
    await expect(returnLink).toHaveAttribute("href", catalogSubmenuDestination(definition.href));
    await returnLink.tap();
    await expect(page).toHaveURL((url) => url.pathname === definition.href);
  }
  await context.close();
});
