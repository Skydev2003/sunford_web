import { expect, test } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import selection from "../../src/features/catalog/data/warehouse-storefront-selection.json";
import type { Product } from "../../src/features/catalog/types";
import { isPublicWarehouseSku } from "../../src/features/catalog/data/warehouse-products";
import { warehouseDisplayName } from "../../src/features/catalog/data/catalog-card-names";
import {
  readWarehouseProducts,
  closeWarehousePool,
  getWarehousePool,
} from "../../src/features/services/warehouse-postgres";

loadEnvConfig(process.cwd(), true);
let source: Awaited<ReturnType<typeof readWarehouseProducts>>;
const selected = new Map(selection.items.map((item) => [item.sku, item]));
const samples = ["G-MK013", "G107770", "G107527", "G108012", "G108395"];

test.beforeAll(async () => {
  source = await readWarehouseProducts();
});
test.afterAll(() => closeWarehousePool());
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("public product API covers the full active/saleable RPC with unchanged facts and Warehouse names", async ({
  request,
}) => {
  const eligible = await getWarehousePool().query<{ sku: string; standard_sale_price: string }>(
    `SELECT item.item_code::text AS sku, item.standard_sale_price::text AS standard_sale_price
     FROM master_data.master_item AS item
     JOIN master_data.master_unit AS unit
       ON unit.master_unit_id = item.base_master_unit_id
      AND unit.master_company_id = item.master_company_id
      AND NOT unit.is_deleted
     WHERE item.master_company_id = $1::bigint
       AND item.is_active AND item.is_saleable
       AND NOT item.is_deleted AND item.standard_sale_price >= 0`,
    [Number(process.env.WAREHOUSE_COMPANY_ID)],
  );
  expect(source.items.map((item) => item.sku).sort()).toEqual(
    eligible.rows
      .map((item) => item.sku)
      .filter((sku) => !/^x/i.test(sku))
      .sort(),
  );
  const response = await request.get("/api/products");
  expect(response.status()).toBe(200);
  const { products }: { products: Product[] } = await response.json();
  const expected = source.items.filter((item) => isPublicWarehouseSku(item.sku));
  expect(products.map((item) => item.warehouseSku).sort()).toEqual(
    expected.map((item) => item.sku).sort(),
  );
  expect(new Set(products.map((item) => item.warehouseSku)).size).toBe(products.length);
  const standardPrices = new Map(
    eligible.rows.map((row) => [row.sku, Number(row.standard_sale_price)]),
  );
  for (const item of expected) {
    const product = products.find((product) => product.warehouseSku === item.sku)!;
    const choice = selected.get(item.sku);
    expect(product.name).toBe(
      warehouseDisplayName(item.sku, item.product_short_name ?? item.product_name),
    );
    if (choice) {
      expect(product.warehouseCategoryId).toBe(choice.categoryId);
      expect(product.category).toBe(choice.categoryId);
    }
    expect(product.warehouseName).toBe(item.product_name);
    expect(product.description).toBe(item.description?.trim() ?? "");
    const net = Math.round(item.sale_price! * 100);
    expect(item.sale_price).toBe(standardPrices.get(item.sku));
    expect(product.warehouseNetUnitSatang).toBe(net);
    expect(product.price).toBe(net === 0 ? null : item.sale_price);
    if (product.media) expect(product.media.price).toBe(product.price);
    expect(Boolean(product.image)).toBe(Boolean(item.image_url));
    expect(product.fallbackImage).toBeUndefined();
  }
  for (const sku of [
    "X000000",
    "72",
    "Calibration Fee Type 2",
    "S000005",
    "S000006",
    "8858847106391",
  ]) {
    for (const slug of [encodeURIComponent(sku), `warehouse-${encodeURIComponent(sku)}`]) {
      const response = await request.get(`/products/${slug}`);
      // The existing parent Suspense can commit headers before notFound resolves.
      expect([200, 404]).toContain(response.status());
      const html = await response.text();
      expect(html).toContain("404 — NOT FOUND");
      expect(html).toContain('name="robots" content="noindex"');
      expect(html).not.toContain('id="product-overview"');
    }
  }
});

