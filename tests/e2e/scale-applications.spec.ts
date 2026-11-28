import { expect, test } from "@playwright/test";

const overview = "/scales";
for (const [width, slug] of [
  [390, "cafes"],
  [1440, "bakeries"],
] as const) {
  test(`published scale application detail stays available at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/scales/applications/${slug}`);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).not.toBeEmpty();
    await expect(
      main
        .getByRole("navigation", { name: "เส้นทางนำทาง" })
        .getByRole("link", { name: "เครื่องชั่ง", exact: true }),
    ).toHaveAttribute("href", overview);
    await expect(main.locator('a[href$="/applications"]')).toHaveCount(0);
    const models = main.getByRole("list", { name: "เครื่องชั่งสำหรับงานนี้" });
    await expect(models.getByText("ใช้ได้บางกรณี ควรตรวจสเปกให้ตรงกับงาน").first()).toBeVisible();
    const product = models.getByRole("link").first();
    const href = await product.getAttribute("href");
    expect(href).toMatch(/^\/products\/[^/]+$/);
    await product.click();
    await expect(page).toHaveURL(new URL(href!, page.url()).href, { timeout: 20_000 });
  });
}
