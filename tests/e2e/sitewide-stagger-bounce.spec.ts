import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  activeStaggerCount,
  expectStaggerMotion,
  recordStaggerMotion,
  staggerCount,
  type StaggerWindow,
} from "./helpers/stagger-motion";

async function freeze(page: Page) {
  await recordStaggerMotion(page, true);
}

const staticRegions = '[data-overview-section="index"], [data-products-footer], .site-footer';

async function expectStaticRegion(region: Locator) {
  await region.scrollIntoViewIfNeeded();
  await region
    .page()
    .evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
  expect(
    await region.evaluate(
      (element) =>
        (window as unknown as StaggerWindow).staggerAnimations.filter((animation) =>
          element.contains((animation.effect as KeyframeEffect).target),
        ).length,
    ),
  ).toBe(0);
  expect(
    await region.evaluate(
      (element) =>
        element
          .getAnimations({ subtree: true })
          .filter((animation) => animation.id === "sunford-stagger-bounce").length,
    ),
  ).toBe(0);
}

const templates = [
  "/products",
  "/products/category/scales",
  "/products/category/scales/benchtop",
  "/products/category/indicators/lcd",
  "/products/category/platforms/abs",
  "/products/category/pos/ios",
  "/products/category/pos/android",
  "/products/category/pos/windows",
  "/products/acs30-jc21",
  "/solutions",
  "/solutions/rs232",
  "/software/download",
  "/software/download/sunford-drv",
  "/blogs/editorial",
  "/guides/scales",
  "/about-us",
  "/contact-us",
  "/service",
  "/explore",
];

for (const width of [320, 390, 768, 834, 1440]) {
  test(`only opening content rises and later regions stay static at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 1000 });
    await recordStaggerMotion(page);
    for (const route of templates) {
      await page.goto(route);
      await expect(page.locator('[data-stagger-bounce-root="enabled"]')).toHaveCount(1);
      const main = page.locator("main:visible").first();
      const sections = main.locator("section:visible");
      const lateSectionIndexes = await sections.evaluateAll(
        (items, excluded) =>
          items.flatMap((section, index) => {
            if (
              section.closest(excluded) ||
              (!section.textContent?.trim() && !section.querySelector("img, video"))
            )
              return [];
            const bounds = section.getBoundingClientRect();
            return bounds.bottom <= 0 || bounds.top >= innerHeight ? [index] : [];
          }),
        staticRegions,
      );
      const audit = await main.evaluate((element) => {
        const visible = (item: HTMLElement) =>
          item.getClientRects().length > 0 &&
          !item.closest('[hidden], [inert], [aria-hidden="true"], dialog, [role="dialog"]');
        const targets = Array.from(
          new Set(
            (window as unknown as StaggerWindow).staggerAnimations
              .map((animation) => (animation.effect as KeyframeEffect).target as HTMLElement)
              .filter((target) => element.contains(target)),
          ),
        );
        return {
          outsideOpeningViewport: targets.filter((target) => {
            const bounds = target.getBoundingClientRect();
            return bounds.bottom <= -17 || bounds.top >= innerHeight + 17;
          }).length,
          nested: targets.filter((target) =>
            targets.some((ancestor) => ancestor !== target && ancestor.contains(target)),
          ).length,
          background: Array.from(element.querySelectorAll<HTMLElement>("section"))
            .filter(visible)
            .every((section) => getComputedStyle(section).translate === "none"),
        };
      });
      expect(audit.outsideOpeningViewport, route).toBe(0);
      expect(audit.nested, route).toBe(0);
      expect(audit.background, route).toBe(true);
      for (const index of lateSectionIndexes) {
        const section = sections.nth(index);
        await section.scrollIntoViewIfNeeded();
        await page.evaluate(
          () =>
            new Promise<void>((resolve) =>
              requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
            ),
        );
        expect(
          await section.evaluate(
            (element) =>
              (window as unknown as StaggerWindow).staggerAnimations.filter((animation) =>
                element.contains((animation.effect as KeyframeEffect).target),
              ).length,
          ),
          route,
        ).toBe(0);
        expect(
          await section.evaluate(
            (element) =>
              element
                .getAnimations({ subtree: true })
                .filter((animation) => animation.id === "sunford-stagger-bounce").length,
          ),
          route,
        ).toBe(0);
      }
      for (const region of await page.locator(`:is(${staticRegions}):visible`).all())
        await expectStaticRegion(region);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        route,
      ).toBe(true);
    }
  });
}

for (const width of [390, 1440]) {
  test(`all category indexes and Footers stay static with usable controls at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 1000 });
    await recordStaggerMotion(page);
    for (const id of ["scales", "indicators", "platforms", "pos", "accessories"]) {
      await page.goto(`/products/category/${id}`);
      await expect(page.locator(`[data-overview-category="${id}"]`)).toHaveAttribute(
        "data-controls-ready",
        "true",
      );
      await expect(page.locator("#products-title")).toBeVisible();
      const index = page.locator('[data-overview-section="index"]');
      const footer = page.locator("[data-products-footer]");
      await expectStaticRegion(index);
      await expect(index.locator("h2")).toHaveCSS("opacity", "1");
      await expect(index.locator("h2")).toHaveCSS("translate", "none");
      await expect(index.locator("h2")).toHaveCSS("scale", "none");
      await expectStaticRegion(footer);
      await expect(footer.locator("p").first()).toHaveCSS("opacity", "1");
      const summary = footer.locator("details summary").first();
      if (await summary.isVisible()) {
        await summary.click();
        await expect(summary.locator("..")).toHaveAttribute("open", "");
        await summary.click();
      }
      await index.getByRole("button").first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible();
      await expectStaticRegion(index);
      await expectStaticRegion(footer);
      if (id === "scales") {
        await index.scrollIntoViewIfNeeded();
        await page.screenshot({ path: test.info().outputPath(`static-final-index-${width}.png`) });
      }
    }
  });
}

