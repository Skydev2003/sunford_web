import { expect, test, type Page } from "@playwright/test";

type IntroWindow = Window & { introAnimations: CSSAnimation[] };
const introName = "category";

async function freezeIntro(page: Page) {
  await page.addInitScript(() => {
    const state = window as unknown as IntroWindow;
    state.introAnimations = [];
    document.addEventListener("animationstart", () => {
      for (const animation of document.getAnimations()) {
        if (
          animation instanceof CSSAnimation &&
          animation.animationName.includes("category") &&
          !state.introAnimations.includes(animation)
        ) {
          state.introAnimations.push(animation);
          animation.pause();
          animation.currentTime = 0;
        }
      }
    });
  });
}

async function seekIntro(page: Page, time: number) {
  await page.evaluate((value) => {
    for (const animation of (window as unknown as IntroWindow).introAnimations)
      animation.currentTime = value;
  }, time);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
}

for (const [id, count, label] of [
  ["scales", 8, "เครื่องชั่ง"],
  ["indicators", 3, "อินดิเคเตอร์แท่นชั่ง"],
] as const) {
  for (const width of [390, 1440]) {
    test(`${id} entrance is finite, staggered and stable at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await freezeIntro(page);
      await page.goto(`/products/category/${id}`);
      await page.waitForFunction(
        (expected) => (window as unknown as IntroWindow).introAnimations.length === expected,
        count + 5,
      );
      const overview = page.locator(`[data-overview-category="${id}"]:visible`);
      const title = overview.locator("#products-title");
      const chapters = overview.locator("#products-chapters > li");
      const ribbon = overview.locator("main > div").first();
      await expect(title).toHaveCSS("animation-duration", "0.8s");
      await expect(ribbon).toHaveCSS("animation-duration", "3s");
      const delay = await chapters.evaluateAll((elements) =>
        elements.map((element) => parseFloat(getComputedStyle(element).animationDelay)),
      );
      expect(delay).toEqual(Array.from({ length: count }, (_, i) => (180 + i * 140) / 1000));
      await expect(chapters.first()).toHaveCSS(
        "animation-timing-function",
        "cubic-bezier(0.4, 0, 0.2, 1)",
      );
      const properties = await page.evaluate(() =>
        (window as unknown as IntroWindow).introAnimations.map((animation) => ({
          duration: animation.effect!.getTiming().duration,
          iterations: animation.effect!.getTiming().iterations,
          properties: (animation.effect as KeyframeEffect)
            .getKeyframes()
            .flatMap((frame) => Object.keys(frame)),
        })),
      );
      for (const animation of properties) {
        expect(animation.iterations).toBe(1);
        expect(Number(animation.duration)).toBeLessThanOrEqual(3000);
        expect(
          animation.properties.every((key) =>
            ["opacity", "color", "offset", "computedOffset", "easing", "composite"].includes(key),
          ),
        ).toBe(true);
      }
      await seekIntro(page, 0);
      await expect(title).toHaveCSS("opacity", "0.15");
      await expect(chapters.first()).toHaveCSS("opacity", "0");
      expect(await ribbon.evaluate((el) => getComputedStyle(el, "::before").backgroundColor)).toBe(
        "rgb(215, 25, 45)",
      );
      await expect(ribbon).toHaveCSS("color", "rgb(255, 255, 255)");
      await expect(chapters.first().getByRole("button")).toBeEnabled();
      await chapters.first().getByRole("button").focus();
      await expect(chapters.first()).toHaveCSS("opacity", "1");
      await title.evaluate((el) => (el as HTMLElement).focus());
      await page.locator("[data-products-header]:visible a").first().focus();
      await seekIntro(page, 800);
      await expect(title).toHaveCSS("opacity", "1");
      const opacity = await chapters.evaluateAll((elements) =>
        elements.map((el) => Number(getComputedStyle(el).opacity)),
      );
      expect(opacity[0]).toBeGreaterThan(opacity[count - 1]);
      await page.screenshot({ path: test.info().outputPath(`${id}-stagger-${width}.png`) });
      await seekIntro(page, 3500);
      for (const chapter of await chapters.all()) await expect(chapter).toHaveCSS("opacity", "1");
      await expect(ribbon).toHaveCSS("color", "rgb(29, 29, 31)");
      await expect(ribbon.getByRole("link")).toHaveCSS("color", "rgb(215, 25, 45)");
      expect(await ribbon.evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("0");
      await page.screenshot({ path: test.info().outputPath(`${id}-settled-${width}.png`) });
      await chapters.first().getByRole("button").click();
      const finder = page.getByRole("dialog", { name: `ดู${label}ทั้งหมด`, exact: true });
      await expect(finder).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(finder).not.toBeVisible();
      expect(
        await page.evaluate(() => (window as unknown as IntroWindow).introAnimations.length),
      ).toBe(count + 5);
      await expect(title).toHaveCSS("opacity", "1");
      await page.reload();
      await page.waitForFunction(
        (expected) => (window as unknown as IntroWindow).introAnimations.length === expected,
        count + 5,
      );
      await seekIntro(page, 0);
      await expect(title).toHaveCSS("opacity", "0.15");
      await expect(finder).not.toBeVisible();
    });
  }

  test(`${id} reduced motion displays content without entrance animations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/products/category/${id}`);
    await expect(page.locator("#products-title")).toHaveCSS("opacity", "1");
    for (const chapter of await page.locator("#products-chapters > li").all())
      await expect(chapter).toHaveCSS("opacity", "1");
    expect(
      await page.evaluate(
        () =>
          document
            .getAnimations()
            .filter(
              (animation) =>
                animation instanceof CSSAnimation && animation.animationName.includes("category"),
            ).length,
      ),
    ).toBe(0);
  });

  test(`${id} displays static content without page JavaScript`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(`${baseURL}/products/category/${id}`);
    await expect(page.locator("#products-title")).toHaveText(label);
    await expect(page.locator("#products-title")).toHaveCSS("animation-name", "none");
    await expect(page.locator("#products-title")).toHaveCSS("opacity", "1");
    for (const chapter of await page.locator("#products-chapters > li").all())
      await expect(chapter).toHaveCSS("opacity", "1");
    await context.close();
  });
}

test("original Products has no category entrance motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products");
  await expect(page.locator("#products-title")).toHaveCSS("animation-name", "none");
  expect(
    await page.evaluate(
      (name) =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation instanceof CSSAnimation && animation.animationName.includes(name),
          ).length,
      introName,
    ),
  ).toBe(0);
});

test("normal-motion client entry and cached history keep controls usable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/contact-us");
  for (const [id, label] of [
    ["scales", "เครื่องชั่ง"],
    ["indicators", "อินดิเคเตอร์แท่นชั่ง"],
  ]) {
    await page
      .locator("[data-products-header]:visible")
      .getByRole("link", { name: label, exact: true })
      .click();
    await page.mouse.move(1400, 800);
    const overview = page.locator(`[data-overview-category="${id}"]:visible`);
    await expect(overview.locator("#products-title")).toHaveCSS(
      "animation-name",
      /categoryTitleReveal/,
    );
    await overview.locator("#products-chapters button").first().click();
    const finder = page.getByRole("dialog", { name: `ดู${label}ทั้งหมด`, exact: true });
    await expect(finder).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(finder).not.toBeVisible();
  }
  await page.goBack();
  await expect(page.locator('[data-overview-category="scales"]:visible #products-title')).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(
    page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goForward();
  await expect(
    page.locator('[data-overview-category="indicators"]:visible #products-title'),
  ).toHaveCSS("opacity", "1");
  await expect(
    page.getByRole("dialog", { name: "ดูอินดิเคเตอร์แท่นชั่งทั้งหมด", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  expect(errors).toEqual([]);
});
