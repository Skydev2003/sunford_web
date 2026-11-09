import { expect, test } from "@playwright/test";

test("section two follows the full-screen Hero and keeps its YouTube preview responsive", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator('[data-home-section="2"]');
  await expect(page.locator('[data-home-section="1"] + [data-home-section="2"]')).toHaveCount(1);
  await expect(section.locator("iframe")).toHaveCount(0);
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await section.scrollIntoViewIfNeeded();
    const preview = section.locator("button");
    const bounds = (await preview.boundingBox())!;
    expect(bounds.width / bounds.height).toBeCloseTo(16 / 9, 2);
    expect(bounds.x).toBeGreaterThanOrEqual(16);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 16);
    await expect
      .poll(() => preview.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth))
      .toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await section.getByRole("button", { name: /^เล่นวิดีโอ/ }).focus();
  await page.keyboard.press("Enter");
  await expect(section.locator("button")).toHaveCount(0);
  await expect(section.locator("iframe")).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/UF7QJSq4Qw4?autoplay=1&rel=0",
  );
  await expect(section.locator("iframe")).toHaveAttribute("allowfullscreen", "");
  await expect(section.getByRole("link", { name: "ดูบน YouTube" })).toHaveCount(0);
});

test("without JavaScript section two keeps its preview without the removed external link", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const section = page.locator('[data-home-section="2"]');
    await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
    await expect(section.getByRole("link", { name: "ดูบน YouTube" })).toHaveCount(0);
    await expect(section.locator("iframe")).toHaveCount(0);
  } finally {
    await context.close();
  }
});
