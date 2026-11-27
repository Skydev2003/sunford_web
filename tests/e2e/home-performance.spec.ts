import { expect, test } from "@playwright/test";

test("scrolling avoids duplicate Header measurements while updating its Hero backdrop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  await page.evaluate(() => document.fonts.ready);
  await expect(header).toHaveAttribute("data-hero-backdrop", "");
  const height = await page
    .locator("[data-hero-scene]")
    .evaluate((element) => (element as HTMLElement).style.getPropertyValue("--hero-header-height"));
  await page.evaluate(() => {
    const measure = Element.prototype.getBoundingClientRect;
    Object.assign(window, { __scrollHeaderReads: 0, __scrollHeaderStacks: [] });
    Element.prototype.getBoundingClientRect = function () {
      if (this.matches(".header-inner")) {
        const report = window as unknown as {
          __scrollHeaderReads: number;
          __scrollHeaderStacks: string[];
        };
        report.__scrollHeaderReads++;
        report.__scrollHeaderStacks.push(new Error().stack ?? "unknown");
      }
      return measure.call(this);
    };
  });
  await page.mouse.wheel(0, 180);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
  await expect(header).not.toHaveAttribute("data-hero-backdrop", "");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-hero-backdrop", "");
  await test.info().attach("header-read-stacks.json", {
    body: JSON.stringify(
      await page.evaluate(
        () => (window as unknown as { __scrollHeaderStacks: string[] }).__scrollHeaderStacks,
      ),
    ),
    contentType: "application/json",
  });
  // Header surface sampling still needs one measurement for each scroll direction.
  expect(
    await page.evaluate(
      () => (window as unknown as { __scrollHeaderReads: number }).__scrollHeaderReads,
    ),
  ).toBeLessThanOrEqual(2);
  expect(
    await page
      .locator("[data-hero-scene]")
      .evaluate((element) =>
        (element as HTMLElement).style.getPropertyValue("--hero-header-height"),
      ),
  ).toBe(height);
});
