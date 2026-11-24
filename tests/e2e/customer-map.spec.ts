import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`Footer no longer opens or downloads the customer map at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("/maps/thailand/")) requests.push(request.url());
    });
    for (const path of ["/", "/products", "/service?section=contact"]) {
      await page.goto(path);
      const footer = page.locator("footer:visible");
      await footer.scrollIntoViewIfNeeded();
      await expect(footer.locator(".footer-coverage")).toHaveCount(0);
      await expect(footer.getByRole("button", { name: /เปิดแผนที่ลูกค้า/ })).toHaveCount(0);
      await expect(page.locator(".customer-map-dialog")).toHaveCount(0);
    }
    expect(requests).toEqual([]);
  });
}
