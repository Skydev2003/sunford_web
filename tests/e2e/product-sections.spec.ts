import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import sourcePages from "../../src/features/content/data/pages.json";

const sections = [
  "/product/scale-platforms",
  "/Product/benchtop-platforms",
  "/Product/floor-platforms",
  "/Product/POS",
  "/Product/POS/Android",
  "/Product/POS/Windows",
];

test("legacy platform and POS menus open the replacement catalog", async ({ page }) => {
  test.setTimeout(120000);
  for (const path of sections) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ทั้งหมด");
    await expect(
      page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" }).locator("article"),
    ).toHaveCount(24);
    await expect(page.locator(".source-empty, .source-image-slot .media-placeholder")).toHaveCount(
      0,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.setViewportSize({ width: 1440, height: 900 });
  }
});

test("all imported platform and POS products have working detail pages and local galleries", async ({
  request,
}) => {
  test.setTimeout(180000);
  const collectionPaths = ["/collections/scale-platforms", "/collections/pos-scale-integration"];
  const handles = new Set(
    sourcePages.filter((p) => collectionPaths.includes(p.path)).flatMap((p) => p.productHandles),
  );
  expect(handles.size).toBe(26);
  for (const handle of handles) {
    const response = await request.get(`/products/${handle}`);
    expect(response.status(), handle).toBe(200);
    const $ = load(await response.text());
    expect($(".product-information").text().trim().length, handle).toBeGreaterThan(60);
    expect($(".product-attributes tbody tr").length, handle).toBeGreaterThan(0);
    expect(
      $('.product-gallery img[src*="%2Fimages%2F"], .product-gallery img[src^="/images/"]').length,
      handle,
    ).toBeGreaterThan(0);
  }
});
