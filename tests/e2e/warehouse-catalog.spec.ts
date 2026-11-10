import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("saved Warehouse photo decodes on the product card and detail page", async ({ page }) => {
  await page.goto("/products");
  const card = page.locator('[data-warehouse-sku="G107169"]');
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

test("Home search and comparison reuse the published Warehouse identities", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const search = page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
  await search.fill("G106308");
  await expect(page.locator(".search-results a")).toHaveCount(1);
  await expect(page.locator(".search-results a")).toContainText("TMS-60-AW31");
  await page.keyboard.press("Escape");
  await page.goto("/products?catalog=all");
  const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
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

test("public catalog lists each eligible non-X SKU once with real detail/images", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/products");
  expect(response.status()).toBe(200);
  const { products } = await response.json();
  expect(new Set(products.map((p: { warehouseSku: string }) => p.warehouseSku)).size).toBe(
    products.length,
  );
  const official = await fetch(new URL("/api/store/products", process.env.WAREHOUSE_API_URL!), {
    signal: AbortSignal.timeout(10000),
  }).then((r) => r.json());
  const hidden = new Set(["72", "Calibration Fee Type 2", "S000005", "S000006"]);
  const expected = [
    ...new Set(
      official.items
        .map((p: { sku: string }) => p.sku)
        .filter((sku: string) => !/^x/i.test(sku) && !hidden.has(sku)),
    ),
  ].sort();
  expect(products.map((p: { warehouseSku: string }) => p.warehouseSku).sort()).toEqual(expected);
  await page.goto("/service/quotation");
  const select = page.getByRole("combobox").first();
  await expect(select).toBeVisible();
  const options = await select
    .locator("option")
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("value")).filter(Boolean));
  expect(options.sort()).toEqual(
    expected.filter((sku) =>
      official.items.some(
        (i: { sku: string; sale_price: number }) => i.sku === sku && i.sale_price > 0,
      ),
    ),
  );
  const item = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106308");
  const upstream = official.items.find((p: { sku: string }) => p.sku === item.warehouseSku);
  expect(item.warehouseNetUnitSatang).toBe(Math.round(upstream.sale_price * 100));
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
        (p: { warehouseCategoryId: string }) => p.warehouseCategoryId === category,
      );
      const link = page.locator(`main a[href^="/products/${member.slug}"]`).first();
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

test("actual configurator opens a kit quotation once, with units and live net price plus VAT", async ({
  page,
  request,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/guides/indicator-platform-compatibility");
  await expect(page.getByRole("button", { name: "เลือก CableConnector", exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "เลือก Indicator-AW31", exact: true }).click();
  await page.getByRole("button", { name: "เลือก TMS-60-AW31", exact: true }).click();
  const opened = page.waitForEvent("popup");
  await page
    .locator("main aside")
    .getByRole("link", { name: /ทำใบเสนอราคา/ })
    .click();
  const quote = await opened;
  await expect(quote.getByRole("combobox")).toHaveCount(1, { timeout: 20000 });
  await expect(quote.getByRole("combobox")).toHaveValue("G106308");
  await expect(quote.getByRole("button", { name: "พิมพ์ / บันทึก PDF" })).toBeEnabled();
  await quote.getByLabel("ชื่อผู้ซื้อ / บริษัท").fill("ตรวจการเชื่อม Warehouse");
  await quote.getByLabel("ที่อยู่", { exact: true }).fill("ข้อมูลทดสอบเฉพาะในเบราว์เซอร์");
  await quote.getByRole("spinbutton").fill("2");
  await quote.evaluate(() => {
    window.print = () => {
      document.documentElement.dataset.printed = "true";
    };
  });
  await quote.getByRole("button", { name: "พิมพ์ / บันทึก PDF" }).click();
  await expect(quote.locator("html")).toHaveAttribute("data-printed", "true");
  const { products } = await (await request.get("/api/products")).json();
  const kit = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106308");
  await quote.emulateMedia({ media: "print" });
  const sheet = quote.getByRole("article", { name: "ใบเสนอราคาสำหรับพิมพ์" });
  await expect(sheet.locator("tbody tr")).toHaveCount(1);
  await expect(sheet.locator("tbody")).toContainText("G106308");
  await expect(sheet.locator("tbody")).not.toContainText("G107770");
  const totals = (await sheet.locator("dd").allTextContents()).map((s) =>
    Math.round(Number(s.replaceAll(",", "")) * 100),
  );
  expect(totals[0]).toBe(kit.warehouseNetUnitSatang * 2);
  expect(totals[1]).toBe(Math.round(totals[0] * 0.07));
  expect(totals[2]).toBe(totals[0] + totals[1]);
  await quote.pdf({
    path: test.info().outputPath("warehouse-quotation.pdf"),
    preferCSSPageSize: true,
  });
  await quote.close();
});
