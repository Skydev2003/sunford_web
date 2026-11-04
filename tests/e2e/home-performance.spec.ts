import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`the primary content is exposed within two seconds of the opening starting at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.addInitScript(() => {
      new MutationObserver(() => {
        const opening = document.querySelector<HTMLElement>("[data-brand-opening]");
        if (
          opening?.dataset.phase === "symbol" &&
          !performance.getEntriesByName("opening-start").length
        )
          performance.mark("opening-start");
      }).observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ["data-phase"],
      });
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => performance.getEntriesByName("opening-start").length > 0);
    const remaining = await page.evaluate(
      () => 2000 - (performance.now() - performance.getEntriesByName("opening-start")[0].startTime),
    );
    await expect(page.locator("[data-brand-opening]")).toBeHidden({
      timeout: Math.max(1, remaining),
    });
    await expect(page.locator("[data-hero-scene] h1")).toBeVisible();
    await expect(page.locator("[data-hero-scene] p")).toBeVisible();
  });
}

test("scrolling avoids duplicate Header measurements while updating its Hero backdrop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const header = page.locator(".site-header");
  await expect(page.locator("[data-brand-opening]")).toBeHidden();
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
