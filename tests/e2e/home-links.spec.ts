import { expect, test } from "@playwright/test";

test("homepage spotlight media retains its product destination", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const spotlight = page.locator(".product-spotlight");
  const spotlightHref = await spotlight.locator(".spotlight-visual").getAttribute("href");
  await expect(spotlight.locator("h2")).toHaveText("SUNFORD JC21");
  expect(spotlightHref).toBe("/products/acs30-jc21");
  await expect(spotlight.locator(".spotlight-actions")).toHaveCount(0);
  await spotlight.locator(".spotlight-visual").click();
  await expect(page).toHaveURL(new RegExp(`${spotlightHref}$`));
  await expect(page.getByRole("heading", { level: 1 })).toContainText("JC21");
});
