import { expect, test } from "@playwright/test";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";

for (const width of [390, 1440]) {
  test(`solutions use shared finite bounce and retain ribbon at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await recordStaggerMotion(page);
    await page.addInitScript(() => {
      const native = Element.prototype.animate;
      Element.prototype.animate = function (frames, options) {
        const animation = native.call(this, frames, options);
        if (typeof options === "object" && options.id === "sunford-stagger-bounce") {
          animation.pause();
          animation.currentTime = 0;
        }
        return animation;
      };
    });
    await page.goto("/solutions");
    const title = page.locator("#solutions-title");
    const chapters = page.locator('nav[aria-label="สำรวจกลุ่มธุรกิจ"] li');
    await expect(chapters).toHaveCount(3);
    await expectStaggerMotion(title);
    await expect(title).toHaveCSS("opacity", "0");
    await expect(title).toHaveCSS("scale", "0.8");
    await expectStaggerMotion(chapters.first());
    const timings = await chapters.evaluateAll((items) =>
      items.flatMap((item) =>
        item
          .getAnimations()
          .filter((a) => a.id === "sunford-stagger-bounce")
          .map((a) => ({
            duration: a.effect!.getTiming().duration,
            delay: a.effect!.getTiming().delay,
            iterations: a.effect!.getTiming().iterations,
          })),
      ),
    );
    expect(timings.length).toBeGreaterThan(0);
    expect(timings).toEqual(
      timings.map((_, i) => ({ duration: 800, delay: 100 + i * 150, iterations: 1 })),
    );
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) animation.currentTime = 3500;
    });
    await expect(title).toHaveCSS("opacity", "1");
    const ribbon = page.locator("[data-solutions-overview] > div").first();
    await expect(ribbon).toHaveCSS("animation-duration", "3s");
    await expect(ribbon).toHaveCSS("color", "rgb(29, 29, 31)");
    await page.screenshot({ path: test.info().outputPath(`solutions-bounce-${width}.png`) });
  });
}

test("solutions reduced motion has no entrance animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/solutions");
  await expect(page.locator("#solutions-title")).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a instanceof CSSAnimation && a.animationName.includes("category")).length,
    ),
  ).toBe(0);
});

test("solutions server HTML keeps static motion fallback with scripting disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await page.goto("/solutions");
    await expect(page.locator("#solutions-title")).toHaveText("โซลูชันตามธุรกิจ");
    await expect(page.locator("#solutions-title")).toHaveCSS("animation-name", "none");
    await expect(page.locator("#solutions-title")).toHaveCSS("opacity", "1");
    await expect(page.locator('ul[aria-label="โซลูชันทั้งหมด"] > li')).toHaveCount(14);
    for (const chapter of await page.locator('nav[aria-label="สำรวจกลุ่มธุรกิจ"] li').all())
      await expect(chapter).toHaveCSS("opacity", "1");
  } finally {
    await context.close();
  }
});
