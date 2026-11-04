import { expect, test } from "@playwright/test";
import sourcePages from "../../src/features/content/data/pages.json";

const legacyCategories = sourcePages.filter(
  (page) =>
    page.kind !== "product" &&
    (page.kind === "collection" || /^\/(product|indicator)(\/|$)/i.test(page.path)),
);

test("every imported category and collection redirects to the replacement catalog", async ({
  request,
}) => {
  test.setTimeout(180000);
  expect(legacyCategories.length).toBeGreaterThan(50);
  for (const category of legacyCategories) {
    const response = await request.get(category.path, { maxRedirects: 0 });
    expect(response.status(), category.path).toBe(307);
    expect(response.headers().location, category.path).toBe("/products");
  }
});

for (const width of [390, 768, 1440]) {
  test(`legacy links open the responsive replacement catalog at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of [
      "/Product/Digital-weighing",
      "/product/digital-weighing",
      "/Indicator",
      "/product/scale-platforms",
      "/Product/POS",
      "/product/scale-accessories",
      "/collections/scales",
    ]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/products$/);
      const region = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
      await expect(region.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
      await expect(
        region.getByRole("navigation", { name: "หมวดหมู่สินค้า", exact: true }).getByRole("button"),
      ).toHaveCount(5);
      await expect(region.locator("article")).toHaveCount(24);
      await expect(page.locator("[data-category-banner]")).toHaveCount(0);
      await expect(region.getByRole("navigation", { name: "กรองหมวดหมู่สินค้า" })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.screenshot({ path: test.info().outputPath(`replacement-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

test("legacy categories also redirect without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/Product/Digital-weighing");
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
    await expect(page.locator("article")).toHaveCount(24);
  } finally {
    await context.close();
  }
});

test("noncatalog pages and unknown routes keep their own behavior", async ({ page }) => {
  for (const path of ["/about-us", "/contact-us", "/service", "/software/download", "/solutions"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page).toHaveURL(new URL(path, page.url()).href);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  const missing = await page.goto("/product/unknown-retired-category");
  expect(missing?.status()).toBe(404);
});
