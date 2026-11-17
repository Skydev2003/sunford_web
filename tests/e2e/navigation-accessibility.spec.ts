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
  const panel = page.locator(".submenu-panel.is-active");
  await expect(panel.getByRole("link", { name: "คำนวณราคา", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "อุตสาหกรรม", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(products).toBeFocused();
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
  await page.locator(".desktop-nav").getByRole("link", { name: "บริการ", exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(panel.getByRole("link", { name: "หลังการขาย", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/service$/);
});

test("touch navigation expands products and follows the company coffee destination", async ({
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
    await page.locator("#mobile-navigation summary").first().tap();
    await page
      .locator("#mobile-navigation")
      .getByRole("link", { name: "ครัวและกาแฟ", exact: true })
      .tap();
    await expect(page).toHaveURL(/\/products\/category\/scales\/kitchen$/);
    await expect(page.locator('[data-product-subcategory-page="scale-kitchen"]')).toBeVisible();
    await expect(page.locator('#mock-product-results a[href^="/products/"]').first()).toBeVisible();
    await expect(page.locator("#mobile-navigation")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("software menu category links select the real filter on first entry and same-page navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page.locator(".desktop-nav").getByRole("link", { name: "บริการ", exact: true }).hover();
  await page
    .locator(".submenu-panel.is-active")
    .getByRole("link", { name: "ซอฟต์แวร์", exact: true })
    .click();
  for (const hash of ["retail-software", "industrial-software", "household-software"]) {
    await page.locator(`.software-filters a[href="#${hash}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/applications-and-softwares#${hash}$`));
    await expect(page.locator(`.software-filters a[href="#${hash}"]`)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.locator(".software-catalog .empty-state")).toBeVisible();
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
});
