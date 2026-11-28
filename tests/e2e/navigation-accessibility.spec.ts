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
  await expect(panel.getByRole("link", { name: "ห้องปฏิบัติการ", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "อุตสาหกรรม", exact: true })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(panel.getByRole("link", { name: "ร้านค้าและบริการ", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(products).toBeFocused();
  await expect(page.locator("#products-navigation-panel")).toBeHidden();
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "บริการช่วยเหลือ", exact: true })
    .focus();
  await page.keyboard.press("ArrowDown");
  await expect(panel.getByRole("link", { name: "ลงทะเบียนรับประกัน", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/service\/warranty\/register$/);
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
      .getByRole("link", { name: "ครัวเรือนและบุคคล", exact: true })
      .tap();
    await expect(page).toHaveURL(/\/scales\/household$/);
    await expect(page.locator('[data-product-subcategory-page="scale-kitchen"]')).toBeVisible();
    await expect(page.locator('#mock-product-results a[href^="/products/"]').first()).toBeVisible();
    await expect(page.locator("#products-navigation-panel")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

for (const width of [390, 834, 1440]) {
  test(`software menu opens its dedicated category pages and contact at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(width === 834 ? "/service?section=contact" : "/");

    const categories = [
      ["การพาณิชย์และค้าปลีก", "retail-software"],
      ["การผลิตอุตสาหกรรม", "industrial-software"],
      ["ครัวเรือนและสุขภาพ", "household-software"],
    ] as const;
    const panel = page.locator('[data-nav-menu="/software"]:visible');
    const openSoftware = async () => {
      if (width < 1024) {
        await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
        await page.getByRole("button", { name: "เปิดเมนูย่อยซอฟต์แวร์", exact: true }).click();
      } else {
        await page
          .locator(".desktop-nav")
          .getByRole("link", {
            name: "ซอฟต์แวร์",
            exact: true,
          })
          .press("ArrowDown");
      }
      await expect(panel).toBeVisible();
    };

    for (const [label, section] of categories) {
      await openSoftware();
      const columns = panel.locator("[data-nav-column]");
      await expect(columns.locator(":scope > p")).toHaveText(["ซอฟต์แวร์", "ช่วยเหลือ"]);
      await expect(columns.nth(0).getByRole("link")).toHaveText(categories.map(([label]) => label));
      await expect(columns.nth(1).getByRole("link")).toHaveText(["ติดต่อเรา"]);
      const href = `/software/${section.replace("-software", "")}`;
      const link = panel.getByRole("link", { name: label, exact: true });
      await expect(link).toHaveAttribute("href", href);
      await link.click();
      await expect(page).toHaveURL(href);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(panel).toHaveCount(0);
    }

    await openSoftware();
    await panel.getByRole("link", { name: "ติดต่อเรา", exact: true }).click();
    await expect(page).toHaveURL("/service?section=contact");
    await expect(panel).toHaveCount(0);
  });
}
