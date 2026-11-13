import { expect, test } from "@playwright/test";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";
import { getScaleSubcategories } from "../../src/features/catalog/data/scale-subcategories";
import type { Product } from "../../src/features/catalog/types";

const path = "/products/category/scales/industrial";
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 768, 834, 1440]) {
  test(`industrial listing retains exact membership and contained layout at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const { products } = (await (await request.get("/api/products")).json()) as {
      products: Product[];
    };
    const expected = getScaleSubcategories(products).find(
      (child) => child.id === "scale-industrial",
    )!;
    await page.goto(path);
    const main = page.locator("[data-industrial-scales-page]");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(expected.label);
    const cards = main.locator("#mock-product-results article");
    await expect(cards.locator("h3")).toHaveText(expected.entries!.map((entry) => entry.model));
    await expect(main.locator("article[data-mock-product]")).toHaveCount(
      expected.entries!.filter((entry) => !entry.productId).length,
    );
    await expect(
      main.locator("article[data-mock-product] a, article[data-mock-product] button"),
    ).toHaveCount(0);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(main.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })).toHaveCount(0);
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`industrial-${width}.png`) });
    await page.reload();
    await expect(cards.locator("h3")).toHaveText(expected.entries!.map((entry) => entry.model));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
}

test("industrial search and comparison remain inside the fixed group", async ({ page }) => {
  await page.goto(path);
  const main = page.locator("[data-industrial-scales-page]");
  const search = main.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" });
  await expect(
    main.getByRole("button", { name: /แสดงแบบรายการ|แสดงแบบตาราง|สินค้าแนะนำ/ }),
  ).toHaveCount(0);
  await search.fill("FEH5KS");
  await expect(main.locator("#mock-product-results article h3")).toHaveText(["FEH5KS"]);
  await search.fill("not-a-model");
  await expect(main.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
  await main.getByRole("button", { name: "ล้างตัวกรองทั้งหมด", exact: true }).click();
  await expect(main.locator("#mock-product-results article")).toHaveCount(21);
  await main.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  const controls = main.locator("article[data-model-only] button");
  await controls.nth(0).click();
  await controls.nth(1).click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true })).toBeVisible();
});

test("industrial detail context supports return, fresh tabs and context-free details", async ({
  page,
  context,
}) => {
  await page.goto(path);
  const detail = page.locator("#mock-product-results article[data-model-only] a").first();
  const href = (await detail.getAttribute("href"))!;
  expect(href).toContain("?from=industrial-scales");
  await detail.click();
  await expect(page).toHaveURL(new URL(href, page.url()).href);
  const back = page.getByRole("link", {
    name: "กลับรายการเครื่องชั่งอุตสาหกรรมงานผลิต",
    exact: true,
  });
  await expect(back).toHaveAttribute("href", path);
  await back.click();
  await expect(page).toHaveURL(new RegExp(path + "$"));
  const tab = await context.newPage();
  await tab.goto(href);
  await expect(
    tab.getByRole("link", { name: "กลับรายการเครื่องชั่งอุตสาหกรรมงานผลิต", exact: true }),
  ).toBeVisible();
  await tab.goto(href.split("?")[0]);
  await expect(tab.locator(".back-link")).toHaveText("ผลิตภัณฑ์ทั้งหมด");
  await expect(tab.locator(".back-link")).toHaveAttribute("href", "/products");
  await tab.close();
});

test("old URLs, guide and scales chapter reach industrial without finder", async ({ page }) => {
  for (const url of [
    "/product/industrial",
    "/products?category=scales&subcategory=scale-industrial",
    "/products/category/scales?subcategory=scale-industrial",
  ]) {
    await page.goto(url);
    await expect(page).toHaveURL(new RegExp(path + "$"));
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto("/guides/scales");
  await page.getByRole("link", { name: "อุตสาหกรรมงานผลิต", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(path + "$"));
  await page.goto("/products/category/scales");
  await page
    .locator("#products-chapters")
    .getByRole("button", { name: "เครื่องชั่งอุตสาหกรรมงานผลิต", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(path + "$"));
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("industrial heading retains latest entrance and reduced-motion fallback", async ({ page }) => {
  await recordStaggerMotion(page);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(path);
  await expectStaggerMotion(page.locator("h1"));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("h1")).toHaveCSS("animation-name", "none");
  expect(
    await page
      .locator("h1")
      .evaluate((el) => el.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length),
  ).toBe(0);
  await expect(page.locator("h1")).toHaveCSS("translate", "none");
});

test("industrial chapter clears a closed finder query before returning through history", async ({
  page,
}) => {
  await page.goto("/products/category/scales?catalog=all");
  await expect(
    page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .locator("#products-chapters")
    .getByRole("button", { name: "เครื่องชั่งอุตสาหกรรมงานผลิต", exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(path + "$"));
  await page.goBack();
  await expect(page).toHaveURL(/\/products\/category\/scales$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("native mobile touch opens Home industrial submenu and returns from detail", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto("/");
  const header = page.locator(".site-header:visible");
  await header.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
  const mobile = page.locator("#mobile-navigation");
  await mobile.locator(".mobile-nav-category").first().locator("summary").tap();
  await mobile
    .locator(".mobile-nav-category")
    .first()
    .getByRole("link", { name: "อุตสาหกรรมงานผลิต", exact: true })
    .filter({ visible: true })
    .tap();
  await expect(page).toHaveURL(new RegExp(path + "$"));
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.locator("#mock-product-results article[data-model-only] a").first().tap();
  await page
    .getByRole("link", { name: "กลับรายการเครื่องชั่งอุตสาหกรรมงานผลิต", exact: true })
    .tap();
  await expect(page).toHaveURL(new RegExp(path + "$"));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});
