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
    const hydrationErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat|server rendered HTML/i.test(message.text())) {
        hydrationErrors.push(message.text());
      }
    });
    await page.goto("/");
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-ready", "true");
    const header = page.locator(".site-header");
    const glass = header.locator(".nav-glass");
    await expect(header).toHaveAttribute("data-hero-backdrop-tracked", "");
    await expect(header).toHaveAttribute("data-hero-backdrop", "");
    await expect(header).toHaveCSS("position", "fixed");
    await expect(header).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(glass).toHaveCSS("background-color", "rgba(17, 17, 17, 0.5)");
    const title = (await page.locator("main h1").boundingBox())!;
    const partialScroll = title.y + title.height / 2 - 25;
    const scrollTo = (top: number) =>
      page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), top);
    await scrollTo(partialScroll);
    await expect(header).not.toHaveAttribute("data-hero-backdrop");
    await expect(glass).toHaveCSS("background-color", "rgba(17, 17, 17, 0.5)");
    await expect(glass).toHaveCSS("backdrop-filter", "blur(12px)");
    const search = header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true });
    expect(
      await search.evaluate((element) => {
        const r = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    ).toBe(true);
    const desktop = viewport.width >= 1024;
    const desktopMenu = header
      .locator(".desktop-nav")
      .getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true });
    const mobileToggle = header.getByRole("button", { name: "เปิดเมนู", exact: true });
    const panel = header.locator("#products-navigation-panel");
    const openMenu = async () => {
      if (desktop) {
        await desktopMenu.press("ArrowDown");
        await expect(desktopMenu).toHaveAttribute("aria-expanded", "true");
      } else {
        await mobileToggle.click();
        await expect(panel.locator("[data-nav-category-row]")).toHaveCount(8);
        await panel.getByLabel("เปิดเมนูย่อยผลิตภัณฑ์ทั้งหมด", { exact: true }).click();
      }
      await expect(panel).toBeVisible();
      await expect(glass).toHaveCSS("background-color", "rgb(0, 0, 0)");
    };
    await openMenu();
    if (desktop) {
      await expect(page.locator(".nav-backdrop")).toHaveCSS("backdrop-filter", "none");
      await expect(page.locator(".nav-backdrop")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(panel).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
    } else {
      await expect(panel).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await header.getByRole("button", { name: "ปิดเมนู", exact: true }).click();
      await expect(panel).toHaveCount(0);
    }
    await expect(glass).toHaveCSS("background-color", "rgba(17, 17, 17, 0.5)");
    await search.click();
    const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }).fill("G106094");
    await expect(
      dialog.locator('.search-results a[href="/products/warehouse-G106094"]'),
    ).toContainText("JC21");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(
      header.getByRole("link", { name: "ร้านค้า SUNFORD", exact: true }),
    ).toHaveAttribute("href", "https://sunfordshop.com/");
    await scrollTo(0);
    await expect(header).toHaveAttribute("data-hero-backdrop", "");
    await page.screenshot({ path: test.info().outputPath(`header-${viewport.width}.png`) });
    await scrollTo(partialScroll);
    await expect(header).not.toHaveAttribute("data-hero-backdrop");
    await openMenu();
    const pos = panel
      .locator('[data-nav-menu="/products"] [data-nav-column="primary"]')
      .getByRole("link", { name: "ระบบ POS", exact: true });
    await expect(pos).toHaveAttribute("href", "/products/category/pos#product-lineup-pos");
    await pos.click();
    await expect(page).toHaveURL(/\/products\/category\/pos#product-lineup-pos$/);
    await expect(header).not.toHaveAttribute("data-hero-backdrop-tracked");
    expect(hydrationErrors).toEqual([]);
  });
}
