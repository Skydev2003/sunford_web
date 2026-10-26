import { expect, test } from "@playwright/test";

test("storefront shelves scroll, show real photos and preserve comparison", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto("/products");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์ของเรา");
  await expect(page.locator(".store-category")).toHaveCount(8);
  const featured = page.locator("#store-featured");
  const next = page.getByRole("button", { name: "ถัดไป - สินค้าแนะนำของเรา.", exact: true });
  await expect(next).toBeEnabled();
  await next.click();
  await expect.poll(() => featured.evaluate((element) => element.scrollLeft)).toBeGreaterThan(300);
  await page.getByRole("button", { name: "ก่อนหน้า - สินค้าแนะนำของเรา.", exact: true }).click();
  await expect.poll(() => featured.evaluate((element) => element.scrollLeft)).toBeLessThan(5);
  const image = featured.locator(".is-dark img");
  await expect
    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
    .toBeGreaterThan(0);
  await featured
    .getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ WPS10KS", exact: true })
    .click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
  await expect(page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" })).toContainText(
    "WPS10KS",
  );
  await page.getByRole("dialog").getByRole("button", { name: "ปิด", exact: true }).click();
  await page.getByRole("button", { name: "ล้างรายการเปรียบเทียบ" }).click();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: "C:/tmp/sunford-store-desktop.png", animations: "disabled" });
  expect(errors).toEqual([]);
});

test("category images open the filtered catalogue and all products remain searchable", async ({
  page,
}) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "เลือกหมวด เครื่องชั่งอุตสาหกรรม", exact: true }).click();
  await expect(page.locator(".product-card h3").filter({ hasText: "TIS-150-JC62Z" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await page.getByRole("button", { name: "กลับไปหน้าแนะนำผลิตภัณฑ์", exact: true }).click();
  await expect(page.locator("#store-featured")).toBeVisible();
  await page.getByRole("button", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).click();
  await page.getByPlaceholder("ค้นหารุ่นสินค้า").fill("RLS1100");
  await expect(
    page.locator(".product-card").getByRole("heading", { name: "RLS1100", exact: true }),
  ).toBeVisible();
  expect(await page.locator(".product-card").count()).toBeLessThan(24);
  await page.getByPlaceholder("ค้นหารุ่นสินค้า").fill("no-such-model-123");
  await expect(page.locator(".product-card")).toHaveCount(0);
});

test("mobile storefront keeps the page within the viewport and leaves missing photos as slots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  await expect(page.locator("#store-assistance .media-placeholder")).toHaveCount(2);
  const rail = page.locator("#store-categories");
  expect(await rail.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
  for (const width of [320, 390, 768, 1280, 1800]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "C:/tmp/sunford-store-mobile.png", animations: "disabled" });
});
