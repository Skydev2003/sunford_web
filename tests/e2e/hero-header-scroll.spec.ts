import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 720 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
]) {
  test(`homepage navigation remains usable above partial Hero scrolling at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-ready", "true");
    const header = page.locator(".site-header");
    await expect(header).toHaveAttribute("data-hero-backdrop", "");
    await expect(header).toHaveCSS("position", "fixed");
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(header.locator(".nav-glass")).toHaveCSS(
      "background-color",
      "rgba(17, 17, 17, 0.5)",
    );
    const title = (await page.locator("main h1").boundingBox())!;
    await page.evaluate(
      (top) => scrollTo({ top, behavior: "instant" }),
      title.y + title.height / 2 - 25,
    );
    await expect(header).not.toHaveAttribute("data-hero-backdrop");
    await expect(header.locator(".nav-glass")).toHaveCSS(
      "background-color",
      "rgba(17, 17, 17, 0.5)",
    );
    await expect(header.locator(".nav-glass")).toHaveCSS("backdrop-filter", "blur(12px)");
    const search = header.getByRole("button", { name: "ค้นหาสินค้า", exact: true });
    expect(
      await search.evaluate((element) => {
        const r = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    ).toBe(true);
    if (viewport.width >= 1400) {
      const menu = header.locator(".desktop-nav a").first();
      await menu.focus();
      await expect(menu).toHaveAttribute("aria-expanded", "true");
      await expect(header.locator("#desktop-submenu")).toBeVisible();
      await expect(page.locator(".nav-backdrop")).toHaveCSS("backdrop-filter", "none");
      await expect(page.locator(".nav-backdrop")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(header.locator("#desktop-submenu")).toHaveCSS(
        "background-color",
        "rgba(17, 17, 17, 0.97)",
      );
      await expect(header.locator("#desktop-submenu a:visible").first()).toHaveAttribute(
        "href",
        /\//,
      );
      await page.keyboard.press("Escape");
      await expect(header.locator("#desktop-submenu")).toBeHidden();
    } else {
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const mobile = header.getByRole("navigation", { name: "เมนูมือถือ" });
      await expect(mobile).toBeVisible();
      await expect(mobile).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(header.locator(".nav-glass")).toHaveCSS(
        "background-color",
        "rgba(17, 17, 17, 0.5)",
      );
      await expect(mobile.locator("summary")).toHaveCount(5);
      await mobile.locator("summary").first().click();
      expect(await mobile.getByRole("link").count()).toBeGreaterThan(7);
      await header.getByRole("button", { name: "ปิดเมนู", exact: true }).click();
      await expect(mobile).toHaveCount(0);
    }
    await search.click();
    const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }).fill("ACS");
    await expect(dialog.locator(".search-results a").first()).toContainText("ACS");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    const compare = header.getByRole("button", { name: "เปรียบเทียบสินค้า", exact: true });
    await compare.click();
    await expect(compare).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".compare-bar")).toBeVisible();
    await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
    await expect(compare).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator(".compare-bar")).toHaveCount(0);
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-hero-backdrop", "");
    await page.screenshot({ path: test.info().outputPath(`header-${viewport.width}.png`) });
  });
}
