import { expect, test } from "@playwright/test";
import type { Product } from "../../src/features/catalog/types";
import { productCardData } from "../../src/features/catalog/data/client-products";

for (const width of [390, 1440]) {
  test(`technical search opens the matching product by model and SKU at ${width}px`, async ({
    page,
    request,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const response = await page.goto("/technical-specification");
    expect(response?.ok()).toBe(true);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "คู่มือและสเปก", exact: true })).toBeVisible();
    await expect(
      main.getByRole("link", { name: "ตารางเตรียมข้อมูลสินค้า RLS1100 (XLSX)" }),
    ).toHaveAttribute("href", "/downloads/manuals/rls1100-products.xlsx");
    await expect(main.getByRole("link", { name: "แม่แบบฉลาก RLS1100 (PDF)" })).toHaveAttribute(
      "href",
      "/downloads/manuals/rls1100-label.pdf",
    );
    const query = main.getByRole("searchbox", { name: "รหัส SKU หรือชื่อรุ่น" });
    const searchRequests: string[] = [];
    page.on("request", (req) => {
      const { pathname } = new URL(req.url());
      if (pathname === "/technical-specification" || pathname === "/api/products")
        searchRequests.push(pathname);
    });
    await query.pressSequentially("ac");
    await expect(page).toHaveURL(/\?q=ac(?:#|$)/);
    const results = main.locator('#spec-search a[href^="/products/"]');
    await expect(results.first()).toBeVisible();
    const [firstTile, secondTile] = await results.evaluateAll((links) =>
      (links as HTMLElement[])
        .slice(0, 2)
        .map((link) => ({ x: link.offsetLeft, y: link.offsetTop, width: link.offsetWidth })),
    );
    expect(secondTile.y).toBe(firstTile.y);
    expect(secondTile.x).toBeGreaterThan(firstTile.x);
    expect(secondTile.width).toBe(firstTile.width);
    const catalog = await request.get("/api/products");
    expect(catalog.ok()).toBe(true);
    const { products } = (await catalog.json()) as { products: Product[] };
    const href = await results.first().getAttribute("href");
    const product = products.find(({ slug }) => href === `/products/${slug}`)!;
    const { name, image } = productCardData(product);
    await expect(results.first()).toHaveText(name);
    await expect(results.first().locator("img")).toHaveCount(image ? 1 : 0);
    await query.fill("");
    await query.pressSequentially(product.warehouseSku!);
    await expect.poll(() => new URL(page.url()).searchParams.get("q")).toBe(product.warehouseSku);
    const result = main.locator(`a[href=${JSON.stringify(href)}]`);
    await expect(result).toBeVisible();
    const narrowedTile = await result.evaluate((link) => ({
      x: (link as HTMLElement).offsetLeft,
      width: (link as HTMLElement).offsetWidth,
    }));
    expect(narrowedTile.x).toBe(firstTile.x);
    expect(narrowedTile.width).toBe(firstTile.width);
    expect(searchRequests).toEqual([]);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    if (width === 390) await result.click();
    else await result.press("Enter");
    await expect(page).toHaveURL(href!);
    await expect(page.locator("#product-overview h1")).toBeVisible();
    await page.goBack();
    await expect(query).toHaveValue(product.warehouseSku!);
    await page.reload();
    await expect(result).toBeVisible();
    await main.getByRole("link", { name: "ล้างการค้นหา" }).click();
    await expect(query).toBeFocused();
    await expect(query).toHaveValue("");
    expect(new URL(page.url()).searchParams.has("q")).toBe(false);
    await expect(results).toHaveCount(0);
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("technical specifications can be searched with native GET", async ({ page }) => {
    await page.goto("/technical-specification");
    await page.getByRole("link", { name: "ไปที่แบบค้นหาสเปกสินค้า" }).click();
    const query = page.getByRole("searchbox", { name: "รหัส SKU หรือชื่อรุ่น" });
    await query.fill("ac");
    await page.getByRole("button", { name: "ค้นหา", exact: true }).click();
    await expect(page).toHaveURL(/\?q=ac#spec-results$/);
    await expect(query).toHaveValue("ac");
    await expect(page.locator('#spec-results a[href^="/products/"]').first()).toBeVisible();
  });
});

test("the home and catalogue Navbar expose both support destinations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "บริการ", exact: true })
    .press("ArrowDown");
  const home = page.locator(".submenu-panel.is-active");
  await expect(home.getByRole("link", { name: "คู่มือและสเปก" })).toHaveAttribute(
    "href",
    "/technical-specification",
  );
  await expect(home.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
    "href",
    "/software/download",
  );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/technical-specification");
  const header = page.locator("[data-products-header]:visible");
  await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await header.getByRole("button", { name: "เปิดเมนูย่อยบริการ", exact: true }).click();
  const catalog = header.locator("#products-navigation-panel");
  await expect(catalog.getByRole("link", { name: "คู่มือและสเปก" })).toHaveAttribute(
    "href",
    "/technical-specification",
  );
  await expect(catalog.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
    "href",
    "/software/download",
  );
});
