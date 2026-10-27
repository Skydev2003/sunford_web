import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import sourcePages from "../../src/features/content/data/pages.json";

const sections = [
  { path: "/product/โครงสร้างแท่นชั่ง", title: "โครงสร้างแท่นชั่ง", count: 23 },
  { path: "/Product/แท่นชั่งตั้งโต๊ะ", title: "แท่นชั่งตั้งโต๊ะ", count: 2 },
  { path: "/Product/แท่นชั่งตั้งพืั้น", title: "แท่นชั่งตั้งพื้น", count: 14 },
  { path: "/Product/POS", title: "ระบบ POS ชั่งน้ำหนักเพื่อการขาย", count: 3 },
  { path: "/Product/POS/Android", title: "POS ระบบ Android", count: 2 },
  { path: "/Product/POS/Windows", title: "POS ระบบ Windows", count: 1 },
];

test("platform and POS menus show every source product in the correct section", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const section of sections) {
    await page.goto(section.path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(section.title);
    await expect(page.locator(".product-card")).toHaveCount(section.count);
    await expect(page.locator(".source-empty, .source-image-slot .media-placeholder")).toHaveCount(
      0,
    );
    await expect(page.locator('.source-section-links [aria-current="page"]')).toHaveCount(1);
    if (section.path.endsWith("/Windows")) {
      await expect(page.locator(".product-card")).toContainText("P1W");
      await expect(page.locator('.product-card a[href="/products/10802"]')).toHaveCount(0);
      await expect(page.locator(".product-category")).toHaveText("POS ระบบ Windows");
    }
    if (section.path.endsWith("/Android")) {
      await expect(page.locator(".product-grid")).toContainText("P1");
      await expect(page.locator(".product-grid")).toContainText("P4");
      await expect(page.locator(".product-grid")).not.toContainText("P1W");
    }
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
  const collectionPaths = [
    "/collections/โครงสร้างแท่นชั่ง",
    "/collections/POS เชื่อมต่อเครื่องชั่ง",
  ];
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
