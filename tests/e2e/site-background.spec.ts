import { expect, test } from "@playwright/test";

test("public pages have no decorative particle background or its motion control", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of ["/", "/products", "/contact-us", "/service"]) {
      await page.goto(route);
      await expect(page.locator("main").first()).toBeVisible();
      await expect(page.locator("[data-site-background]")).toHaveCount(0);
      await expect(page.getByRole("button", { name: /พื้นหลังเคลื่อนไหว/ })).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
});
