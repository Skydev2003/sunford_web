import { expect, test } from "@playwright/test";

test("product overview and image choices fit the first desktop screen", async ({ page }) => {
  test.setTimeout(60000);
  for (const viewport of [
    { width: 1366, height: 768 },
    { width: 1440, height: 1000 },
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

test("mobile identity and inquiry precede the gallery in reading and keyboard order", async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 800 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/products/rls1100");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const selector of ["h1", ".detail-inquiry"]) {
      const box = (await page.locator(selector).boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(58);
      expect(box.y + box.height).toBeLessThan(viewport.height);
    }
    expect(
      await page.locator(".detail-inquiry").evaluate((link) => {
        const gallery = document.querySelector(".product-gallery")!;
        const highlights = document.querySelector(".detail-highlights")!;
        return (
          Boolean(link.compareDocumentPosition(gallery) & Node.DOCUMENT_POSITION_FOLLOWING) &&
          Boolean(gallery.compareDocumentPosition(highlights) & Node.DOCUMENT_POSITION_FOLLOWING)
        );
      }),
    ).toBe(true);
    const inquiry = page.locator(".detail-inquiry");
    await inquiry.focus();
    await page.keyboard.press("Tab");
    await expect(page.locator(".gallery-thumbnails button").first()).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(inquiry).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
    await page.screenshot({
      path: test.info().outputPath(`mobile-overview-${viewport.width}.png`),
    });
  }
});
