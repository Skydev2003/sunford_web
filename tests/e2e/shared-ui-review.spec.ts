import { expect, test } from "@playwright/test";
import { footerNavigation, footerLegalLinks } from "../../src/features/site/data/footer-navigation";
import { productSubcategoryPages } from "../../src/features/catalog/data/product-subcategory-pages";
import { buyingGuides } from "../../src/features/content/data/buying-guides";

test("product tooltip stays closed after Back and Forward", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: /ค้นหาสินค้า/ }).click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await search.getByRole("textbox").fill("FEH5KS");
  const product = search.locator(".search-results a").first();
  const href = (await product.getAttribute("href"))!;
  await product.click();
  await expect(page).toHaveURL(href);
  await page.getByRole("button", { name: "ค่าละเอียดคืออะไร", exact: true }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("tooltip")).toBeHidden();
  await page.goForward();
  await expect(page).toHaveURL(href);
  await expect(page.getByRole("tooltip")).toBeHidden();
});

test("quotation back-to-top keeps keyboard focus on the visible main", async ({ page }) => {
  await page.setViewportSize({ width: 834, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto("/service/quotation");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.getByRole("link", { name: /กลับด้านบน/ }).click();
    const state = await page.evaluate(() => ({
      active: document.activeElement?.outerHTML.slice(0, 250),
      mains: [...document.querySelectorAll("main")].map((el) => ({
        tab: el.tabIndex,
        inert: el.inert,
        connected: el.isConnected,
      })),
      dialogs: [...document.querySelectorAll("dialog[open]")].map((el) =>
        el.getAttribute("aria-label"),
      ),
    }));
    await test
      .info()
      .attach(`focus-${attempt}`, { body: JSON.stringify(state), contentType: "application/json" });
    await expect(page.locator("#main-content:visible")).toBeFocused();
  }
});

for (const width of [320, 390, 834, 1440]) {
  test(`shared Footer groups, controls and reflow at ${width}px`, async ({ page }) => {
    test.setTimeout(150000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const { products } = await (await page.request.get("/api/products")).json();
    const families = ["scales", "indicators", "platforms", "pos", "accessories"];
    const subgroups = families.map(
      (family) =>
        productSubcategoryPages.find((entry) =>
          entry.href.startsWith(`/products/category/${family}/`),
        )!.href,
    );
    const paths = [
      ...new Set([
        "/",
        "/products",
        "/products/category/scales",
        "/products/category/indicators/lcd",
        "/explore",
        "/service/quotation",
        "/not-a-sunford-page",
        ...families.map((family) => `/products/category/${family}`),
        ...subgroups,
        "/products/category/scales/industrial",
        `/products/${products[0].slug}`,
        `/guides/${buyingGuides[0].slug}`,
        "/guides/indicator-platform-compatibility",
        "/software/download",
        "/service",
        "/contact-us",
        "/about-us",
        "/solutions",
      ]),
    ];
    for (const path of paths) {
      await page.goto(path);
      const footer = page.locator("footer:visible");
      await expect(footer).toHaveCount(1);
      await footer.scrollIntoViewIfNeeded();
      await expect(
        footer.locator('.footer-coverage, img[src*="thailand.svg"], [aria-label*="แผนที่ลูกค้า"]'),
      ).toHaveCount(0);
      for (const group of footerNavigation) {
        if (width <= 600) {
          const summary = footer.getByText(group.label, { exact: true }).filter({ visible: true });
          await summary.click();
        }
        const nav = footer.getByRole("navigation", { name: group.label, exact: true });
        await expect(nav).toBeVisible();
        if (width <= 600) {
          const summary = footer.getByText(group.label, { exact: true }).filter({ visible: true });
          await summary.focus();
          await summary.press("Space");
          await expect(summary.locator("..")).toHaveJSProperty("open", false);
          await summary.press("Enter");
          await expect(nav).toBeVisible();
          expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        }
        expect(
          await nav
            .locator("a")
            .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
        ).toEqual(group.links.map((link) => link.href));
      }
      for (const link of footerLegalLinks)
        await expect(footer.getByRole("link", { name: link.label, exact: true })).toHaveAttribute(
          "href",
          link.href,
        );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth),
      ).toBeLessThanOrEqual(1);
      const contrast = await footer
        .locator(".footer-legal a")
        .first()
        .evaluate((link) => {
          const luminance = (rgb: number[]) =>
            rgb.slice(0, 3).reduce((sum, value, index) => {
              const c = value / 255;
              return (
                sum +
                [0.2126, 0.7152, 0.0722][index] *
                  (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
              );
            }, 0);
          const fg = luminance(
            getComputedStyle(link)
              .color.match(/[\d.]+/g)!
              .map(Number),
          );
          const bar = getComputedStyle(link.closest(".footer-bottom-bar")!);
          const colors =
            bar.backgroundImage === "none"
              ? [bar.backgroundColor]
              : bar.backgroundImage.match(/rgba?\([^)]+\)/g)!;
          return Math.min(
            ...colors.map((color) => {
              const bg = luminance(color.match(/[\d.]+/g)!.map(Number));
              return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
            }),
          );
        });
      expect(contrast).toBeGreaterThanOrEqual(4.5);
      if (path === "/" || path === "/products")
        await footer.screenshot({
          path: test.info().outputPath(`footer-${path === "/" ? "home" : "products"}-${width}.png`),
        });
      const url = page.url();
      await footer.getByRole("link", { name: /กลับด้านบน/ }).click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      expect(page.url()).toBe(url);
      await expect(page.locator("#main-content:visible")).toBeFocused();
    }
  });
}
