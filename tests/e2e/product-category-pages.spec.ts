import { expect, test } from "@playwright/test";
import { getProductSubcategoryPage } from "../../src/features/catalog/data/product-subcategory-pages";
import { defaultNavigation } from "../../src/features/site/data/navigation";
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
      const path = `/products/category/${id}`;
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
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
      await page.goto("/products/category/platforms/sus304");

      const heading = page.getByRole("heading", { level: 1 });
      const search = page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" });
      const menu = page.getByRole("navigation", { name: "หมวดย่อยสินค้า" });
      await expect(menu.getByRole("link")).toHaveCount(4);
      await expect(menu.getByRole("link", { name: "สแตนเลส SUS304" })).toHaveAttribute(
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
      await menu.getByRole("link", { name: "สแตนเลส SUS201" }).click();
      await expect(page).toHaveURL(/\/products\/category\/platforms\/sus201$/);
      await expect(menu.getByRole("link", { name: "สแตนเลส SUS201" })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect(search).toHaveValue("");

      const abs = menu.getByRole("link", { name: "พลาสติก ABS" });
      await abs.scrollIntoViewIfNeeded();
      await expect(abs).toBeInViewport({ ratio: 0.95 });
      if (width === 390) {
        await abs.tap();
      } else {
        await abs.click();
      }
      await expect(page).toHaveURL(/\/products\/category\/platforms\/abs$/);
      await expect(abs).toBeInViewport({ ratio: 0.95 });
      await expect(abs).toHaveAttribute("aria-current", "page");
    });
  });
}

test("picture navigation reaches sibling listings in each remaining product family", async ({
  page,
}) => {
  test.slow();
  const menu = page.getByRole("navigation", { name: "หมวดย่อยสินค้า" });
  for (const [family, first, next] of [
    ["scales", "kitchen", "price"],
    ["indicators", "lcd", "led"],
    ["pos", "android", "windows"],
    ["accessories", "displays", "cables"],
    ["accessories", "thermal-paper", "printers"],
  ]) {
    const prefix = `/products/category/${family}`;
    await page.goto(`${prefix}/${first}`);
    await expect(menu.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      `${prefix}/${first}`,
    );
    await menu.locator(`a[href="${prefix}/${next}"]`).click();
    await expect(menu.locator('a[aria-current="page"]')).toHaveAttribute(
      "href",
      `${prefix}/${next}`,
    );
  }
});

test("switching picture filters keeps the document and skips the opening animation", async ({
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

  const source = "/products/category/platforms/sus304";
  const destination = "/products/category/platforms/sus201";
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
  await page.evaluate(() => window.scrollTo({ top: 120, behavior: "instant" }));
  const sus201 = menu.getByRole("link", { name: "สแตนเลส SUS201" });
  await expect(sus201).toBeInViewport({ ratio: 1 });
  const linkBox = (await sus201.boundingBox())!;
  // Click the visible link without letting Playwright recenter it in the viewport.
  await page.mouse.click(linkBox.x + linkBox.width / 2, linkBox.y + linkBox.height / 2);
  await expect(page).toHaveURL(new RegExp(`${destination}$`));

  const listing = page.locator('[data-product-subcategory-page="platform-sus201"]');
  await expect(listing).toBeVisible();
  await expect(sus201).toHaveAttribute("aria-current", "page");
  const scrollY = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve(window.scrollY))),
        );
      }),
  );
  expect(scrollY).toBe(120);
  await expectStaggerMotion(listing.getByRole("heading", { level: 1 }), 0);

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`${source}$`));
  await expect(menu.getByRole("link", { name: "สแตนเลส SUS304" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(documents).toEqual([source]);
});

for (const width of [320, 768, 834, 1920]) {
  test(`category pages keep products reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto(`/products/category/${id}`);
      if (["scales", "indicators", "platforms", "pos", "accessories"].includes(id)) {
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
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
      await expect(catalog.getByRole("heading", { level: 1 })).toHaveText(label);
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
    await page.goto(`/products/category/scales?category=pos&subcategory=${child}`);
    await expect(page.getByRole("heading", { level: 1, name: "เครื่องชั่ง" })).toBeVisible();
    await expect(page.locator('[data-return-scope="catalog-finder"]')).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe("/products/category/scales");
  }
});
