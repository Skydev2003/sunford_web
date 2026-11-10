import { expect, test, type Locator, type Page } from "@playwright/test";
import { writeFile } from "node:fs/promises";
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
  test(`content sections reveal and final regions stay static at ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 1000 });
    await recordStaggerMotion(page);
    for (const route of templates) {
      await page.goto(route);
      await expect(page.locator('[data-stagger-bounce-root="enabled"]')).toHaveCount(1);
      const main = page.locator("main:visible").first();
      await expectStaggerMotion(main.locator("h1").first());
      for (const section of await main.locator("section:visible").all()) {
        if (
          await section.evaluate((item, excluded) => Boolean(item.closest(excluded)), staticRegions)
        )
          continue;
        const content = await section.evaluate(
          (item) => item.textContent?.trim() || item.querySelector("img, video"),
        );
        if (!content) continue;
        await section.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            section.evaluate((item) =>
              (window as unknown as StaggerWindow).staggerAnimations.some((animation) =>
                item.contains((animation.effect as KeyframeEffect).target),
              ),
            ),
          )
          .toBe(true);
      }
      const audit = await main.evaluate((element, excluded) => {
        const visible = (item: HTMLElement) =>
          item.getClientRects().length > 0 &&
          !item.closest('[hidden], [inert], [aria-hidden="true"], dialog, [role="dialog"]');
        const sections = Array.from(element.querySelectorAll<HTMLElement>("section"))
          .filter(visible)
          .filter((section) => !section.closest(excluded))
          .filter((section) => section.innerText.trim() || section.querySelector("img, video"));
        const targets = Array.from(
          new Set(
            (window as unknown as StaggerWindow).staggerAnimations
              .map((animation) => (animation.effect as KeyframeEffect).target as HTMLElement)
              .filter((target) => element.contains(target)),
          ),
        );
        return {
          missing: sections
            .filter((section) => !targets.some((target) => section.contains(target)))
            .map(
              (section) => section.id || section.getAttribute("aria-label") || section.className,
            ),
          nested: targets.filter((target) =>
            targets.some((ancestor) => ancestor !== target && ancestor.contains(target)),
          ).length,
          background: sections.every((section) => getComputedStyle(section).translate === "none"),
        };
      }, staticRegions);
      expect(audit.missing, route).toEqual([]);
      expect(audit.nested, route).toBe(0);
      expect(audit.background, route).toBe(true);
      for (const footer of await page.locator("footer:visible").all()) {
        if (
          await footer.evaluate((item, excluded) => Boolean(item.closest(excluded)), staticRegions)
        )
          continue;
        await footer.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            footer.evaluate((element) =>
              (window as unknown as StaggerWindow).staggerAnimations.some((animation) =>
                element.contains((animation.effect as KeyframeEffect).target),
              ),
            ),
          )
          .toBe(true);
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
      await expectStaggerMotion(page.locator("#products-title"));
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

test("native keyframes visibly overshoot, stagger, settle and leave the section fixed", async ({
  page,
}) => {
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
    duration: 800,
    iterations: 1,
    delay: 250,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    offsets: [0, 1],
  });
  const samples: { translate: number; scale: number }[] = [];
  for (const time of [0, 80, 160, 240, 320, 400, 500, 600, 720, 800]) {
    samples.push(
      await title.evaluate(async (element, value) => {
        const a = element.getAnimations().find((item) => item.id === "sunford-stagger-bounce")!;
        a.currentTime = value + Number(a.effect!.getTiming().delay);
        await new Promise(requestAnimationFrame);
        const style = getComputedStyle(element);
        return {
          translate: parseFloat(style.translate.split(" ")[1] ?? "0"),
          scale: parseFloat(style.scale === "none" ? "1" : style.scale),
        };
      }, time),
    );
  }
  expect(samples[0]).toEqual({ translate: 40, scale: 0.8 });
  expect(Math.min(...samples.map((sample) => sample.translate))).toBeLessThan(0);
  expect(Math.max(...samples.map((sample) => sample.scale))).toBeGreaterThan(1);
  expect(samples.at(-1)).toEqual({ translate: 0, scale: 1 });
  await expect(title).toHaveCSS("opacity", "1");
  await expect(page.locator("main")).toHaveCSS("translate", "none");
  await expect(page.locator("main")).toHaveCSS("scale", "none");
  await page.screenshot({ path: test.info().outputPath("about-settled.png") });
});

test("three chapters paint like the supplied CSS reference at the same timeline times", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await freeze(page);
  await page.goto("/solutions");
  const chapters = page.locator('nav[aria-label="สำรวจกลุ่มธุรกิจ"] li');
  await expect(chapters).toHaveCount(3);
  for (const chapter of await chapters.all()) await expectStaggerMotion(chapter);
  await page.evaluate(() => {
    const reference = document.createElement("div");
    reference.id = "motion-reference";
    reference.style.cssText = "position:fixed;left:-10000px;top:0;display:flex;gap:16px";
    reference.innerHTML = `<style>
      #motion-reference > div { width:110px;height:140px;opacity:0;
        transform:translateY(40px) scale(0.8);
        animation:referenceBouncePop 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards; }
      @keyframes referenceBouncePop { to { opacity:1;transform:translateY(0px) scale(1); } }
    </style><div style="animation-delay:0.1s"></div><div style="animation-delay:0.25s"></div><div style="animation-delay:0.4s"></div>`;
    document.body.append(reference);
    for (const card of reference.querySelectorAll("div"))
      for (const animation of card.getAnimations()) animation.pause();
  });
  const samples = [];
  for (const time of [0, 100, 180, 250, 330, 400, 500, 750, 1000, 1200]) {
    const sample = await page.evaluate(async (value) => {
      const cards = Array.from(document.querySelectorAll('nav[aria-label="สำรวจกลุ่มธุรกิจ"] li'));
      const references = Array.from(document.querySelectorAll("#motion-reference > div"));
      for (const card of cards) {
        const animation = (window as unknown as StaggerWindow).staggerAnimations.find(
          (item) => (item.effect as KeyframeEffect).target === card,
        )!;
        animation.currentTime = value;
      }
      for (const card of references)
        for (const animation of card.getAnimations()) animation.currentTime = value;
      await new Promise(requestAnimationFrame);
      return cards.map((card, index) => {
        const native = getComputedStyle(card);
        const reference = getComputedStyle(references[index]);
        const matrix = new DOMMatrix(reference.transform);
        return {
          actual: {
            opacity: Number(native.opacity),
            translate: parseFloat(native.translate.split(" ")[1] ?? "0"),
            scale: native.scale === "none" ? 1 : Number(native.scale),
          },
          reference: {
            opacity: Number(reference.opacity),
            translate: matrix.m42,
            scale: matrix.m11,
          },
        };
      });
    }, time);
    for (const card of sample) {
      expect(card.actual.opacity).toBeCloseTo(card.reference.opacity, 4);
      expect(card.actual.translate).toBeCloseTo(card.reference.translate, 3);
      expect(card.actual.scale).toBeCloseTo(card.reference.scale, 4);
    }
    samples.push({ time, cards: sample });
    if (time === 180) {
      expect(sample[0].actual.opacity).toBeGreaterThan(0);
      expect(sample[1].actual.opacity).toBe(0);
      expect(sample[2].actual.opacity).toBe(0);
    }
    if (time === 500)
      await chapters
        .first()
        .locator("..")
        .screenshot({ path: test.info().outputPath("three-chapter-bounce.png") });
  }
  const samplePath = test.info().outputPath("reference-paint.json");
  await writeFile(samplePath, JSON.stringify(samples, null, 2));
  await test.info().attach("reference-paint.json", {
    path: samplePath,
    contentType: "application/json",
  });
});

test("offscreen content waits for entry and does not replay when scrolled back", async ({
  page,
}) => {
  await freeze(page);
  await page.goto("/about-us");
  await expectStaggerMotion(page.locator("main h1"));
  const target = page.locator("main #about-next-heading");
  await expect(target).not.toBeInViewport();
  expect(await staggerCount(target)).toBe(0);
  await expect(target).toHaveCSS("opacity", "1");
  await expect(target).toHaveCSS("scale", "none");
  await target.scrollIntoViewIfNeeded();
  await expectStaggerMotion(target);
  await expect.poll(() => activeStaggerCount(target)).toBe(1);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(target).not.toBeInViewport();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeInViewport();
  expect(await staggerCount(target)).toBe(1);
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

test("a queued content notification cannot reveal after returning Home", async ({ page }) => {
  type QueuedWindow = Window & {
    queuedReveals: {
      target: Element;
      observer: IntersectionObserver;
      callback: IntersectionObserverCallback;
    }[];
  };
  await page.addInitScript(() => {
    const state = window as unknown as QueuedWindow;
    state.queuedReveals = [];
    const NativeObserver = window.IntersectionObserver;
    window.IntersectionObserver = class extends NativeObserver {
      private revealCallback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options);
        this.revealCallback = callback;
      }
      observe(target: Element) {
        if (target.matches("main #about-next-heading"))
          state.queuedReveals.push({ target, observer: this, callback: this.revealCallback });
        super.observe(target);
      }
    };
  });
  await page.goto("/about-us");
  await expect
    .poll(() => page.evaluate(() => (window as unknown as QueuedWindow).queuedReveals.length))
    .toBeGreaterThan(0);
  await expect(page.locator("main #about-next-heading")).toHaveCSS("opacity", "1");
  await page.locator('main nav a[href="/"]').first().click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
  const replayed = await page.evaluate(() => {
    const queued = (window as unknown as QueuedWindow).queuedReveals[0];
    if (!queued) return false;
    queued.callback(
      [{ target: queued.target, isIntersecting: true } as IntersectionObserverEntry],
      queued.observer,
    );
    return true;
  });
  expect(replayed).toBe(true);
  await expect(page.locator("[data-stagger-bounce], [data-stagger-bounce-root]")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.getAnimations().filter((a) => a.id === "sunford-stagger-bounce").length,
    ),
  ).toBe(0);
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

test("new directory cards reveal once while existing cards retain their state", async ({
  page,
}) => {
  await recordStaggerMotion(page);
  await page.goto("/explore");
  const first = page.locator(".directory-card").first();
  await first.scrollIntoViewIfNeeded();
  await expectStaggerMotion(first);
  await expect.poll(() => activeStaggerCount(first)).toBe(0);
  const original = await first.getAttribute("href");
  const more = page.getByRole("button", { name: /^ดูทั้งหมด \d+ รายการ$/ });
  await more.click();
  await expect(first).toHaveAttribute("href", original!);
  expect(await staggerCount(first)).toBe(1);
  const extra = page.locator(".directory-card").nth(24);
  await expect(extra).toBeAttached();
  await extra.scrollIntoViewIfNeeded();
  await expectStaggerMotion(extra);
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("ไม่มีข้อมูลตามข้อความนี้");
  await expect(page.locator(".directory-card")).toHaveCount(0);
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("");
  await expect(page.locator(".directory-card")).toHaveCount(24);
  const restored = page.locator(".directory-card").first();
  await restored.scrollIntoViewIfNeeded();
  await expectStaggerMotion(restored);
});
