import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("studio follows the mouse without moving copy and pauses for model dragging, controls and offscreen", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const studio = page.locator("[data-hero-studio]");
  const rings = studio.locator("[data-studio-rings]");
  const flow = studio.locator("[data-studio-flow]");
  const cursor = studio.locator("[data-studio-cursor]");
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-status", "ready", { timeout: 30000 });
  await page.getByRole("button", { name: "หยุดมุมกล้องอัตโนมัติ", exact: true }).click();
  await page.evaluate(() => document.fonts.ready);
  await expect(studio).toHaveAttribute("data-running", "true");
  await expect(page.locator(".announcement")).toHaveCount(0);
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-hero-backdrop", "");
  await expect(header.locator(".nav-glass")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "เครื่องชั่ง", exact: true })
    .hover();
  await expect(header).toHaveClass(/is-menu-open/);
  await expect(header.locator(".nav-glass")).toHaveCSS("background-color", "rgb(247, 247, 249)");
  await page.keyboard.press("Escape");
  await expect(header).not.toHaveClass(/is-menu-open/);
  await expect(page.locator(".hero-cinematic")).toHaveAttribute(
    "data-active-product",
    "ACS-30-JC21",
  );
  await expect(page.locator(".hero-tagline")).toHaveText("คู่คิดทุกธุรกิจของคุณ");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/acs30-jc21",
  );
  await expect(studio.locator("canvas, video, iframe")).toHaveCount(0);
  await expect(studio.locator("img")).toHaveCount(0);
  await expect(page.locator(".hero-model-standby")).toHaveCount(2);
  const copy = (await page.locator(".hero-copy").boundingBox())!;
  await page.screenshot({ path: test.info().outputPath("hero-studio-desktop.jpg") });
  const bounds = (await studio.boundingBox())!;
  expect(bounds.y).toBeCloseTo(0, 1);
  expect(bounds.y + bounds.height).toBeCloseTo(900, 1);
  const beforeHeader = await flow.getAttribute("style");
  await page.mouse.move(250, 25);
  await expect.poll(() => flow.getAttribute("style")).not.toBe(beforeHeader);
  await expect(studio).toHaveAttribute("data-pointer", "idle");
  await page.mouse.move(130, bounds.y + bounds.height * 0.4);
  await expect(studio).toHaveAttribute("data-pointer", "idle");
  const initial = await rings.getAttribute("style");
  const initialFlow = await flow.getAttribute("style");
  await page.mouse.move(1200, bounds.y + bounds.height * 0.6);
  await expect.poll(() => rings.getAttribute("style")).not.toBe(initial);
  await expect.poll(() => flow.getAttribute("style")).not.toBe(initialFlow);
  await expect(studio).toHaveAttribute("data-pointer", "idle");
  await expect(cursor).toHaveCSS("opacity", "1");
  await page.screenshot({ path: test.info().outputPath("hero-studio-pointer.jpg") });
  const after = (await page.locator(".hero-copy").boundingBox())!;
  expect(after.x).toBeCloseTo(copy.x, 1);
  expect(after.y).toBeCloseTo(copy.y, 1);
  const settled = await rings.getAttribute("style");
  await page.waitForTimeout(200);
  expect(await rings.getAttribute("style")).toBe(settled);

  const halo = rings.locator("div");
  const transform = () => halo.evaluate((element) => getComputedStyle(element).transform);
  const breathing = await transform();
  await expect.poll(transform).not.toBe(breathing);
  await page.getByRole("button", { name: "หยุดแสงพื้นหลัง", exact: true }).click();
  await expect(studio).toHaveAttribute("data-running", "false");
  await expect
    .poll(() =>
      halo.evaluate((element) =>
        element
          .getAnimations()
          .every((animation) => animation.playState === "paused" && !animation.pending),
      ),
    )
    .toBe(true);
  const paused = await transform();
  await page.waitForTimeout(200);
  expect(await transform()).toBe(paused);
  await page.getByRole("button", { name: "เล่นแสงพื้นหลัง", exact: true }).click();
  await expect(studio).toHaveAttribute("data-running", "true");

  const model = (await stage.boundingBox())!;
  await page.mouse.move(model.x + model.width / 2, model.y + model.height / 2);
  await expect(studio).toHaveAttribute("data-pointer", "idle");
  await page.mouse.down();
  await expect(studio).toHaveAttribute("data-running", "false");
  const dragRings = await rings.getAttribute("style");
  await page.mouse.move(model.x + model.width * 0.6, model.y + model.height * 0.55, { steps: 10 });
  expect(await rings.getAttribute("style")).toBe(dragRings);
  await page.mouse.up();
  await expect(studio).toHaveAttribute("data-running", "true");
  await expect(stage).toHaveAttribute("data-moving", "false");
  await page.mouse.click(500, bounds.y + 90);
  await expect(studio.locator("[data-studio-pulse]")).toHaveCount(0);
  await expect(cursor).toHaveCSS("opacity", "1");
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect(studio).toHaveAttribute("data-running", "false");
  await expect(header).not.toHaveAttribute("data-hero-backdrop", "");
  await expect(header.locator(".nav-glass")).toHaveCSS("background-color", "rgb(247, 247, 249)");
  await page.locator(".hero-cinematic").scrollIntoViewIfNeeded();
  await expect(studio).toHaveAttribute("data-running", "true");
  await page.screenshot({ path: test.info().outputPath("hero-studio-after-drag.jpg") });
  await page.locator(".hero-buttons a").first().click();
  await expect(page).toHaveURL(/\/products\/acs30-jc21$/, { timeout: 30000 });
  await expect(header).not.toHaveAttribute("data-hero-backdrop", "");
  await expect(header.locator(".nav-glass")).toHaveCSS("background-color", "rgb(247, 247, 249)");
});

test("studio respects reduced motion and preserves mobile content without horizontal overflow", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const studio = page.locator("[data-hero-studio]");
  await expect(page.locator(".hero-model-stage")).toHaveAttribute("data-status", "ready", {
    timeout: 30000,
  });
  await expect(studio).toHaveAttribute("data-running", "false");
  await expect(page.getByRole("button", { name: "หยุดแสงพื้นหลัง", exact: true })).toBeHidden();
  const rings = studio.locator("[data-studio-rings]");
  await expect(rings.locator("div")).toHaveCSS("animation-name", "none");
  await expect(studio.locator("[data-studio-flow] > div").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  const initial = await rings.getAttribute("style");
  await page.mouse.move(50, 400);
  await page.mouse.move(300, 500);
  expect(await rings.getAttribute("style")).toBe(initial);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator(".hero-buttons a").first()).toBeVisible();
    await expect(page.locator(".hero-description")).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileBounds = (await studio.boundingBox())!;
  expect(mobileBounds.y).toBeCloseTo(0, 1);
  expect(mobileBounds.height).toBeGreaterThanOrEqual(844);
  await page.screenshot({ path: test.info().outputPath("hero-studio-mobile.jpg") });
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const mobileNavigation = page.locator("#mobile-navigation");
  await expect(
    mobileNavigation.getByRole("link", { name: "บริการหลังการขาย", exact: true }),
  ).toBeVisible();
  await mobileNavigation.getByRole("link", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true }).click();
  await expect(page).toHaveURL(/\/Indicator$/);
  await expect(page.locator("#mobile-navigation")).toHaveCount(0);
  await expect(page.locator(".nav-glass")).toHaveCSS("background-color", "rgb(247, 247, 249)");
});
