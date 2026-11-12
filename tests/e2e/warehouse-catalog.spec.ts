import { downloadQuotation } from "./quotation-download";
import { expect, test } from "@playwright/test";
import { loadEnvConfig } from "@next/env";
import { warehouseModelName } from "../../src/features/catalog/data/catalog-card-names";
import {
  readWarehouseProducts,
  closeWarehousePool,
} from "../../src/features/services/warehouse-postgres";

loadEnvConfig(process.cwd(), true);
test.afterAll(() => closeWarehousePool());

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("saved Warehouse photo decodes on the product card and detail page", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const product = products.find((p: { image: string }) =>
    p.image.startsWith("/images/warehouse-cache/"),
  );
  await page.goto("/products");
  const card = page.locator(`[data-warehouse-sku="${product.warehouseSku}"]`);
  await card.scrollIntoViewIfNeeded();
  const photo = card.locator("img").first();
  await expect
    .poll(() => photo.evaluate((img) => (img as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await card.getByRole("link").first().click();
  const gallery = page.locator(".detail-image img");
  await expect
    .poll(() => gallery.evaluate((img) => (img as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(gallery).toHaveAttribute("src", /warehouse-cache/);
});

test("Home search and comparison include Warehouse products awaiting photos", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const awaitingPhoto = products.find(
    (p: { image: string; warehouseSku: string }) => !p.image && /^G\d+$/.test(p.warehouseSku),
  );
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const search = page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
  if (awaitingPhoto) {
    await search.fill(awaitingPhoto.warehouseSku);
    await expect(
      page.locator(`.search-results a[href="/products/${awaitingPhoto.slug}"]`),
    ).toBeVisible();
  }
  await search.fill("G106308");
  await expect(page.locator(".search-results a")).toHaveCount(1);
  await expect(page.locator(".search-results a")).toContainText("TMS-60-AW31");
  await page.keyboard.press("Escape");
  await page.goto("/products?catalog=all");
  const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
  if (awaitingPhoto) {
    await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill(awaitingPhoto.warehouseSku);
    const result = finder.locator("#mock-product-results article").filter({
      has: page.locator(`a[href^="/products/${awaitingPhoto.slug}"]`),
    });
    await expect(result.locator(".media-placeholder")).toBeVisible();
  }
  await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("G106308");
  await finder.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  await finder.getByRole("button", { name: /เพิ่มเพื่อเปรียบเทียบ/ }).click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
  const comparison = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
  await expect(comparison).toContainText("TMS-60-AW31");
  await expect(comparison.locator('a[href^="/products/"]')).toHaveAttribute(
    "href",
    "/products/10630",
  );
});

for (const width of [390, 1440]) {
  test(`a Warehouse item awaiting a photo opens from the directory and category at ${width}px`, async ({
    page,
    request,
  }) => {
    const { products } = await (await request.get("/api/products")).json();
    const item = products.find(
      (p: { image: string; warehouseCategoryId?: string; warehouseSku: string }) =>
        !p.image && p.warehouseCategoryId && /^G\d+$/.test(p.warehouseSku),
    );
    test.skip(!item, "All categorized Warehouse items have photos");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products");
    const card = page.locator(
      `[data-products-directory] [data-warehouse-sku="${item.warehouseSku}"]`,
    );
    await expect(card.getByRole("img", { name: /พื้นที่สำหรับรูปภาพ/ })).toBeVisible();
    await card.getByRole("link").first().click();
    await expect(page.locator("#product-overview h1")).toHaveText(item.name);
    await expect(page.locator(".detail-image .media-placeholder")).toBeVisible();
    await page.goto(`/products/category/${item.warehouseCategoryId}`);
    await page
      .getByRole("button", { name: /^ดู.+ทั้งหมด$/ })
      .first()
      .click();
    const finder = page.getByRole("dialog", { name: /^ดู.+ทั้งหมด$/ });
    await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill(item.warehouseSku);
    const link = finder.locator(`a[href^="/products/${item.slug}"]`).first();
    await expect(link).toBeVisible();
  });
}

test("public catalog lists every eligible RPC SKU once while quotation retains positive-price eligibility", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/products");
  expect(response.status()).toBe(200);
  const official = await readWarehouseProducts();
  const { products } = await response.json();
  expect(new Set(products.map((p: { warehouseSku: string }) => p.warehouseSku)).size).toBe(
    products.length,
  );
  const hidden = new Set(["72", "Calibration Fee Type 2", "S000005", "S000006"]);
  const publicSkus = [
    ...new Set(
      official.items
        .map((p: { sku: string }) => p.sku)
        .filter((sku: string) => !/^x/i.test(sku) && !hidden.has(sku)),
    ),
  ].sort();
  const expected = publicSkus;
  expect(products.map((p: { warehouseSku: string }) => p.warehouseSku).sort()).toEqual(expected);
  await page.goto("/products");
  const cards = page.locator("[data-products-directory] [data-warehouse-sku]");
  await expect(cards).toHaveCount(products.length);
  const titles = await cards.evaluateAll((nodes) =>
    Object.fromEntries(
      nodes.map((node) => [
        node.getAttribute("data-warehouse-sku"),
        node.querySelector("h3")?.textContent,
      ]),
    ),
  );
  for (const product of products) expect(titles[product.warehouseSku]).toBe(product.name);
  expect(
    await cards.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-warehouse-sku")).sort(),
    ),
  ).toEqual(expected);
  await page.goto("/service/quotation");
  await page
    .getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่/ })
    .first()
    .click();
  const select = page.getByRole("list", { name: "รุ่นสินค้า" });
  const labels = await select
    .getByRole("button")
    .evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((option) => [option.getAttribute("value"), option.getAttribute("aria-label")]),
      ),
    );
  for (const product of official.items.filter(
    (item) => publicSkus.includes(item.sku) && item.sale_price !== null && item.sale_price > 0,
  ))
    expect(labels[product.sku]).toBe(warehouseModelName(product.sku, product.product_name));
  expect(labels.G106308).toBe("TMS-60-AW31");
  expect(labels.G107435).toBe("G107435");
  const options = await select
    .getByRole("button")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("value")).filter(Boolean));
  expect(options.sort()).toEqual(
    publicSkus.filter((sku) =>
      official.items.some((i) => i.sku === sku && i.sale_price !== null && i.sale_price > 0),
    ),
  );
  const item = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106308");
  const upstream = official.items.find((p: { sku: string }) => p.sku === item.warehouseSku);
  expect(item.warehouseNetUnitSatang).toBe(Math.round(upstream!.sale_price! * 100));
  expect(item.price).toBe(
    (item.warehouseNetUnitSatang + Math.round(item.warehouseNetUnitSatang * 0.07)) / 100,
  );
  await page.goto(`/products/${item.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("TMS-60-AW31");
  await expect(page.locator(".detail-price")).toContainText(item.price.toLocaleString("th-TH"));
  const image = await request.get("/api/products/G106292/image");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toMatch(/^image\//);
  expect((await request.get("/api/products/S000005/image")).status()).toBe(404);
  const newlyListed = products.find((p: { warehouseSku: string }) => p.warehouseSku === "11");
  await page.goto(`/products/${newlyListed.slug}`);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(newlyListed.name);
  expect((await request.get("/api/products/X000000/image")).status()).toBe(404);
});

for (const width of [390, 834, 1440]) {
  test(`all five actual categories, details and search stay usable at ${width}px`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 960 });
    const { products } = await (await request.get("/api/products")).json();
    for (const category of ["scales", "indicators", "platforms", "pos", "accessories"]) {
      await page.goto(`/products/category/${category}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const member = products.find(
        (p: { warehouseCategoryId: string; image: string }) => p.warehouseCategoryId === category,
      );
      if (!(await page.locator(`main a[href^="/products/${member.slug}"]`).count())) {
        await page
          .getByRole("button", { name: /^ดู.+ทั้งหมด$/ })
          .first()
          .click();
        await page
          .getByRole("dialog")
          .getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })
          .fill(member.warehouseSku);
      }
      const link = page.locator(`a[href^="/products/${member.slug}"]:visible`).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page.getByRole("heading", { level: 1 })).toContainText(member.name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto("/products?catalog=all");
    const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
    await expect(finder).toBeVisible();
    await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("WPS10KS");
    await expect(
      finder.getByRole("heading", { level: 3, name: "WPS10KS", exact: true }).first(),
    ).toBeVisible();
    await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("G106308");
    await expect(finder.locator("#mock-product-results article h3")).toHaveText(["TMS-60-AW31"]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`warehouse-${width}.png`) });
  });
}

