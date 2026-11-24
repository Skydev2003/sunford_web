import { expect, test, type Page } from "@playwright/test";
import { contactLocations } from "../../src/features/content/data/contact-locations";

const title = "เครื่องชั่ง สำหรับธุรกิจของคุณ";
const scene = (page: Page) => page.locator("[data-hero-scene]");
const heroPoster = (page: Page) => scene(page).locator("[data-hero-poster] img");
const posterRequest = /\/videos\/sunford-poster[^/]*\.(?:jpg|webp)$/;
const nextSection = (page: Page) => page.locator('[data-home-section="2"]');
async function ready(page: Page) {
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 15000,
  });
  await expect(scene(page)).toHaveAttribute("data-ready", "true");
  await page.evaluate(() => document.fonts.ready);
}

async function expectContactDetails(page: Page) {
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "ติดต่อเรา", exact: true })).toBeVisible();
  const channels = main.getByRole("region", { name: "ช่องทางติดต่อซันฟอร์ด" });
  const phone = channels.getByRole("link", { name: /03-427-6999/ });
  const email = channels.getByRole("link", { name: /info@sunford\.co\.th/ });
  await expect(phone).toHaveAttribute("href", "tel:034276999");
  await expect(email).toHaveAttribute("href", "mailto:info@sunford.co.th");
  for (const link of [phone, email]) {
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    await expect(link).toBeInViewport();
  }

  const bangLen = contactLocations.find((location) => location.id === "service")!;
  const map = channels.getByRole("link", { name: /Google Maps.*สำนักงานบางเลน/ });
  await expect(map).toHaveAttribute("href", bangLen.map);
  await map.scrollIntoViewIfNeeded();
  await expect(map).toBeInViewport();
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
  test(`video Hero keeps its text order and reserved logo space at ${width}x${height}`, async ({
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
    await expect(scene(page).locator("video[src], video source")).toHaveCount(0);
    await expect(scene(page).locator("video")).toBeHidden();
    await expect(heroPoster(page)).toBeVisible();
    await expect(
      scene(page).locator(
        "img:visible:not([data-hero-poster] img), [data-hero-product], [data-hero-object], canvas",
      ),
    ).toHaveCount(0);
    const blank = scene(page).locator("[data-hero-logo-space]");
    await expect(blank.locator("[data-brand-opening]")).toBeHidden();
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
    await expect(cta).toHaveAttribute("href", "/service?section=contact");
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    expect(
      requests.filter((url) =>
        /\/videos\/sunford-web\.mp4|\/images\/hero\/|\.glb(?:\?|$)|model-viewer/.test(url),
      ),
    ).toEqual([]);
    const posterRequests = requests.filter((url) => posterRequest.test(url));
    expect(posterRequests).toHaveLength(1);
    expect(posterRequests[0]).toMatch(/\.webp$/);
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`video-hero-${width}.png`) });
  });
}

test("Hero readiness and video playback do not wait for the logo", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(scene(page)).toHaveAttribute("data-opening", "false");
  await expect(scene(page)).toHaveAttribute("data-ready", "true");
  await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
  await expect
    .poll(() =>
      scene(page)
        .locator("video")
        .evaluate((video: HTMLVideoElement) => video.paused),
    )
    .toBe(false);
});

test("video plays in view and pauses offscreen, then resumes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await ready(page);
  const video = scene(page).locator("video");
  await expect
    .poll(() => video.evaluate((v: HTMLVideoElement) => !v.paused && v.currentTime > 0))
    .toBe(true);
  await expect(video).toBeVisible();
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
  const videoRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/videos/sunford-web.mp4")
      videoRequests.push(request.url());
  });
  await page.goto("/");
  await ready(page);
  const video = scene(page).locator("video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(page.locator("#main-content")).toHaveAttribute("data-scroll-reveal-mode", "reduced");
  await expect(nextSection(page).getByRole("heading")).toHaveCSS("translate", "none");
  expect(videoRequests).toEqual([]);
  const requestingVideo = page.waitForRequest("**/videos/sunford-web.mp4");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await requestingVideo;
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  await expect(video).toBeHidden();
  await expect(heroPoster(page)).toBeVisible();
  await expect(scene(page).locator("button")).toHaveCount(0);
});

test("the next content uses the shared reveal without a second brand film", async ({ page }) => {
  await page.goto("/");
  await ready(page);
  const next = nextSection(page);
  await next.scrollIntoViewIfNeeded();
  await expect(next.getByRole("heading")).toHaveAttribute("data-scroll-reveal", "");
  await expect(next.getByRole("heading")).toHaveCSS("opacity", "1");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(next.getByRole("heading")).toHaveCSS("translate", "none");
  await expect(page.locator("#brand-film")).toHaveCount(1);
  await expect(page.locator("#brand-film")).toHaveAttribute("data-hero-scene", "");
  await expect(page.locator("[data-home-motion]")).toHaveCount(5);
});

for (const width of [1440, 390]) {
  test(`without JavaScript the video poster, reserved logo space and consultation remain usable at ${width}px`, async ({
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
      const videoRequests: string[] = [];
      page.on("request", (request) => {
        if (new URL(request.url()).pathname === "/videos/sunford-web.mp4")
          videoRequests.push(request.url());
      });
      const poster = page.waitForResponse(posterRequest);
      await page.goto("/");
      const picture = await poster;
      expect(picture.ok()).toBe(true);
      expect(new URL(picture.url()).pathname).toBe(
        width === 390
          ? "/videos/sunford-poster-portrait-642.webp"
          : "/videos/sunford-poster-1920.webp",
      );
      await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
      await expect(heroPoster(page)).toBeVisible();
      await expect(scene(page).locator("video")).toBeHidden();
      await expect(scene(page).locator("video[src], video source")).toHaveCount(0);
      const space = scene(page).locator("[data-hero-logo-space]");
      await expect(space).toBeVisible();
      expect((await space.boundingBox())!.height).toBeGreaterThan(0);
      await expect(space.locator("[data-brand-opening]")).toBeHidden();
      await expect(page.locator("[data-brand-opening]")).toBeHidden();
      const contact = page.waitForResponse((response) => {
        const url = new URL(response.url());
        return (
          response.request().isNavigationRequest() &&
          url.pathname + url.search === "/service?section=contact"
        );
      });
      await scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }).click();
      await expect(page).toHaveURL(/\/service\?section=contact$/);
      expect((await contact).ok()).toBe(true);
      await expectContactDetails(page);
      expect(videoRequests).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test("unavailable video leaves text, poster and consultation usable", async ({ page }) => {
  await page.route("**/videos/sunford-web.mp4", (route) => route.abort());
  await page.goto("/");
  await ready(page);
  await expect(heroPoster(page)).toBeVisible();
  await expect(scene(page).locator("video")).toBeHidden();
  await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
  await scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }).click();
  await expect(page).toHaveURL(/\/service\?section=contact$/);
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
  await expect(page).toHaveURL(/\/service\?section=contact$/);
  await expect(page.locator("[data-nav-home]:visible")).toHaveCount(0);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await expectContactDetails(page);
});
