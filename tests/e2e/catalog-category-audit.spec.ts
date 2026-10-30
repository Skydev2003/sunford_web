import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import sourcePages from "../../src/features/content/data/pages.json";
import type { Product } from "../../src/features/catalog/types";
import { publicPath } from "../../src/features/content/data/public-paths.mjs";

// Dedicated source collections correct several misconfigured landing-page grids.
const collectionSources: Record<string, string[]> = {
  "/product/digital-weighing": ["เครื่องชั่ง"],
  "/product/laboratory": ["ห้องปฏิบัติการ"],
  "/product/industrial": ["อุตสาหกรรม"],
  "/product/commercial": ["พาณิชยกรรมและบริการ"],
  "/product/lifestyle-scales": ["ไลฟ์สไตล์"],
  "/product/lifestyle": ["ไลฟ์สไตล์"],
  "/indicator": [
    "อินดิเคเตอร์ห้องปฏิบัติการ",
    "อินดิเคเตอร์อุตสาหกรรม",
    "อินดิเคเตอร์พาณิชยกรรมและบริการ",
  ],
  "/indicator/industrial": ["อินดิเคเตอร์อุตสาหกรรม"],
  "/product/scale-platforms": ["โครงสร้างแท่นชั่ง"],
  "/product/scale-peripherals": ["อุปกรณ์ต่อพ่วง"],
  "/product/scale-parts": ["ชิ้นส่วน"],
  "/product/parts": ["ชิ้นส่วน"],
  "/product/consumables": ["วัสดุสิ้นเปลือง"],
  "/product/pos/windows": ["POS ระบบ Windows"],
};

test("every source category renders its published products without cross-category substitutes", async ({
  request,
}) => {
  test.setTimeout(180000);
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  const categories = sourcePages.filter(
    (page) => page.kind === "collection" || /^\/(product|indicator)(\/|$)/i.test(page.path),
  );
  for (let start = 0; start < categories.length; start += 4) {
    await Promise.all(
      categories.slice(start, start + 4).map(async (source) => {
        const sourceCollections = collectionSources[source.path.toLowerCase()];
        const handles = new Set(
          sourceCollections
            ? sourceCollections.flatMap(
                (name) =>
                  sourcePages.find((page) => page.path === publicPath(`/collections/${name}`))!
                    .productHandles,
              )
            : source.productHandles,
        );
        const published = products.filter((product) => handles.has(product.sourceId ?? ""));
        const page = await request.get(source.path);
        expect(page.status(), source.path).toBe(200);
        const $ = load(await page.text());
        expect($(".product-card").length, source.path).toBe(Math.min(24, published.length));
        if (published.length) {
          expect($(".catalog-result-count").text(), source.path).toContain(
            `${published.length} ผลิตภัณฑ์`,
          );
          $(".product-card-image").each((_, link) => {
            const slug = decodeURIComponent($(link).attr("href")!.split("/").at(-1)!);
            expect(handles.has(bySlug.get(slug)?.sourceId ?? ""), `${source.path}: ${slug}`).toBe(
              true,
            );
          });
        } else {
          expect($(".source-empty").text(), source.path).toContain("ยังไม่มีสินค้าในหมวดหมู่นี้");
          expect($(".source-empty .media-placeholder").length, source.path).toBe(0);
        }
      }),
    );
  }
});

test("category search stays local and the complete scale catalogue can be expanded", async ({
  page,
}) => {
  await page.goto("/product/industrial");
  await expect(page.locator(".product-card")).toHaveCount(20);
  await page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("no-matching-model");
  await expect(page.locator(".product-card")).toHaveCount(0);
  await page.goto("/Indicator");
  await expect(page.locator(".product-card")).toHaveCount(7);
  await expect(page.locator(".product-category").first()).toHaveText("อินดิเคเตอร์แท่นชั่ง");
  await page.goto("/Product/Digital-weighing");
  await expect(page.locator(".catalog-result-count")).toContainText("71 ผลิตภัณฑ์");
  while (await page.locator(".catalog-load-more button").count())
    await page.locator(".catalog-load-more button").click();
  await expect(page.locator(".product-card")).toHaveCount(71);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ["/Indicator", "/product/scale-accessories", "/product/Consumables"]) {
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      path,
    ).toBe(true);
  }
});
