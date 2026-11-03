import { test, expect } from "@playwright/test";

test.use({ javaScriptEnabled: false });

for (const width of [1440, 390]) {
  test(`homepage omits the removed business solutions section at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("#solutions")).toHaveCount(0);
    await expect(page.getByText("ONE CONNECTED ECOSYSTEM", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /ค้นพบ SUNFORD POS/ })).toHaveCount(0);
    await expect(page.locator('a[href="/#solutions"], a[href="#solutions"]')).toHaveCount(0);
    await expect(page.locator("[data-home-motion]")).toHaveCount(5);
    await expect(
      page.locator("[data-home-motion]:has(#product-experience) + [data-home-motion] #story"),
    ).toHaveCount(1);
    await expect(page.locator(".product-spotlight")).toHaveCount(1);
    await expect(
      page.locator("#product-experience .category-feature-product").first(),
    ).toHaveAttribute("href", /^\/products\//);
    await expect(page.locator("#stories")).toHaveCount(1);
    await expect(page.locator("#support")).toHaveCount(0);
    await expect(page.getByText("ALWAYS BY YOUR SIDE", { exact: true })).toHaveCount(0);
    await expect(
      page.getByText("มากกว่าสินค้า คือการดูแลที่วางใจได้", { exact: true }),
    ).toHaveCount(0);
    await expect(page.locator('img[src*="service-illustrations"]')).toHaveCount(0);
    await expect(page.locator("footer")).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
