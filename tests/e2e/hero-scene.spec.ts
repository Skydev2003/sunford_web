import { expect, test, type Page } from "@playwright/test";

const title = "เครื่องชั่ง สำหรับธุรกิจของคุณ";
const scene = (page: Page) => page.locator("[data-hero-scene]");
const nextSection = (page: Page) => page.locator('[data-home-section="2"]');
async function ready(page: Page) {
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 15000,
  });
  await expect(scene(page)).toHaveAttribute("data-ready", "true");
  await page.evaluate(() => document.fonts.ready);
}

for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
  [1280, 720],
  [768, 1024],
  [390, 844],
  [320, 700],
  [844, 390],
]) {
  test(`video Hero keeps HoN text order and empty logo space at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requests: string[] = [],
      errors: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await ready(page);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
    await expect(scene(page).locator("video")).toHaveCount(1);
    await expect(page.locator('video source[src="/videos/sunford-web.mp4"]')).toHaveCount(1);
    await expect(scene(page).locator("video")).toHaveAttribute(
      "poster",
      "/videos/sunford-poster.jpg",
    );
    await expect(
      scene(page).locator("img, [data-hero-product], [data-hero-object], canvas"),
    ).toHaveCount(0);
    const blank = scene(page).locator("[data-hero-logo-space]");
    await expect(blank).toBeEmpty();
    await expect(blank).toHaveAttribute("aria-hidden", "true");
    const heading = (await scene(page).locator("h1").boundingBox())!;
    const space = (await blank.boundingBox())!;
    const cta = scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" });
    const button = (await cta.boundingBox())!;
    const bounds = (await scene(page).boundingBox())!;
    expect(space.height).toBeGreaterThan(0);
    expect(Math.abs(bounds.y + bounds.height - height)).toBeLessThan(2);
    expect(button.y + button.height).toBeLessThanOrEqual(height - 10);
    const description = (await scene(page).locator("p").boundingBox())!;
    expect(description.y + description.height).toBeLessThanOrEqual(height - 10);
    const nextBounds = (await nextSection(page).boundingBox())!;
    expect(nextBounds.y).toBeGreaterThanOrEqual(height - 1);
    expect(space.y).toBeGreaterThan(heading.y + heading.height);
    expect(button.y).toBeGreaterThanOrEqual(space.y + space.height);
    expect(button.y + button.height).toBeLessThanOrEqual(bounds.y + bounds.height);
    expect(Math.abs(space.x + space.width / 2 - width / 2)).toBeLessThan(1);
    await expect(cta).toHaveAttribute("href", "/contact-us");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    expect(
      requests.filter((url) => /\/images\/hero\/|\.glb(?:\?|$)|model-viewer/.test(url)),
    ).toEqual([]);
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`video-hero-${width}.png`) });
  });
}

test("video remains paused until Opening releases the Hero", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(scene(page)).toHaveAttribute("data-opening", "true");
  expect(
    await scene(page)
      .locator("video")
      .evaluate((v: HTMLVideoElement) => v.paused),
  ).toBe(true);
  await ready(page);
  await expect
    .poll(() =>
      scene(page)
        .locator("video")
        .evaluate((v: HTMLVideoElement) => v.paused),
    )
    .toBe(false);
});

test("video plays after Opening and pauses offscreen, then resumes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await ready(page);
  const video = scene(page).locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0))
    .toBe(true);
  expect(await video.evaluate((v: HTMLVideoElement) => v.muted && v.loop && v.playsInline)).toBe(
    true,
  );
  await page.locator("#stories").scrollIntoViewIfNeeded();
  await expect(scene(page)).toHaveAttribute("data-running", "false");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
});

test("live reduced motion pauses the video and disables section reveal", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  const video = scene(page).locator("video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(nextSection(page)).toHaveAttribute("data-hero-scroll-reveal", "reduced");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(scene(page).locator("button")).toHaveCount(0);
});

test("native scrolling reveals the next content once, without a second brand film", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  const next = nextSection(page);
  await next.scrollIntoViewIfNeeded();
  await expect(next).toHaveAttribute("data-hero-scroll-reveal", "complete");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(next).toHaveAttribute("data-hero-scroll-reveal", "complete");
  await expect(page.locator("#brand-film")).toHaveCount(1);
  await expect(page.locator("#brand-film")).toHaveAttribute("data-hero-scene", "");
  await expect(page.locator("[data-home-motion]")).toHaveCount(5);
});

for (const width of [1440, 390]) {
  test(`without JavaScript the video poster, empty logo space and consultation remain usable at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
      await expect(scene(page).locator("video")).toBeVisible();
      await expect(scene(page).locator("video")).toHaveAttribute(
        "poster",
        "/videos/sunford-poster.jpg",
      );
      await expect(scene(page).locator("[data-hero-logo-space]")).toBeEmpty();
      await expect(page.locator("[data-brand-opening]")).toBeHidden();
      await scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }).click();
      await expect(page).toHaveURL(/\/contact-us$/);
    } finally {
      await context.close();
    }
  });
}

test("unavailable video leaves text, poster and consultation usable", async ({ page }) => {
  await page.route("**/videos/sunford-web.mp4", (route) => route.abort());
  await page.goto("/");
  await ready(page);
  await expect(scene(page).locator("video")).toHaveAttribute(
    "poster",
    "/videos/sunford-poster.jpg",
  );
  await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
  await scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }).click();
  await expect(page).toHaveURL(/\/contact-us$/);
});

test("consultation is keyboard reachable and internal pages release the Hero header", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  const cta = scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" });
  await cta.focus();
  await expect(cta).toBeFocused();
  expect(await cta.evaluate((n) => getComputedStyle(n).outlineWidth)).toBe("3px");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact-us$/);
  await expect(page.locator(".site-header")).not.toHaveAttribute("data-hero-backdrop");
  await expect(page.locator(".site-header")).toHaveAttribute("data-nav-tone", "light");
  await expect(page.locator(".nav-glass")).toHaveCSS(
    "background-color",
    "rgba(255, 255, 255, 0.72)",
  );
});
