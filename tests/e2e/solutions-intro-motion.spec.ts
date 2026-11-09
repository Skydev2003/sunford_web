import { expect, test, type Page } from "@playwright/test";

type MotionWindow = Window & { solutionAnimations: CSSAnimation[] };

async function seek(page: Page, time: number) {
  await page.evaluate((time) => {
    for (const animation of (window as unknown as MotionWindow).solutionAnimations)
      animation.currentTime = time;
  }, time);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
}

for (const width of [390, 1440]) {
  test(`solutions reuse the latest finite entrance and stagger at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      const state = window as unknown as MotionWindow;
      state.solutionAnimations = [];
      document.addEventListener("animationstart", () => {
        for (const animation of document.getAnimations()) {
          if (
            animation instanceof CSSAnimation &&
            animation.animationName.includes("category") &&
            !state.solutionAnimations.includes(animation)
          ) {
            state.solutionAnimations.push(animation);
            animation.pause();
            animation.currentTime = 0;
          }
        }
      });
    });
    await page.goto("/solutions");
    const title = page.locator("#solutions-title");
    await expect(title).toHaveCSS("opacity", "0.15");
    const chapters = page.locator('nav[aria-label="สำรวจกลุ่มธุรกิจ"] li');
    await expect(chapters).toHaveCount(3);
    const timings = await chapters.evaluateAll((items) =>
      items.map((item) => {
        const style = getComputedStyle(item);
        return {
          duration: style.animationDuration,
          delay: style.animationDelay,
          easing: style.animationTimingFunction,
          iterations: style.animationIterationCount,
        };
      }),
    );
    expect(timings).toEqual(
      [0.18, 0.32, 0.46].map((delay) => ({
        duration: "0.8s",
        delay: `${delay}s`,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        iterations: "1",
      })),
    );
    await seek(page, 300);
    expect(
      Number(await chapters.first().evaluate((el) => getComputedStyle(el).opacity)),
    ).toBeGreaterThan(0);
    await expect(chapters.last()).toHaveCSS("opacity", "0");
    await seek(page, 3400);
    await expect(title).toHaveCSS("opacity", "1");
    for (const chapter of await chapters.all()) await expect(chapter).toHaveCSS("opacity", "1");
    const ribbon = page.locator("[data-solutions-overview] > div").first();
    await expect(ribbon).toHaveCSS("animation-duration", "3s");
    await expect(ribbon).toHaveCSS("color", "rgb(29, 29, 31)");
    await page.screenshot({ path: test.info().outputPath(`solutions-motion-${width}.png`) });
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
