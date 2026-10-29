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

test("removed admin routes return 404 without authentication or product redirects", async ({
  page,
  request,
}) => {
  for (const route of [
    "/admin",
    "/admin/login",
    "/admin/products",
    "/admin/products/new",
    "/admin/products/sunford-10643/edit",
    "/admin/products/10643",
    "/admin/categories",
    "/admin/content",
    "/admin/content/navigation",
    "/admin/home-images",
    "/admin/trash",
    "/admin/audit",
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(page.locator("body")).toHaveText("Not Found");
    await expect(page.locator(".admin-app")).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe(route);
  }
  const response = await request.post("/admin/products", { form: { name: "Removed admin route" } });
  expect(response.status()).toBe(404);
  await page.goto("/products/10643");
  await expect(page.getByRole("heading", { name: "ACS-30-JC21EL", exact: true })).toBeVisible();
});
