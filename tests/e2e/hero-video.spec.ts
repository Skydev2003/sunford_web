import { expect, test } from "@playwright/test";

test("homepage animation plays silently, pauses on request and stops outside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1050 });
  await page.goto("/");
  const video = page.locator(".hero-product-video");
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.2);
  expect(
    await video.evaluate((element: HTMLVideoElement) => ({
      muted: element.muted,
      loop: element.loop,
      inline: element.playsInline,
    })),
  ).toEqual({ muted: true, loop: true, inline: true });
  await page.getByRole("button", { name: "หยุดแอนิเมชันสินค้า", exact: true }).click();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await page.locator(".hero-motion").scrollIntoViewIfNeeded();
  await expect(
    page.getByRole("button", { name: "เล่นแอนิเมชันสินค้า", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "เล่นแอนิเมชันสินค้า", exact: true }).click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(false);
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(false);
  await page.getByRole("button", { name: "หยุดแอนิเมชันสินค้า", exact: true }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 1;
  });
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => !element.seeking && element.readyState >= 2),
    )
    .toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: test.info().outputPath("hero-desktop.png"),
    animations: "disabled",
  });
});

test("animation stays proportional on mobile and the page does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const video = page.locator(".hero-product-video");
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.2);
  for (const width of [320, 390, 768, 1280, 1800]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const box = (await video.boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "หยุดแอนิเมชันสินค้า", exact: true }).click();
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 1;
  });
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => !element.seeking && element.readyState >= 2),
    )
    .toBe(true);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: test.info().outputPath("hero-mobile.png"),
    animations: "disabled",
  });
});

test("the full-height scene keeps text stationary as the video timeline changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const video = page.locator(".hero-product-video");
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.2);
  await page.getByRole("button", { name: "หยุดแอนิเมชันสินค้า", exact: true }).click();
  const scene = page.locator(".hero-cinematic");
  const box = (await scene.boundingBox())!;
  expect(Math.abs(box.y + box.height - 900)).toBeLessThan(3);
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 0;
  });
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => !element.seeking))
    .toBe(true);
  await expect
    .poll(() =>
      scene.evaluate((element) =>
        parseFloat((element as HTMLElement).style.getPropertyValue("--hero-progress")),
      ),
    )
    .toBeLessThan(0.01);
  await page.waitForTimeout(220);
  const initial = (await page.locator(".hero-copy").boundingBox())!;
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = element.duration / 4;
  });
  await expect
    .poll(() =>
      scene.evaluate((element) =>
        parseFloat((element as HTMLElement).style.getPropertyValue("--hero-progress")),
      ),
    )
    .toBeCloseTo(0.25, 2);
  const after = (await page.locator(".hero-copy").boundingBox())!;
  expect(after.x).toBeCloseTo(initial.x, 1);
  expect(after.y).toBeCloseTo(initial.y, 1);
  expect(await video.evaluate((element: HTMLVideoElement) => element.paused)).toBe(true);
});

test("reduced motion shows a still frame until the visitor chooses to play", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const video = page.locator(".hero-product-video");
  await expect(
    page.getByRole("button", { name: "เล่นแอนิเมชันสินค้า", exact: true }),
  ).toBeVisible();
  expect(
    await video.evaluate(
      (element: HTMLVideoElement) => element.paused && element.currentTime === 0,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "เล่นแอนิเมชันสินค้า", exact: true }).click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime))
    .toBeGreaterThan(0.2);
});

test("an unavailable clip falls back to the product photograph", async ({ page }) => {
  await page.route("**/videos/sunford-homepage-16x9.webm*", (route) => route.abort());
  await page.goto("/");
  await expect(page.locator(".hero-motion-fallback")).toBeVisible();
  await expect(page.locator(".hero-product-video")).toHaveCount(0);
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/acs30-jc21",
  );
});
