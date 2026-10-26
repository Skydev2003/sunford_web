import "dotenv/config";
import { expect, test } from "@playwright/test";

test("public routes keep one shared header, footer and content search", async ({ page }) => {
  for (const route of ["/", "/products", "/explore", "/about-us", "/software/download"]) {
    await page.goto(route);
    await expect(page.locator(".site-header")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator(".admin-app")).toHaveCount(0);
  }

  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await dialog.getByRole("textbox").fill("รับประกัน");
  await expect(dialog.locator('a[href="/warranty/register"]')).toBeVisible();
  await dialog.locator('a[href="/warranty/register"]').click();
  await expect(page).toHaveURL(/\/warranty\/register$/);
  await expect(page.locator(".site-header")).toHaveCount(1);
});

test("missing public pages keep a single site layout", async ({ page }) => {
  for (const route of ["/products/does-not-exist", "/does-not-exist"]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "ยังไม่พบหน้าที่คุณกำลังมองหา" })).toBeVisible();
    await expect(page.locator(".site-header")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
  }
});

test("anonymous admin routes stay protected and separate from the public layout", async ({
  page,
}) => {
  test.skip(
    !process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY,
    "Supabase Auth configuration is required to check the anonymous login flow.",
  );
  for (const route of ["/admin/products", "/admin/home-images"]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "เข้าสู่พื้นที่แอดมิน" })).toBeVisible();
  }
  await expect(page.locator(".admin-app")).toHaveCount(1);
  await expect(page.locator(".site-header")).toHaveCount(0);
  await expect(page.getByRole("contentinfo")).toHaveCount(0);

  await page.goto("/about-us");
  await expect(page.locator(".site-header")).toHaveCount(1);
  await expect(page.locator(".admin-app")).toHaveCount(0);
});