test("initial viewport entrance rises once without scale or overshoot", async ({ page }) => {
  await freeze(page);
  await page.goto("/about-us");
  const title = page.locator("main h1");
  await expectStaggerMotion(title);
  const animation = await title.evaluate((element) => {
    const a = element.getAnimations().find((item) => item.id === "sunford-stagger-bounce")!;
    const timing = a.effect!.getTiming();
    return {
      duration: timing.duration,
      iterations: timing.iterations,
      delay: timing.delay,
      easing: timing.easing,
      offsets: (a.effect as KeyframeEffect).getKeyframes().map((frame) => frame.computedOffset),
    };
  });
  expect(animation).toEqual({
    duration: 650,
    iterations: 1,
    delay: 80,
    easing: "ease-out",
    offsets: [0, 1],
  });
  const samples: { opacity: number; translate: number; scale: string }[] = [];
  for (const time of [0, 80, 160, 240, 320, 400, 500, 600, 650]) {
    samples.push(
      await title.evaluate(async (element, value) => {
        const a = element.getAnimations().find((item) => item.id === "sunford-stagger-bounce")!;
        a.currentTime = value + Number(a.effect!.getTiming().delay);
        await new Promise(requestAnimationFrame);
        const style = getComputedStyle(element);
        return {
          opacity: Number(style.opacity),
          translate: parseFloat(style.translate.split(" ")[1] ?? "0"),
          scale: style.scale,
        };
      }, time),
    );
  }
  expect(samples[0]).toEqual({ opacity: 0.65, translate: 16, scale: "none" });
  expect(samples.every((sample) => sample.translate >= 0 && sample.translate <= 16)).toBe(true);
  expect(
    samples.every((sample, index) => !index || sample.translate <= samples[index - 1].translate),
  ).toBe(true);
  expect(samples.every((sample) => sample.scale === "none")).toBe(true);
  expect(samples.at(-1)).toEqual({ opacity: 1, translate: 0, scale: "none" });
  await expect(title).toHaveCSS("opacity", "1");
  await expect(page.locator("main")).toHaveCSS("translate", "none");
  await expect(page.locator("main")).toHaveCSS("scale", "none");
  await page.screenshot({ path: test.info().outputPath("about-settled.png") });
});

test("three opening chapters use the light one-way stagger profile", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await freeze(page);
  await page.goto("/solutions");
  const chapters = page.locator('nav[aria-label="สำรวจกลุ่มธุรกิจ"] li');
  await expect(chapters).toHaveCount(3);
  for (const chapter of await chapters.all()) await expectStaggerMotion(chapter);
  const profiles = await chapters.evaluateAll((items) =>
    items.map((item) => {
      const animation = item
        .getAnimations()
        .find((candidate) => candidate.id === "sunford-stagger-bounce")!;
      const timing = animation.effect!.getTiming();
      const frames = (animation.effect as KeyframeEffect).getKeyframes();
      return {
        duration: timing.duration,
        delay: timing.delay,
        easing: timing.easing,
        opacity: frames.map((frame) => frame.opacity),
        translate: frames.map((frame) => frame.translate),
        scale: frames.map((frame) => frame.scale ?? null),
      };
    }),
  );
  expect(profiles).toEqual(
    profiles.map((_, index) => ({
      duration: 650,
      delay: index * 80,
      easing: "ease-out",
      opacity: ["0.65", "1"],
      translate: ["0px 16px", "0px"],
      scale: [null, null],
    })),
  );
  await page.evaluate(() => {
    for (const animation of document.getAnimations()) animation.currentTime = 240;
  });
  await chapters
    .first()
    .locator("..")
    .screenshot({ path: test.info().outputPath("three-chapter-rise.png") });
});

