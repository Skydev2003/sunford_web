import { expect, test, type Page } from "@playwright/test";
import { expectStaggerMotion, recordStaggerMotion } from "./helpers/stagger-motion";

type IntroWindow = Window & { introAnimations: Animation[]; pauseIntro: boolean };

async function freezeIntro(page: Page) {
  await recordStaggerMotion(page);
  await page.addInitScript(() => {
    const state = window as unknown as IntroWindow;
    state.introAnimations = [];
    state.pauseIntro = true;
    const native = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = native.call(this, frames, options);
      if (typeof options === "object" && options.id === "sunford-stagger-bounce") {
        state.introAnimations.push(animation);
        if (state.pauseIntro) {
          animation.pause();
          animation.currentTime = 0;
        }
      }
      return animation;
    };
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
    const state = window as unknown as IntroWindow;
    for (const animation of state.introAnimations) animation.currentTime = value;
    state.pauseIntro = false;
  }, time);
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(null))));
}

for (const [id, count, label] of [
  ["scales", 8, "เครื่องชั่ง"],
  ["indicators", 3, "อินดิเคเตอร์แท่นชั่ง"],
  ["platforms", 4, "โครงสร้างแท่นชั่ง"],
  ["pos", 3, "ระบบ POS"],
  ["accessories", 5, "อุปกรณ์เสริม"],
] as const) {
  for (const width of [390, 1440]) {
    test(`${id} entrance uses shared finite bounce and preserves ribbon at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await freezeIntro(page);
      await page.goto(`/products/category/${id}`);
      const overview = page.locator(`[data-overview-category="${id}"]:visible`);
      const title = overview.locator("#products-title");
      const chapters = overview.locator("#products-chapters > li");
      const ribbon = overview.locator("main > div").first();
      await expect(chapters).toHaveCount(count);
      await expectStaggerMotion(title);
      await expectStaggerMotion(chapters.first());
      await expect(title).toHaveCSS("opacity", "0");
      await expect(title).toHaveCSS("scale", "0.8");
      await expect(ribbon).toHaveCSS("animation-duration", "3s");
      const delays = await chapters.evaluateAll((items) =>
        items.flatMap((item) =>
          item
            .getAnimations()
            .filter((a) => a.id === "sunford-stagger-bounce")
            .map((a) => Number(a.effect!.getTiming().delay)),
        ),
      );
      expect(delays.length).toBeGreaterThan(0);
      expect(delays).toEqual(delays.map((_, i) => 100 + i * 150));
      const properties = await title.evaluate((element) =>
        element
          .getAnimations()
          .filter((a) => a.id === "sunford-stagger-bounce")
          .map((a) => ({
            duration: a.effect!.getTiming().duration,
            iterations: a.effect!.getTiming().iterations,
            frames: (a.effect as KeyframeEffect).getKeyframes(),
          })),
      );
      expect(properties).toHaveLength(1);
      expect(properties[0].duration).toBe(800);
      expect(properties[0].iterations).toBe(1);
      expect(properties[0].frames.map((frame) => frame.translate)).toEqual(["0px 40px", "0px"]);
      expect(properties[0].frames.map((frame) => frame.scale)).toEqual(["0.8", "1"]);
      await expect(chapters.first().getByRole("button")).toBeEnabled();
      await chapters.first().getByRole("button").focus();
      await expect(chapters.first()).toHaveCSS("opacity", "1");
      await seekIntro(page, 3500);
      await expect(title).toHaveCSS("opacity", "1");
      await expect(ribbon).toHaveCSS("color", "rgb(29, 29, 31)");
      await expect(ribbon.getByRole("link")).toHaveCSS("color", "rgb(215, 25, 45)");
      expect(await ribbon.evaluate((el) => getComputedStyle(el, "::before").opacity)).toBe("0");
      await page.screenshot({ path: test.info().outputPath(`${id}-bounce-${width}.png`) });
      const before = await page.evaluate(
        () =>
          (window as unknown as IntroWindow).introAnimations.filter(
            (animation) => (animation.effect as KeyframeEffect).target?.id === "products-title",
          ).length,
      );
      await overview
        .getByRole("button", { name: `ดู${label}ทั้งหมด`, exact: true })
        .first()
        .click();
      const finder = page.getByRole("dialog", { name: `ดู${label}ทั้งหมด`, exact: true });
      await expect(finder).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(finder).not.toBeVisible();
      expect(
        await page.evaluate(
          () =>
            (window as unknown as IntroWindow).introAnimations.filter(
              (animation) => (animation.effect as KeyframeEffect).target?.id === "products-title",
            ).length,
        ),
      ).toBe(before);
      await page.reload();
      await expectStaggerMotion(title);
      await expect(title).toHaveCSS("opacity", "0");
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

test("Products directory uses shared bounce and preserves the existing ribbon highlight", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await freezeIntro(page);
  await page.goto("/products");
  await expectStaggerMotion(page.locator("#products-title"));
  await expect(page.locator("#products-title")).toHaveCSS("animation-name", "none");
  await expect(page.locator("main > div").first()).toHaveCSS("animation-duration", "3s");
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter(
            (animation) =>
              animation instanceof CSSAnimation &&
              animation.animationName.includes("categoryTitleReveal"),
          ).length,
    ),
  ).toBe(0);
});

test("normal-motion client entry and cached history keep controls usable", async ({ page }) => {
  await recordStaggerMotion(page);
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
    await expectStaggerMotion(overview.locator("#products-title"));
    await overview
      .getByRole("button", { name: `ดู${label}ทั้งหมด`, exact: true })
      .first()
      .click();
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
  ).not.toBeVisible();
  await page
    .locator('[data-overview-category="scales"]:visible')
    .getByRole("button", { name: "ดูเครื่องชั่งทั้งหมด", exact: true })
    .first()
    .click();
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
  ).not.toBeVisible();
  await page
    .locator('[data-overview-category="indicators"]:visible')
    .getByRole("button", { name: "ดูอินดิเคเตอร์แท่นชั่งทั้งหมด", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "ดูอินดิเคเตอร์แท่นชั่งทั้งหมด", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
  expect(errors).toEqual([]);
});
