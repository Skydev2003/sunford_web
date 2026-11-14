import { test, expect } from "@playwright/test";

const hiddenSkus = ["58", "G-DE001", "G109767", "M00001", "M000102", "DEVAPP"];
test.setTimeout(120_000);
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("public API omits fees, PPE and threads while retaining scales and parts", async ({
  request,
}) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBeTruthy();
  const { products } = await response.json();
  const skus = products.map((product: { warehouseSku: string }) => product.warehouseSku);
  for (const sku of hiddenSkus) expect(skus).not.toContain(sku);
  for (const sku of ["G106094", "G107015", "G107282", "G106612", "M00009"])
    expect(skus).toContain(sku);
  for (const sku of hiddenSkus.slice(0, 3)) {
    const image = await request.get(`/api/products/${sku}/image`);
    expect(image.status()).toBe(404);
  }
});

test("homepage Header search opens, finds a SKU and closes with JavaScript enabled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  const input = dialog.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
  await input.fill("g106094");
  await expect(dialog.locator('.search-results a[href^="/products/"]')).toHaveCount(1);
  await expect(dialog.locator(".search-results")).toContainText("JC21");
  await input.fill("M00001");
  await expect(dialog.locator('.search-results a[href^="/products/"]')).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

for (const width of [390, 834, 1440]) {
  test(`interactive search, lists and detail routes respect product visibility at ${width}px`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const { products } = await (await request.get("/api/products")).json();
    const retained = products.find(
      (product: { warehouseSku: string }) => product.warehouseSku === "G106094",
    );
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products");
    await expect(page.locator('[data-warehouse-sku="G106094"]').first()).toBeAttached();
    for (const sku of hiddenSkus)
      await expect(page.locator(`a[href="/products/warehouse-${sku}"]`)).toHaveCount(0);
    const searchButton = page.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true });
    await expect(searchButton).toBeEnabled();
    await searchButton.click();
    const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
    const input = dialog.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
    const result = dialog.locator(`.search-results a[href="/products/${retained.slug}"]`);
    await expect(input).toBeVisible();
    for (const query of ["G106094", "g106094", "ACS-30-JC21"]) {
      await input.fill(query);
      await expect(result).toBeVisible();
    }
    await page.screenshot({ path: test.info().outputPath(`search-${width}.png`) });
    for (const sku of hiddenSkus.filter((sku) => sku !== "58")) {
      await input.fill(sku);
      await expect(dialog.locator('.search-results a[href^="/products/"]')).toHaveCount(0);
    }
    await input.fill("NO-SUCH-SUNFORD-PRODUCT-923874");
    await expect(dialog.locator(".search-results a")).toHaveCount(0);
    await dialog.getByRole("button", { name: "ล้างการค้นหา" }).click();
    await expect(input).toHaveValue("");
    await expect(dialog.locator('.search-results a[href^="/products/"]').first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await searchButton.click();
    await input.fill("G106094");
    await result.click();
    await expect(page).toHaveURL(`/products/${retained.slug}`);
    await expect(page.locator("#product-overview h1")).toContainText("JC21");
    await page.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }).click();
    await input.fill("g106094");
    await expect(result).toBeVisible();
    await dialog.getByRole("button", { name: "ปิด", exact: true }).click();
    await expect(dialog).not.toBeVisible();
    for (const sku of ["M00001", "DEVAPP", "G-DE001"]) {
      const response = await page.goto(`/products/warehouse-${sku}`);
      expect(response).not.toBeNull();
      const html = await response!.text();
      expect(
        response!.status() === 404 || html.includes("NEXT_HTTP_ERROR_FALLBACK;404"),
      ).toBeTruthy();
      await expect(page.locator("#product-overview")).toHaveCount(0);
      await expect(
        page.getByRole("heading", { level: 1, name: "ยังไม่พบหน้าที่คุณกำลังมองหา" }),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}
