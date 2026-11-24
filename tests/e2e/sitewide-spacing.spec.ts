import { expect, test } from "@playwright/test";

const moduleClass = (name: string) =>
  `:is([class*="_${name}__"],[class$="_${name}"],[class*="_${name} "])`;

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 768, 1024, 1280, 1440, 1920]) {
  test(`quotation and builder use one page gutter at ${width}px`, async ({ page }) => {
    const gutter = width >= 1280 ? 48 : width >= 768 ? 32 : 20;
    const section = width >= 1280 ? 64 : width >= 768 ? 48 : 32;
    for (const route of ["/service/quotation", "/guides/indicator-platform-compatibility"]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const main = page.locator("main:visible");
      await expect(main).toBeVisible();
      const geometry = await main.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          left: parseFloat(style.paddingLeft),
          right: parseFloat(style.paddingRight),
          bottom: parseFloat(style.paddingBottom),
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      const expected = route.includes("compatibility")
        ? Math.max(gutter, (width - 1180) / 2)
        : gutter;
      expect(geometry.left, route).toBeCloseTo(expected, 0);
      expect(geometry.right, route).toBeCloseTo(expected, 0);
      expect(geometry.bottom, route).toBeCloseTo(section, 0);
      expect(geometry.overflow, route).toBe(false);
    }
  });
}

for (const width of [390, 768, 1440]) {
  test(`content sections share spacing and preserve the hero clearance at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const section = width >= 1280 ? 64 : width >= 768 ? 48 : 32;
    const feature = width >= 1280 ? 80 : width >= 768 ? 64 : 48;
    for (const [route, selector] of [
      ["/solutions", "#solutions-all"],
      ["/service?section=contact", `section${moduleClass("locations")}`],
      ["/about-us", `section${moduleClass("story")}`],
      ["/products/category/scales", '[data-overview-section="lineup"]'],
    ]) {
      await page.goto(route);
      const main = page.locator("main:visible");
      const region = main.locator(selector).first();
      await expect(region).toBeVisible();
      await expect(region).toHaveCSS("padding-top", `${section}px`);
      const banner = page.locator(".site-footer:visible .contact-inner");
      await expect(page.locator(".site-footer:visible .footer-main")).toHaveCSS(
        "padding-top",
        `${section}px`,
      );
      await expect(banner).toHaveCount(route === "/solutions" ? 1 : 0);
      if (route === "/solutions") {
        await expect(banner).toHaveCSS("padding-top", `${feature}px`);
      }
      if (route.includes("category")) {
        const priority = main.locator(moduleClass("priority"));
        await expect(priority).toHaveCSS("padding-bottom", "32px");
        const gutter = await main.evaluate((element) =>
          getComputedStyle(element).getPropertyValue("--overview-gutter"),
        );
        expect(gutter).toContain("6.25vw");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}