for (const width of [390, 1440]) {
  test(`Warehouse names, category cards and item_code searches work at ${width}px`, async ({
    page,
    request,
  }) => {
    test.setTimeout(180_000);
    page.setDefaultTimeout(15_000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 960 });
    const { products }: { products: Product[] } = await (await request.get("/api/products")).json();

    for (const sku of samples) {
      const item = products.find((product) => product.warehouseSku === sku)!;
      const choice = selected.get(sku)!;
      expect(item).toBeTruthy();
      await page.goto(`/products/category/${choice.categoryId}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("[data-products-overview]")).toHaveAttribute(
        "data-controls-ready",
        "true",
      );
      await page
        .getByRole("button", { name: /^ดู.+ทั้งหมด$/ })
        .first()
        .click();
      const finder = page.getByRole("dialog", { name: /^ดู.+ทั้งหมด$/ });
      for (const query of [sku, sku.toLowerCase()]) {
        await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill(query);
        await expect(finder.locator("#mock-product-results article h3")).toHaveText([item.name]);
      }
      await page.screenshot({
        path: test.info().outputPath(`${choice.categoryId}-cards-${width}.png`),
      });
      await finder.locator(`a[href^="/products/${item.slug}"]`).first().click();
      await expect(page.locator("#product-overview h1")).toHaveText(item.name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (item.image) {
        await expect
          .poll(() =>
            page
              .locator(".detail-image img")
              .first()
              .evaluate((img) => (img as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
      } else {
        await expect(page.locator(".detail-image .media-placeholder")).toBeVisible();
      }
      await page.getByRole("button", { name: /^ค้นหาสินค้า(?:และข้อมูล)?$/ }).click();
      const search = page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
      for (const query of [sku, sku.toLowerCase(), item.name, item.warehouseName!]) {
        await search.fill(query);
        await expect(
          page.locator(`.search-results a[href="/products/${item.slug}"] strong`),
        ).toHaveText(item.name);
      }
      await page.keyboard.press("Escape");
      await page.screenshot({
        path: test.info().outputPath(`${choice.categoryId}-detail-${width}.png`),
      });
    }

    const added =
      products.find((item) => item.warehouseSku === "G105110") ??
      products.find((item) => item.warehouseSku && !selected.has(item.warehouseSku))!;
    expect(added).toBeTruthy();
    const addedSource = source.items.find((item) => item.sku === added.warehouseSku)!;
    expect(added.name).toBe(
      warehouseDisplayName(
        addedSource.sku,
        addedSource.product_short_name ?? addedSource.product_name,
      ),
    );
    await page.goto(`/products/${added.slug}`, { waitUntil: "domcontentloaded" });
    await expect(page.locator("#product-overview h1")).toHaveText(added.name);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole("button", { name: /^ค้นหาสินค้า(?:และข้อมูล)?$/ }).click();
    const addedSearch = page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
    for (const query of [
      added.warehouseSku!,
      added.warehouseSku!.toLowerCase(),
      added.warehouseName!,
    ]) {
      await addedSearch.fill(query);
      await expect(
        page.locator(`.search-results a[href="/products/${added.slug}"] strong`),
      ).toHaveText(added.name);
    }
    await page.keyboard.press("Escape");
    await page.screenshot({ path: test.info().outputPath(`added-source-product-${width}.png`) });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    await page.getByRole("button", { name: /^ค้นหาสินค้า(?:และข้อมูล)?$/ }).click();
    const search = page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
    await search.fill("S000005");
    await expect(page.locator('.search-results a[href^="/products/"]')).toHaveCount(0);
    const inquiry = products.find((product) => product.price === null)!;
    await search.fill(inquiry.warehouseSku!);
    await expect(page.locator(`.search-results a[href="/products/${inquiry.slug}"]`)).toContainText(
      "สอบถามราคา",
    );
    expect(errors).toEqual([]);
  });
}
