import { expect, test } from "@playwright/test";
import { defaultSite } from "../../src/features/site/data/settings";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 834, 1440]) {
  test(`local content and live product details remain usable without CMS at ${width}px`, async ({
    page,
    request,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 960 });
    for (const path of ["/about-us", "/contact-us", "/software/download"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(
        page.locator(`footer a[href="mailto:${defaultSite.email}"]`).first(),
      ).toHaveCount(1);
      expect(await page.locator("main").innerText()).not.toContain("เกิดข้อผิดพลาด");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    const { products } = await (await request.get("/api/products")).json();
    const product = products.find((p: { warehouseSku: string }) => p.warehouseSku === "G106698");
    expect(product.fallbackImage).toMatch(/^\/images\//);
    await page.goto(`/products/${product.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(product.name);
    await expect(page.locator("main")).toContainText("IP67");
    expect(await page.locator(".gallery-thumbnails button").count()).toBeGreaterThan(2);
    await expect
      .poll(() =>
        page.locator(".detail-image img").evaluate((el) => (el as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`local-content-${width}.png`) });
  });
}

test("health checks the active Warehouse connection without a CMS database", async ({
  request,
}) => {
  const response = await request.get("/api/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect((await response.json()).status).toBe("ok");
});
