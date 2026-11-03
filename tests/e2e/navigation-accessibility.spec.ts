import { expect, test } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test("desktop keyboard reaches submenu destinations and Escape returns focus", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const products = page.locator(".desktop-nav").getByRole("link", { name: "สินค้า", exact: true });
  await products.focus();
  await page.keyboard.press("ArrowDown");
  const panel = page.locator(".submenu-panel.is-active");
  await expect(panel.getByRole("link", { name: "สินค้าทั้งหมด", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "เครื่องชั่งดิจิทัล", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(products).toBeFocused();
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "โซลูชันตามธุรกิจ", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect(panel.getByRole("link", { name: "ร้านค้าและตลาดสด", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/product\/commercial$/);
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
      .getByRole("link", { name: "เครื่องชั่งกาแฟ", exact: true })
      .tap();
    await expect(page).toHaveURL(/\/collections\/coffee-scales$/);
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
  for (const [label, hash] of [
    ["ซอฟต์แวร์สำหรับค้าปลีก", "retail-software"],
    ["ซอฟต์แวร์สำหรับอุตสาหกรรม", "industrial-software"],
    ["ซอฟต์แวร์สำหรับครัวเรือน", "household-software"],
  ]) {
    await page
      .locator(".desktop-nav")
      .getByRole("link", { name: "ซอฟต์แวร์", exact: true })
      .hover();
    await page
      .locator(".desktop-submenu.is-open .submenu-panel.is-active")
      .getByRole("link", { name: label, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`/software/download#${hash}$`));
    await expect(page.locator(`.software-filters a[href="#${hash}"]`)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.locator(".software-card").first()).toBeVisible();
  }
  await page.goBack();
  await expect(page).toHaveURL(/\/software\/download#industrial-software$/);
  await expect(page.locator('.software-filters a[href="#industrial-software"]')).toHaveAttribute(
    "aria-current",
    "true",
  );
});
