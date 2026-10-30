import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("scrolling keeps the sticky navigation clear of Hero text and foreground bubbles", async ({
  page,
}) => {
  test.setTimeout(60000);
  for (const viewport of [
    { width: 1900, height: 540 },
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    const header = page.locator(".site-header");
    const glass = header.locator(".nav-glass");
    const layer = page.locator(".hero-bubble-layer");
    await expect(header).toHaveAttribute("data-hero-backdrop", "");
    await expect(glass).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    const title = (await page.locator("h1.hero-model").boundingBox())!;
    await page.evaluate(
      (top) => scrollTo({ top, behavior: "instant" }),
      title.y + title.height / 2 - 25,
    );
    await expect(header).not.toHaveAttribute("data-hero-backdrop");
    await expect(glass).toHaveCSS("background-color", "rgb(247, 247, 249)");
    const headerBottom = await header
      .locator(".header-inner")
      .evaluate((e) => e.getBoundingClientRect().bottom);
    await expect(layer).toHaveCSS("clip-path", `inset(${headerBottom}px 0px 0px)`);
    expect((await page.locator("h1.hero-model").boundingBox())!.y).toBeLessThan(headerBottom);

    // Move a real bubble over a header control; the clipped portion must not receive input.
    const handle = layer.getByRole("button").first();
    const bubble = (await handle.boundingBox())!;
    const search = header.getByRole("button", { name: "ค้นหาสินค้า", exact: true });
    const searchBox = (await search.boundingBox())!;
    await page.mouse.move(bubble.x + bubble.width / 2, bubble.y + bubble.height / 2);
    await page.mouse.down();
    await page.mouse.move(searchBox.x + searchBox.width / 2, headerBottom / 2, { steps: 8 });
    await expect(layer.locator('[data-dragging="true"]')).toHaveCount(1);
    expect(
      await search.evaluate((element) => {
        const r = element.getBoundingClientRect();
        return element.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    ).toBe(true);
    await page.mouse.up();
    await page.screenshot({ path: test.info().outputPath(`header-scroll-${viewport.width}.png`) });
    if (viewport.width > 1100) {
      await header.locator(".desktop-nav a").first().hover();
      await expect(page.locator("#desktop-submenu")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(layer).toBeVisible();
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await expect(header).toHaveAttribute("data-hero-backdrop", "");
    await expect(glass).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(layer).toHaveCSS("clip-path", "none");
  }
});
