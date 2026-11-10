import { expect, test, type Page, type APIRequestContext } from "@playwright/test";
import { getPosSubcategories } from "../../src/features/catalog/data/pos-subcategories";
import { posSubcategoryPages } from "../../src/features/catalog/data/product-subcategory-pages";
import { catalogCardName } from "../../src/features/catalog/data/catalog-card-names";
import type { Product } from "../../src/features/catalog/types";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

async function sourceProducts(request: APIRequestContext, id: string) {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  const source = getPosSubcategories(products).find((group) => group.id === id)!;
  return products
    .filter((product) => source.productIds.includes(product.id))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));
}

async function verifyListing(
  page: Page,
  request: APIRequestContext,
  definition: (typeof posSubcategoryPages)[number],
) {
  const products = await sourceProducts(request, definition.id);
  const models = products.map(catalogCardName);
  await page.goto(definition.href);
  const main = page.locator(`[data-product-subcategory-page="${definition.id}"]:visible`);
  await expect(main.locator("h1")).toHaveText(definition.title);
  await expect(main.locator("#mock-product-results article h3")).toHaveText(models);
  await expect(main.getByRole("status")).toHaveText(`${products.length} รายการ`);
  await expect(main.locator("article[data-mock-product]")).toHaveCount(0);
  await expect(main.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })).toHaveCount(0);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(":is(.site-header,[data-products-header]):visible")).toHaveCount(1);
  await expect(page.locator(".site-footer:visible")).toHaveCount(1);
  if (!products.length) {
    await expect(main.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
    await expect(main.locator("#mock-product-results :is(a,button)")).toHaveCount(0);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { main, products, models };
}

for (const width of [390, 1440])
  for (const definition of posSubcategoryPages) {
    test(`${definition.id} exact original models and reload at ${width}px`, async ({
      page,
      request,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await verifyListing(page, request, definition);
      await page.screenshot({ path: test.info().outputPath(`${definition.slug}-${width}.png`) });
      await page.reload();
      await expect(
        page.locator(`[data-product-subcategory-page="${definition.id}"]:visible h1`),
      ).toHaveText(definition.title);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    });
  }

for (const width of [320, 768, 834])
  test(`all POS platforms remain contained at ${width}px`, async ({ page, request }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    for (const definition of posSubcategoryPages) await verifyListing(page, request, definition);
  });

for (const definition of posSubcategoryPages)
  test(`${definition.id} local controls and available product actions`, async ({
    page,
    request,
    context,
  }) => {
    const { main, products, models } = await verifyListing(page, request, definition);
    await main.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-pos-model");
    await expect(main.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
    await main.getByRole("button", { name: "ล้างตัวกรองทั้งหมด", exact: true }).click();
    await expect(main.locator("#mock-product-results article h3")).toHaveText(models);
    await main.getByRole("button", { name: "แสดงแบบรายการ", exact: true }).click();
    await expect(main.getByRole("button", { name: "แสดงแบบรายการ", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await main.getByRole("button", { name: "แสดงแบบตาราง", exact: true }).click();
    await main.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
    await expect(main.locator("#mock-product-results article h3")).toHaveText(
      products.filter((product) => product.featured).map(catalogCardName),
    );
    await main.getByRole("button", { name: "สินค้าแนะนำ", exact: true }).click();
    if (products.length) {
      const detail = main.locator("article[data-model-only] a").first(),
        href = (await detail.getAttribute("href"))!;
      expect(href).toContain(`?from=${definition.id}`);
      await detail.click();
      await page.getByRole("link", { name: `กลับรายการ${definition.title}`, exact: true }).click();
      await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
      const tab = await context.newPage();
      await tab.goto(href);
      await expect(tab.locator(".back-link")).toHaveAttribute("href", definition.href);
      await tab.goto(href.split("?")[0]);
      await expect(tab.locator(".back-link")).toHaveAttribute("href", "/products");
      await tab.close();
    }
    await main.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
    const controls = main.locator("article[data-model-only] button");
    await expect(controls).toHaveCount(products.length);
    const compare = page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true });
    if (!products.length) {
      await expect(compare).toBeDisabled();
      return;
    }
    for (const button of await controls.all()) await button.click();
    await compare.click();
    const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("table thead th")).toHaveCount(products.length + 1);
  });

test("old POS queries, exact legacy aliases and guide links reach own pages", async ({ page }) => {
  test.slow();
  for (const definition of posSubcategoryPages)
    for (const href of [
      `/products?category=pos&subcategory=${definition.id}`,
      `/products/category/pos?subcategory=${definition.id}`,
    ]) {
      await page.goto(href);
      await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  for (const slug of ["android", "windows"]) {
    await page.goto(`/Product/POS/${slug}`);
    await expect(page).toHaveURL(new RegExp(`/products/category/pos/${slug}$`));
    await page.goto("/guides/pos");
    await page
      .getByRole("link", {
        name: `POS ระบบ ${slug === "android" ? "Android" : "Windows"}`,
        exact: true,
      })
      .click();
    await expect(page).toHaveURL(new RegExp(`/products/category/pos/${slug}$`));
  }
});

test("POS overview story opens Android directly", async ({ page }) => {
  await page.goto("/products/category/pos");
  await page.locator("#products-features > li").first().getByRole("button").click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "POS ระบบ Android ›", exact: true })
    .click();
  await expect(page).toHaveURL(/\/products\/category\/pos\/android$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Navbar includes real empty iOS destination and cached history stays separate", async ({
  page,
}) => {
  await page.goto("/products");
  for (const definition of posSubcategoryPages) {
    const trigger = page
      .locator("[data-products-nav]")
      .getByRole("link", { name: "ระบบ POS", exact: true });
    await trigger.focus();
    await trigger.press("ArrowDown");
    await expect(trigger).toHaveAttribute("aria-expanded", "true", { timeout: 1_000 });
    await page
      .locator("#products-navigation-panel")
      .getByRole("link", { name: definition.label, exact: true })
      .click();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
    await page.goBack();
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  await page.goto("/products/category/pos/android");
  await page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-pos-model");
  await page.goto("/products/category/pos/windows");
  await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toHaveValue("");
  await expect(page.locator("#mock-product-results article")).toHaveCount(1);
});

test("POS titles use the existing subgroup motion profile and reduced fallback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products/category/platforms/sus201");
  const reference = await page.locator("h1").evaluate((el) => ({
    name: getComputedStyle(el).animationName,
    duration: getComputedStyle(el).animationDuration,
  }));
  for (const definition of posSubcategoryPages) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(definition.href);
    await expect(page.locator("h1")).toHaveCSS("animation-name", reference.name);
    await expect(page.locator("h1")).toHaveCSS("animation-duration", reference.duration);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(page.locator("h1")).toHaveCSS("animation-name", "none");
  }
});

test("native Home POS menu reaches all platforms and valid detail or parent returns", async ({
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
    }),
    page = await context.newPage();
  for (const definition of posSubcategoryPages) {
    await page.goto("/");
    await page
      .locator(".site-header:visible")
      .getByRole("button", { name: "เปิดเมนู", exact: true })
      .tap();
    const group = page.locator("#mobile-navigation .mobile-nav-category").nth(3);
    await group.locator("summary").tap();
    await group.getByRole("link", { name: definition.label, exact: true }).tap();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    if (definition.id === "pos-ios") {
      await expect(page.locator("#mock-product-results article")).toHaveCount(0);
      await page
        .getByRole("navigation", { name: "เส้นทางนำทาง", exact: true })
        .getByRole("link", { name: "ระบบ POS", exact: true })
        .tap();
      await expect(page).toHaveURL(/\/products\/category\/pos$/);
      continue;
    }
    await page.locator("#mock-product-results article[data-model-only] a").first().tap();
    await page.getByRole("link", { name: `กลับรายการ${definition.title}`, exact: true }).tap();
    await expect(page).toHaveURL(new URL(definition.href, page.url()).href);
  }
  await context.close();
});
