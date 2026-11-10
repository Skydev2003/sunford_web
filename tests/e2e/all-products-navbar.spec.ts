import { expect, test, type Page } from "@playwright/test";

const routes = ["/", "/contact-us"] as const;

function header(page: Page, route: string) {
  return page.locator(route === "/" ? ".site-header:visible" : "[data-products-header]:visible");
}

async function visit(page: Page, route: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  if (route === "/")
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  else await expect(header(page, route).getByRole("button").first()).toBeEnabled();
}

for (const route of routes) {
  test(`${route} opens the logo-aligned all-products menu and navigates directly`, async ({
    page,
  }) => {
    await visit(page, route);
    const nav = header(page, route);
    const allProducts = nav.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true });
    const scales = nav.getByRole("link", { name: "เครื่องชั่ง", exact: true });
    await expect(allProducts).toHaveCount(1);
    await expect(allProducts).toHaveText("ผลิตภัณฑ์ทั้งหมด");
    await expect(allProducts).toHaveAttribute("aria-expanded", "false");
    const positions = await Promise.all([allProducts.boundingBox(), scales.boundingBox()]);
    expect(positions[0]!.x).toBeLessThan(positions[1]!.x);
    await allProducts.hover();
    await expect(allProducts).toHaveAttribute("aria-expanded", "true");
    const panel = nav.locator("[data-all-products]:visible");
    await expect(panel.locator("a")).toHaveCount(11);
    await expect(panel.locator("p")).toHaveText([
      "สำรวจผลิตภัณฑ์",
      "ลิงก์ด่วน",
      "บริการและความช่วยเหลือ",
    ]);
    const first = await panel.locator("a").first().boundingBox();
    const logo = await nav.locator('a[href="/"]:visible').first().boundingBox();
    expect(Math.abs(first!.x - logo!.x)).toBeLessThanOrEqual(1);
    await page.screenshot({ path: test.info().outputPath("desktop-menu.png") });
    await allProducts.press("ArrowDown");
    await expect(panel.locator("a").first()).toBeFocused();
    await allProducts.focus();
    await expect(allProducts).toBeFocused();
    await allProducts.press("Enter");
    await expect(page).toHaveURL(/\/products$/);
  });

  test(`${route} preserves native modified-link navigation`, async ({ page }) => {
    await visit(page, route);
    const original = page.url();
    const link = header(page, route).getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true });
    const [next] = await Promise.all([
      page.context().waitForEvent("page"),
      link.click({ modifiers: ["Control"] }),
    ]);
    await expect(next).toHaveURL(/\/products$/);
    await expect(page).toHaveURL(original);
    await next.close();
  });

  test(`${route} mobile products disclosure provides category and secondary links`, async ({
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
      await page.goto(route);
      if (route === "/")
        await expect(page.locator("[data-brand-opening]")).toHaveAttribute(
          "data-phase",
          "complete",
        );
      const nav = header(page, route);
      await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      const link = nav.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true });
      await expect(link).toBeVisible();
      await nav.getByLabel("เปิดเมนูย่อยผลิตภัณฑ์ทั้งหมด", { exact: true }).tap();
      const panel = nav.locator("[data-all-products]:visible");
      await expect(panel.locator("a")).toHaveCount(11);
      await page.screenshot({ path: test.info().outputPath("mobile-menu.png") });
      await panel.getByRole("link", { name: "ดูผลิตภัณฑ์ทั้งหมด", exact: true }).tap();
      await expect(page).toHaveURL(/\/products$/);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    } finally {
      await context.close();
    }
  });
}

for (const width of [834, 930, 1023, 1024, 1440]) {
  for (const route of routes) {
    test(`${route} primary navigation controls remain inside ${width}px`, async ({ page }) => {
      await visit(page, route, width);
      const nav = header(page, route);
      const controls = nav.locator("a:visible, button:visible");
      const boxes = (
        await controls.evaluateAll((elements) =>
          elements
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return { x: rect.x, right: rect.right, y: rect.y, bottom: rect.bottom };
            })
            .filter((rect) => rect.bottom <= 50 && rect.right > rect.x),
        )
      ).sort((left, right) => left.x - right.x);
      expect(boxes.length).toBeGreaterThanOrEqual(11);
      expect(boxes.every((box) => box.x >= 0 && box.right <= width)).toBe(true);
      for (let index = 1; index < boxes.length; index++)
        expect(boxes[index].x).toBeGreaterThanOrEqual(boxes[index - 1].right - 0.5);
      await nav.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).press("ArrowDown");
      const menu = nav.locator("[data-all-products]:visible");
      await expect(menu.locator("a").first()).toBeFocused();
      const firstLink = await menu.locator("a").first().boundingBox();
      const logo = await nav.locator('a[href="/"]:visible').first().boundingBox();
      expect(Math.abs(firstLink!.x - logo!.x)).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}

test("same-route all-products link closes an open internal submenu", async ({ page }) => {
  await visit(page, "/products");
  const nav = header(page, "/products");
  const scales = nav.getByRole("link", { name: "เครื่องชั่ง", exact: true });
  await scales.hover();
  await expect(page.locator("#products-navigation-panel")).toBeVisible();
  await nav.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await expect(page.locator("#products-navigation-panel")).not.toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
