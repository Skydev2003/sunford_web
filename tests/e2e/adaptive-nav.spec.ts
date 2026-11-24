import { expect, test, type Page } from "@playwright/test";

async function expectTone(page: Page, tone: "light" | "dark") {
  const header = page.locator(".site-header:visible");
  await expect(header).toHaveAttribute("data-nav-tone", tone);
  await expect(header.locator(".nav-glass")).toHaveCSS("backdrop-filter", "blur(12px)");
  await expect(header.locator(".nav-glass")).toHaveCSS(
    "background-color",
    tone === "light" ? "rgba(255, 255, 255, 0.72)" : "rgba(17, 17, 17, 0.5)",
  );
  await expect(header).toHaveCSS(
    "color",
    tone === "light" ? "rgb(39, 49, 66)" : "rgb(207, 207, 207)",
  );
}

async function beneathNav(page: Page, selector: string) {
  await page
    .locator(selector)
    .evaluate((section) =>
      scrollTo({ top: section.getBoundingClientRect().top + scrollY + 20, behavior: "instant" }),
    );
}

async function expectInteriorNavigation(page: Page) {
  const header = page.locator("[data-products-header]:visible");
  await expect(header).toHaveCount(1);
  await expect(header).toHaveCSS("background-color", "rgba(250, 250, 252, 0.8)");
  await expect(header).not.toHaveAttribute("data-nav-home");
}

for (const width of [1440, 390]) {
  test(`opening overlay does not change the navigation surface at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "symbol");
    await expectTone(page, "dark");
    await expect(page.locator(".site-header")).toHaveCount(1);
    await expect(page.locator(".nav-glass")).toHaveCount(1);
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    await expectTone(page, "dark");
  });

  test(`navigation preserves homepage dark surfaces, including expanded menus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await expectTone(page, "dark");
    await beneathNav(page, "#product-experience");
    await expectTone(page, "dark");
    await beneathNav(page, "#story");
    await expectTone(page, "dark");
    const header = page.locator(".site-header");
    if (width >= 1400) {
      await header.locator(".desktop-nav a").first().press("ArrowDown");
      await expect(header.locator("#products-navigation-panel")).toBeVisible();
      await expect(header.locator("#products-navigation-panel")).toHaveCSS(
        "background-color",
        "rgb(0, 0, 0)",
      );
      await expect(header.locator("[data-nav-column]").first()).toHaveCSS(
        "color",
        "rgb(207, 207, 207)",
      );
    } else {
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await expect(header.locator("#products-navigation-panel")).toBeVisible();
      await header
        .getByRole("button", { name: "เปิดเมนูย่อยผลิตภัณฑ์ทั้งหมด", exact: true })
        .click();
      await expect(header.locator("[data-nav-menu] a").first()).toBeVisible();
    }
    await expect(header).toHaveAttribute("data-nav-tone", "dark");
    await expect(header.locator(".nav-glass")).toHaveCSS("background-color", "rgb(0, 0, 0)");
    await expect(header).toHaveCSS("color", "rgb(207, 207, 207)");
    await page.screenshot({ path: test.info().outputPath(`light-menu-${width}.png`) });
    await page.keyboard.press("Escape");
    await expectTone(page, "dark");
    await beneathNav(page, "#product-experience");
    await expectTone(page, "dark");
    await page.screenshot({ path: test.info().outputPath(`dark-${width}.png`) });
    expect(errors).toEqual([]);
  });

  test(`internal light pages and client navigation update navigation tone at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/Indicator");
    await expectInteriorNavigation(page);
    await page.screenshot({ path: test.info().outputPath(`indicator-light-${width}.png`) });
    await page
      .locator("[data-products-header]:visible")
      .getByRole("link", { name: "SUNFORD หน้าแรก", exact: true })
      .click();
    await expect(page).toHaveURL(/\/$/);
    await expectTone(page, "dark");
    await page
      .locator("[data-hero-scene]")
      .getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" })
      .click();
    await expect(page).toHaveURL(/\/service\?section=contact$/);
    await expectInteriorNavigation(page);
    await page.goBack();
    await expect(page).toHaveURL(/\/$/);
    await expectTone(page, "dark");
  });
}

test("server-rendered navigation preserves the existing base palettes without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const page = await browser.newPage({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 1440, height: 900 },
  });
  await page.goto("/service?section=contact");
  await expect(page.locator("[data-products-header]")).toHaveCSS(
    "background-color",
    "rgba(250, 250, 252, 0.8)",
  );
  await page.goto("/");
  await expect(page.locator(".nav-glass")).toHaveCSS("background-color", "rgba(17, 17, 17, 0.5)");
  await page.close();
});
