import { catalogPageTitle } from "../../src/features/site/data/site-menu-labels";
import { expect, test } from "@playwright/test";
import { getProductSubcategoryPage } from "../../src/features/catalog/data/product-subcategory-pages";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";

const children = defaultNavigation[0].groups!.flatMap((group) => group.links);
const catalogName = "แคตตาล็อกสินค้า Sunford";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`five category pages show their own products and retain all-products access at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const { id, label } of productCategoryDefinitions) {
      const path = `/${id}`;
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        catalogPageTitle(new URL(page.url()).pathname, label),
      );
      await expect(page.locator("#products-lineup > li > a").first()).toBeVisible();
      await expect(page.locator('[data-return-scope="catalog-finder"]')).toHaveCount(0);
      await expect(
        page
          .locator('[data-overview-section="chapters"]')
          .getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
      ).toHaveCount(0);
      await expect(
        page.locator('[data-overview-section="lineup"] a[href$="/applications"]'),
      ).toHaveCount(0);
    }
    expect(errors).toEqual([]);
  });
}

test("legacy child URLs reach their canonical category listings", async ({ page }) => {
  test.setTimeout(180000);
  for (const child of children) {
    const params = new URL(child.href, "http://localhost").searchParams;
    const id = params.get("category")!;
    const childId = params.get("subcategory")!;
    const destination = getProductSubcategoryPage(childId, id)!;
    await page.goto(`/products/category/${id}?subcategory=${childId}`);
    await expect(page).toHaveURL(new URL(destination.href, page.url()).href);
    await expect(page.locator(`[data-product-subcategory-page="${childId}"]`)).toBeVisible();
    await expect(page.locator('dialog[open][data-return-scope="catalog-finder"]')).toHaveCount(0);
  }
});

for (const width of [390, 834, 1440]) {
  test.describe(`subcategory listing at ${width}px`, () => {
    test.use({
      viewport: { width, height: 900 },
      hasTouch: width === 390,
      isMobile: width === 390,
    });

    test("subcategory search and picture navigation work", async ({ page }) => {
      test.slow();
      await page.goto("/platforms/floor");

      const heading = page.getByRole("heading", { level: 1 });
      const search = page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" });
      const menu = page.getByRole("navigation", { name: "หมวดย่อยสินค้า" });
      await expect(menu.getByRole("link")).toHaveCount(2);
      await expect(menu.getByRole("link", { name: "แท่นชั่งตั้งพื้น" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect(search).toBeVisible();
      const headingBox = (await heading.boundingBox())!;
      const searchBox = (await search.boundingBox())!;
      const menuBox = (await menu.boundingBox())!;
      const headingToSearch = searchBox.y - (headingBox.y + headingBox.height);
      expect(headingToSearch).toBeGreaterThanOrEqual(0);
      expect(headingToSearch).toBeLessThan(80);
      expect(menuBox.y).toBeGreaterThan(searchBox.y + searchBox.height);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );

      await search.fill("unknown-model-for-listing-test");
      await expect(page.getByRole("heading", { name: "ยังไม่พบสินค้าที่คุณค้นหา" })).toBeVisible();
      await menu.getByRole("link", { name: "แท่นชั่งตั้งโต๊ะ" }).click();
      await expect(page).toHaveURL(/\/platforms\/benchtop$/);
      await expect(menu.getByRole("link", { name: "แท่นชั่งตั้งโต๊ะ" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect(search).toHaveValue("");

      const filters = page.getByRole("group", { name: "กรองตามคุณสมบัติ" });
      const material = filters.getByRole("button", { name: "สแตนเลส SUS304", exact: true });
      await material.click();
      const series = filters.getByRole("button", { name: "ซีรีส์ TMS", exact: true });
      await series.click();
      await expect(material).toHaveAttribute("aria-pressed", "true");
      await expect(series).toHaveAttribute("aria-pressed", "true");
      const benchtop = page.locator('[data-product-subcategory-page="platform-benchtop"]:visible');
      await expect(benchtop.locator("#mock-product-results article h3:visible")).toHaveText([
        "TMS 3040",
      ]);

      const floor = menu.getByRole("link", { name: "แท่นชั่งตั้งพื้น" });
      await floor.scrollIntoViewIfNeeded();
      await expect(floor).toBeInViewport({ ratio: 0.95 });
      if (width === 390) {
        await floor.tap();
      } else {
        await floor.click();
      }
      await expect(page).toHaveURL(/\/platforms\/floor$/);
      await expect(floor).toBeInViewport({ ratio: 0.95 });
      await expect(floor).toHaveAttribute("aria-current", "page");
    });
  });
}

test("picture navigation keeps the product groups on feature and sibling listings", async ({
  page,
}) => {
  test.slow();
  const menu = page.getByRole("navigation", { name: "หมวดย่อยสินค้า" });
  const productMenus = getPrimaryNavigationItems(defaultNavigation, undefined, "category-chapters");
  for (const [family, first, next] of [
    ["scales", "kitchen", "price"],
    ["scales", "counting", "industrial"],
    ["indicators", "lcd", "led"],
    ["indicators", "rs232", "led"],
    ["indicators", "waterproof", "lcd"],
    ["platforms", "sus304", "benchtop"],
    ["pos", "android", "windows"],
    ["accessories", "displays", "cables"],
    ["accessories", "thermal-paper", "printers"],
  ]) {
    const prefix = `/products/${family}`;
    const source = `${prefix}/${first}`;
    const destination = `${prefix}/${next}`;
    const productLinks = productMenus.find(({ href }) => href === prefix)!.links;
    const active = menu.locator('a[aria-current="page"]');
    await page.goto(source);
    await expect(menu.getByRole("link")).toHaveText(productLinks.map(({ label }) => label));
    expect(
      await menu
        .getByRole("link")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    ).toEqual(productLinks.map(({ href }) => href));
    if (productLinks.some(({ href }) => href === source)) {
      await expect(active).toHaveAttribute("href", source);
    } else {
      await expect(active).toHaveCount(0);
      await expect(
        page.getByRole("navigation", { name: "เส้นทางนำทาง" }).locator('[aria-current="page"]'),
      ).toBeVisible();
    }
    await menu.locator(`a[href="${destination}"]`).click();
    await expect(page).toHaveURL((url) => url.pathname === destination);
    await expect(active).toHaveAttribute("href", destination);
    await expect(menu.getByRole("link")).toHaveText(productLinks.map(({ label }) => label));
  }
});

test("switching picture filters keeps the listing controls and skips the opening animation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await recordStaggerMotion(page);
  const documents: string[] = [];
  page.on("request", (request) => {
    if (request.isNavigationRequest() && request.frame() === page.mainFrame()) {
      documents.push(new URL(request.url()).pathname);
    }
  });

  const source = "/platforms/floor";
  const destination = "/platforms/benchtop";
  await page.goto(source);
  await expectStaggerMotion(page.getByRole("heading", { level: 1 }));
  await expect
    .poll(() =>
      page.evaluate(() =>
        document.getAnimations().some(({ id }) => id === "sunford-stagger-bounce"),
      ),
    )
    .toBe(false);
  const menu = page.getByRole("navigation", { name: "หมวดย่อยสินค้า" });
  const search = page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" });
  const footer = page.getByRole("contentinfo");
  const heading = page.getByRole("heading", { level: 1 });
  const originalMenu = await menu.elementHandle();
  const originalSearch = await search.elementHandle();
  const originalFooter = await footer.elementHandle();
  const originalHeading = await heading.elementHandle();
  await page.evaluate(() => window.scrollTo({ top: 120, behavior: "instant" }));
  const benchtop = menu.getByRole("link", { name: "แท่นชั่งตั้งโต๊ะ" });
  await expect(benchtop).toBeInViewport({ ratio: 1 });
  const linkBox = (await benchtop.boundingBox())!;
  // Click the visible link without letting Playwright recenter it in the viewport.
  await page.mouse.click(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
  await expect(page).toHaveURL(new RegExp(`${destination}$`));

  const listing = page.locator('[data-product-subcategory-page="platform-benchtop"]');
  await expect(listing).toBeVisible();
  await expect(benchtop).toHaveAttribute("aria-current", "page");
  await expect(listing.locator("#mock-product-results:visible")).toBeVisible();
  expect(await menu.evaluate((element, original) => element === original, originalMenu)).toBe(true);
  expect(await search.evaluate((element, original) => element === original, originalSearch)).toBe(
    true,
  );
  expect(await footer.evaluate((element, original) => element === original, originalFooter)).toBe(
    true,
  );
  const scrollY = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY))),
        );
      }),
  );
  expect(scrollY).toBe(120);
  expect(await heading.evaluate((element, original) => element === original, originalHeading)).toBe(
    true,
  );
  await expectStaggerMotion(heading);

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${source}$`));
  await expect(menu.getByRole("link", { name: "แท่นชั่งตั้งพื้น" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(documents).toEqual([source]);
});

for (const width of [320, 768, 834, 1920]) {
  test(`category pages keep products reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto(`/${id}`);
      if (["scales", "indicators", "platforms", "pos", "accessories"].includes(id)) {
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
          catalogPageTitle(new URL(page.url()).pathname, label),
        );
        await expect(
          page
            .locator('[data-overview-section="chapters"]')
            .getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
        ).toHaveCount(0);
        await expect(page.locator('[data-overview-section="lineup"]')).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        continue;
      }
      const catalog = page.getByRole("region", { name: catalogName });
      await expect(catalog.getByRole("heading", { level: 1 })).toHaveText(
        catalogPageTitle(new URL(page.url()).pathname, label),
      );
      await expect(
        catalog.getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
      ).toBeInViewport();
      await expect(catalog.locator("#mock-product-results > article").first()).toBeInViewport();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (id === "indicators")
        await page.screenshot({ path: test.info().outputPath(`category-responsive-${width}.png`) });
    }
  });
}

test("unknown category returns 404", async ({ request }) => {
  const response = await request.get("/products/category/unknown-first-step");
  expect(response.status()).toBe(404);
});

test("unknown or foreign child cannot escape the scale overview or open a finder", async ({
  page,
}) => {
  for (const child of ["unknown-child", "pos-ios"]) {
    await page.goto(`/scales?category=pos&subcategory=${child}`);
    await expect(page.getByRole("heading", { level: 1, name: "เครื่องชั่ง" })).toBeVisible();
    await expect(page.locator('[data-return-scope="catalog-finder"]')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe("/scales");
  }
});
