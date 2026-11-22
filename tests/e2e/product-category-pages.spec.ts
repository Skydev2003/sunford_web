import { expect, test, type Locator, type Page } from "@playwright/test";
import { getProductSubcategoryPage } from "../../src/features/catalog/data/product-subcategory-pages";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

const children = defaultNavigation[0].groups!.flatMap((group) => group.links);
const catalogName = "แคตตาล็อกสินค้า Sunford";

async function categoryCatalog(page: Page, id: string) {
  if (["indicators", "platforms", "pos", "accessories"].includes(id)) {
    const title = `ดู${productCategoryDefinitions.find((category) => category.id === id)!.label}ทั้งหมด`;
    const finder = page.getByRole("dialog", { name: title, exact: true });
    if (!new URL(page.url()).searchParams.has("subcategory") && !(await finder.isVisible()))
      await page
        .locator('[data-overview-section="lineup"]')
        .getByRole("button", { name: title, exact: true })
        .click();
    await expect(finder).toBeVisible();
    return finder.getByRole("region", { name: catalogName });
  }
  return page.getByRole("region", { name: catalogName }).filter({ visible: true });
}

async function catalogState(catalog: Locator) {
  const more = catalog.getByRole("button", { name: /^ดูเพิ่มเติม \(/ });
  while (await more.count()) await more.click();
  return {
    status: await catalog.getByRole("status").innerText(),
    entries: await catalog.locator("#mock-product-results > article").evaluateAll((cards) =>
      cards.map((card) => ({
        model: card.querySelector("h3")?.textContent?.trim(),
        href: card.querySelector("a")?.getAttribute("href") ?? null,
        mock: card.hasAttribute("data-mock-product"),
      })),
    ),
  };
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`five category pages show their own products and retain all-products access at ${width}px`, async ({
    page,
    context,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    const reference = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const { id, label } of productCategoryDefinitions) {
      const path = `/products/category/${id}`;
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
      if (id === "scales") {
        await expect(page.locator("#products-lineup > li > a").first()).toBeVisible();
        await expect(page.locator('[data-return-scope="catalog-finder"]')).toHaveCount(0);
        await expect(
          page
            .locator('[data-overview-section="chapters"]')
            .getByRole("link", { name: "สินค้าทั้งหมด" }),
        ).toHaveAttribute("href", "/products");
        continue;
      }
      const catalog = await categoryCatalog(page, id);
      await expect(
        catalog.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }),
      ).toHaveCount(["indicators", "platforms", "pos", "accessories"].includes(id) ? 1 : 0);
      await expect(catalog.getByRole("group", { name: "สินค้าเด่น", exact: true })).toHaveCount(0);
      await expect(
        page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true }),
      ).not.toBeVisible();
      await expect(catalog.locator("#mock-product-results > article").first()).toBeVisible();
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
      await expect(page.locator(".site-footer:visible,[data-products-footer]:visible")).toHaveCount(
        1,
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.screenshot({ path: test.info().outputPath(`category-${id}-${width}.png`) });
      await reference.goto(`/products?category=${id}`);
      const popup = reference.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
      await expect(popup).toBeVisible();
      const oldCatalog = popup.getByRole("region", { name: catalogName });
      await expect(
        oldCatalog.getByRole("heading", { level: 2, name: label, exact: true }),
      ).toBeVisible();
      expect(await catalogState(catalog)).toEqual(await catalogState(oldCatalog));
      if (["indicators", "platforms", "pos", "accessories"].includes(id))
        await page
          .getByRole("dialog", { name: `ดู${label}ทั้งหมด`, exact: true })
          .getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" })
          .click();
      const allProducts = page
        .locator('[data-overview-section="chapters"]')
        .getByRole("link", { name: "สินค้าทั้งหมด", exact: true });
      await expect(allProducts).toHaveAttribute("href", "/products");
      await allProducts.click();
      await expect(page).toHaveURL(/\/products$/);
      await expect(
        page.locator(
          '[data-products-directory] #products-categories a[href^="/products/category/"]',
        ),
      ).toHaveCount(5);
      await page.goBack();
      await expect(page).toHaveURL(new URL(path, page.url()).href);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    }
    expect(errors).toEqual([]);
    await reference.close();
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
for (const width of [320, 768, 834, 1920]) {
  test(`category pages keep products and all-products button reachable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const { id, label } of productCategoryDefinitions) {
      await page.goto(`/products/category/${id}`);
      if (["scales", "indicators", "platforms", "pos", "accessories"].includes(id)) {
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
        await expect(
          page
            .locator('[data-overview-section="chapters"]')
            .getByRole("link", { name: "สินค้าทั้งหมด", exact: true }),
        ).toBeInViewport();
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
