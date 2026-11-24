import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("desktop keyboard reaches submenu destinations and Escape returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const products = page
    .locator(".desktop-nav")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await products.focus();
  await page.keyboard.press("ArrowDown");
  const panel = page.locator("[data-nav-menu]");
  await expect(
    panel.getByRole("link", { name: "เครื่องชั่งครัวและกาแฟ", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("link", { name: "เครื่องชั่งสำหรับโรงงาน", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    panel.getByRole("link", { name: "เครื่องชั่งคำนวณราคา", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(products).toBeFocused();
  await expect(page.locator("#products-navigation-panel")).toBeHidden();
  await page.locator(".desktop-nav").getByRole("link", { name: "บริการ", exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(panel.getByRole("link", { name: "ขอใบเสนอราคา", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/service\/quotation$/);
});

test("touch navigation expands scales and follows the household destination", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await page.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
    await page.getByLabel("เปิดเมนูย่อยเครื่องชั่ง", { exact: true }).tap();
    await page
      .locator("#products-navigation-panel")
      .getByRole("link", { name: "เครื่องชั่งครัวและกาแฟ", exact: true })
      .tap();
    await expect(page).toHaveURL(/\/products\/category\/scales\/kitchen#product-listing-scales$/);
    await expect(page.locator('[data-product-subcategory-page="scale-kitchen"]')).toBeVisible();
    await expect(page.locator('#mock-product-results a[href^="/products/"]').first()).toBeVisible();
    await expect(page.locator("#products-navigation-panel")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("software menu opens the downloads directory and its category anchors", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page.locator(".desktop-nav").getByRole("link", { name: "บริการ", exact: true }).hover();
  await page
    .locator("[data-nav-menu]")
    .getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์", exact: true })
    .click();
  const directory = page.getByRole("main");
  await expect(directory.getByRole("heading", { level: 1 })).toHaveText("ดาวน์โหลดซอฟต์แวร์");
  for (const hash of ["retail-software", "industrial-software", "household-software"]) {
    await page.goto(`/software/download#${hash}`);
    await expect(page).toHaveURL(`/software/download#${hash}`);
    await expect(directory.locator(`#${hash}`).getByRole("heading", { level: 2 })).toBeInViewport();
  }
});