test("Warehouse SKU handoff preserves current net price and VAT without inferred bundling", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const item = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106308");
  await page.goto("/service/quotation?model=G106308");
  await expect(page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 1/ })).toHaveAttribute(
    "value",
    item.warehouseSku,
  );
  await page.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ตรวจการเชื่อม Warehouse");
  await page.getByLabel("ที่อยู่", { exact: true }).fill("ข้อมูลทดสอบเฉพาะในเบราว์เซอร์");
  await page.getByRole("spinbutton").fill("2");
  const totals = (await page.locator("form dd").allTextContents()).map((s) =>
    Math.round(Number(s.replaceAll(",", "")) * 100),
  );
  expect(totals).toEqual([
    item.warehouseNetUnitSatang * 2,
    Math.round(item.warehouseNetUnitSatang * 2 * 0.07),
    item.warehouseNetUnitSatang * 2 + Math.round(item.warehouseNetUnitSatang * 2 * 0.07),
  ]);
  const pdf = await downloadQuotation(page, test.info().outputPath("warehouse-quotation.pdf"));
  expect(pdf.getPageCount()).toBe(1);
});

for (const width of [390, 834, 1440]) {
  test(`Warehouse accessory groups retain source photo and blank states at ${width}px`, async ({
    page,
    request,
  }) => {
    const { products } = await (await request.get("/api/products")).json();
    await page.setViewportSize({ width, height: 900 });
    for (const [group, id] of [
      ["cables", "accessory-cables"],
      ["mechanical", "accessory-mechanical"],
    ]) {
      const members = products.filter((p: { warehouseSubcategoryIds?: string[] }) =>
        p.warehouseSubcategoryIds?.includes(id),
      );
      await page.goto(`/products/category/accessories/${group}`);
      for (const item of members.slice(0, 2))
        await expect(page.locator(`main a[href^="/products/${item.slug}"]`).first()).toBeVisible();
      if (!members.length) {
        await expect(page.getByRole("main").getByRole("status")).toHaveText("0 รายการ");
        continue;
      }
      const item = members[0];
      await page.locator(`main a[href^="/products/${item.slug}"]`).first().click();
      if (item.image)
        await expect
          .poll(() =>
            page
              .locator(".detail-image img")
              .first()
              .evaluate((img) => (img as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
      else await expect(page.locator(".detail-image .media-placeholder")).toBeVisible();
      await expect(page.locator("#product-overview h1")).toHaveText(item.name);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

test("a newly linked roller tray can be quoted at its current Warehouse price", async ({
  page,
  request,
}) => {
  const { products } = await (await request.get("/api/products")).json();
  const item = products.find((row: { warehouseSku: string }) => row.warehouseSku === "G108494");
  await page.goto("/service/quotation");
  await page
    .getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่/ })
    .first()
    .click();
  const list = page.getByRole("list", { name: "รุ่นสินค้า" });
  await list.locator('button[value="G108494"]').click();
  const totals = page.locator("form dd");
  await expect
    .poll(async () =>
      (await totals.allTextContents()).map((text) =>
        Math.round(Number(text.replaceAll(",", "")) * 100),
      ),
    )
    .toEqual([
      item.warehouseNetUnitSatang,
      Math.round(item.price * 100) - item.warehouseNetUnitSatang,
      Math.round(item.price * 100),
    ]);
});
