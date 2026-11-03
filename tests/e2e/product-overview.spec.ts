import { expect, test } from "@playwright/test";

test("product overview and image choices fit the first desktop screen", async ({ page }) => {
  test.setTimeout(60000);
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1920, height: 1080 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/products/acs30-jc21", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts.ready);
    for (const selector of [
      ".detail-image",
      ".gallery-thumbnails",
      ".detail-copy",
      ".detail-inquiry",
    ]) {
      const bounds = (await page.locator(selector).boundingBox())!;
      expect(bounds.y, selector).toBeGreaterThanOrEqual(58);
      expect(bounds.y + bounds.height, selector).toBeLessThanOrEqual(viewport.height);
    }
    const details = (await page.locator(".product-information").boundingBox())!;
    expect(details.y).toBeGreaterThanOrEqual(viewport.height - 1);
    await page.getByRole("button", { name: "ดูรูป ACS-30-JC21 มุมที่ 1", exact: true }).click();
    await expect(page.locator(".detail-image img")).toBeVisible();
  }
});
