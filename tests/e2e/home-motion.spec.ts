import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

for (const viewport of [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 844, height: 390 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
]) {
  test(`gentle sections scroll naturally and keep controls reachable at ${viewport.width}x${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
      timeout: 15000,
    });
    const sections = page.locator('[data-home-motion="reveal"]');
    await expect(sections).toHaveCount(5);
    await expect(sections.first()).toHaveAttribute("data-motion-enabled", "true");
    await page.evaluate(() => {
      document.documentElement.style.scrollBehavior = "auto";
    });
    const highlights = sections.filter({ has: page.locator(".product-spotlight, #story") });
    await expect(highlights).toHaveCount(2);
    for (const section of await highlights.all()) {
      const geometry = await section.evaluate((element) => ({
        start: element.getBoundingClientRect().top + scrollY,
        extra:
          (element as HTMLElement).offsetHeight -
          (element.firstElementChild as HTMLElement).offsetHeight,
      }));
      expect(geometry.extra).toBe(0);
      await expect(section.locator(":scope > div")).toHaveCSS("position", "static");
      for (const offset of [0, 150, 0]) {
        await page.evaluate((y) => scrollTo(0, y), geometry.start + offset);
        await expect
          .poll(async () => (await section.locator(":scope > div").boundingBox())!.y)
          .toBeCloseTo(-offset, 0);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
      }
      const playback = section.getByRole("button");
      if (await playback.count()) {
        await playback.scrollIntoViewIfNeeded();
        const control = (await playback.boundingBox())!;
        expect(control.width).toBeGreaterThanOrEqual(44);
        expect(control.height).toBeGreaterThanOrEqual(44);
        expect(
          await playback.evaluate((e) => {
            const rect = e.getBoundingClientRect();
            return e.contains(
              document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
            );
          }),
        ).toBe(true);
      }
      for (const link of await section.locator("a").all()) {
        await link.focus();
        await link.scrollIntoViewIfNeeded();
        await expect(link).toBeInViewport();
      }
      if (viewport.width === 390 || viewport.width === 1440) {
        await page.evaluate((y) => scrollTo(0, y - 64), geometry.start);
        await page.screenshot({
          path: test.info().outputPath(`gentle-${Math.round(geometry.start)}.jpg`),
        });
      }
    }
    await page.setViewportSize({ width: 390, height: 600 });
    for (const section of await highlights.all()) {
      await expect(section.locator(":scope > div")).toHaveCSS("position", "static");
      expect(
        await section.evaluate(
          (e) =>
            (e as HTMLElement).offsetHeight - (e.firstElementChild as HTMLElement).offsetHeight,
        ),
      ).toBe(0);
    }
  });
}

test("spotlight loops without playback controls and respects visibility and motion preferences", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const video = page.locator(".spotlight-product-video");
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
  await video.evaluate((element: HTMLVideoElement) => {
    element.playbackRate = 4;
    let previous = element.currentTime;
    let elapsed = 0;
    element.addEventListener("timeupdate", () => {
      const current = element.currentTime;
      elapsed += current >= previous ? current - previous : element.duration - previous + current;
      previous = current;
      element.dataset.playedSeconds = String(elapsed);
    });
  });
  await expect
    .poll(async () => Number(await video.getAttribute("data-played-seconds")), { timeout: 25000 })
    .toBeGreaterThan(35);
  await expect(video).toHaveJSProperty("paused", false);
  await expect(page.getByRole("button", { name: /^(หยุด|เล่น)วิดีโอสินค้า$/ })).toHaveCount(0);
  await page.locator(".hero-cinematic").scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", true);
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(video).toHaveJSProperty("paused", true);
  await page.evaluate(() => {
    delete (document as unknown as { hidden?: boolean }).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(video).toHaveJSProperty("paused", false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(video).toHaveJSProperty("paused", true);
  await expect(page.locator('[data-home-motion="reveal"]').first()).toHaveAttribute(
    "data-motion-enabled",
    "false",
  );
  await expect(page.locator('[data-home-motion="reveal"] > div').first()).toHaveCSS(
    "position",
    "static",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty("paused", false);
});

test("explicit Hero pause survives product selection and dragging until play", async ({ page }) => {
  await page.goto("/");
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-moving", "true", { timeout: 30000 });
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await page.getByRole("button", { name: "แสดง WPS10KS", exact: true }).click();
  const viewer = stage.locator("model-viewer");
  const box = (await viewer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(stage).toHaveAttribute("data-moving", "false");
  await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "true");
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-cycle-mode", "pinned");
});

test("without JavaScript content and poster stay visible without extra scroll scenes", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const scenes = page.locator('[data-home-motion="reveal"]');
    await expect(scenes.first().locator("h2")).toBeVisible();
    await expect(scenes.last().locator("h2")).toBeVisible();
    await expect(page.locator(".spotlight-product-video")).toHaveAttribute("poster", /.+/);
    for (const scene of await scenes.all())
      await expect(scene.locator(":scope > div")).toHaveCSS("position", "static");
  } finally {
    await context.close();
  }
});

test("failed video keeps its poster and product link", async ({ page }) => {
  await page.route("**/videos/jc21-panel-aligned-1080p.mp4", (route) => route.abort());
  await page.goto("/");
  const spotlight = page.locator(".product-spotlight");
  await spotlight.scrollIntoViewIfNeeded();
  await expect(spotlight.locator(".spotlight-visual img")).toBeVisible();
  await expect(spotlight.locator(".spotlight-visual")).toHaveAttribute(
    "href",
    "/products/acs30-jc21",
  );
  await expect(spotlight.getByRole("button")).toHaveCount(0);
});