test("offscreen content stays static when scrolled into view", async ({ page }) => {
  await freeze(page);
  await page.goto("/about-us");
  await expectStaggerMotion(page.locator("main h1"));
  const target = page.locator("main #about-next-heading");
  await expect(target).not.toBeInViewport();
  expect(await staggerCount(target)).toBe(0);
  await expect(target).toHaveCSS("opacity", "1");
  await expect(target).toHaveCSS("translate", "none");
  await expect(target).toHaveCSS("scale", "none");
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeInViewport();
  expect(await staggerCount(target)).toBe(0);
  expect(await activeStaggerCount(target)).toBe(0);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(target).not.toBeInViewport();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeInViewport();
  expect(await staggerCount(target)).toBe(0);
});

test("live reduced motion and keyboard focus cancel active reveals without inline styles", async ({
  page,
}) => {
  await freeze(page);
  await page.goto("/about-us");
  const title = page.locator("main h1");
  await expectStaggerMotion(title);
  const link = page.locator('main a[href="#our-story"]');
  await expectStaggerMotion(link);
  await link.focus();
  await expect.poll(() => activeStaggerCount(link)).toBe(0);
  await expect(link).toHaveCSS("translate", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => activeStaggerCount(title)).toBe(0);
  await expect(title).toHaveCSS("translate", "none");
  await expect(title).toHaveCSS("opacity", "1");
  expect(
    await page.evaluate(
      () => document.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length,
    ),
  ).toBe(0);
  await expect(title).not.toHaveAttribute("style");
});

test("all homepage sections and shared Footer stay excluded through cached history", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await freeze(page);
  await page.goto("/");
  await expect(page.locator("[data-hero-scene]")).toBeVisible();
  await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as StaggerWindow).staggerAnimations.length),
  ).toBe(0);
  await page.locator('main a[href="/about-us"]').first().click();
  await expect(page).toHaveURL(/\/about-us$/);
  await expectStaggerMotion(page.locator("main:visible h1"));
  await page.locator('main:visible nav a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length,
    ),
  ).toBe(0);
  await page.goBack();
  await expect(page.locator('[data-stagger-bounce-root="enabled"]')).toHaveCount(1);
  await expect.poll(() => activeStaggerCount(page.locator("main:visible h1"))).toBe(1);
  await page.goForward();
  await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
  await expect(page.locator(".site-header:visible")).toHaveCount(1);
  await expect(page.locator("footer:visible")).toHaveCount(1);
  expect(errors).toEqual([]);
});

test("fresh reduced-motion and unsupported-animation visits retain static readable content", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/about-us");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("main h1")).toHaveCSS("translate", "none");
  expect(
    await page.evaluate(
      () => document.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length,
    ),
  ).toBe(0);
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "animate", { value: undefined, configurable: true });
  });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.reload();
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
});

test("server HTML adds no motion hiding when JavaScript is disabled", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  try {
    const page = await context.newPage();
    await page.goto("/about-us");
    await expect(page.locator("main h1")).toHaveText("แม่นยำในทุกน้ำหนักใส่ใจในทุกการบริการ");
    await expect(page.locator("main h1")).toHaveCSS("opacity", "1");
    await expect(page.locator("main h1")).toHaveCSS("translate", "none");
    await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("new and restored directory cards stay static after the opening scan", async ({ page }) => {
  await recordStaggerMotion(page);
  await page.goto("/explore");
  await expectStaggerMotion(page.locator("main h1"));
  const openingCount = await page.evaluate(
    () => (window as unknown as StaggerWindow).staggerAnimations.length,
  );
  const first = page.locator(".directory-card").first();
  const original = await first.getAttribute("href");
  const more = page.getByRole("button", { name: /^ดูทั้งหมด \d+ รายการ$/ });
  await more.click();
  await expect(first).toHaveAttribute("href", original!);
  const extra = page.locator(".directory-card").nth(24);
  await expect(extra).toBeAttached();
  await extra.scrollIntoViewIfNeeded();
  expect(await staggerCount(extra)).toBe(0);
  expect(await activeStaggerCount(extra)).toBe(0);
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("ไม่มีข้อมูลตามข้อความนี้");
  await expect(page.locator(".directory-card")).toHaveCount(0);
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("");
  await expect(page.locator(".directory-card")).toHaveCount(24);
  const restored = page.locator(".directory-card").first();
  await restored.scrollIntoViewIfNeeded();
  expect(await activeStaggerCount(restored)).toBe(0);
  expect(
    await page.evaluate(() => (window as unknown as StaggerWindow).staggerAnimations.length),
  ).toBe(openingCount);
});
