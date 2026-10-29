import { expect, test } from "@playwright/test";
import type { ModelViewerElement } from "@google/model-viewer";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("ACS renders a large Retina scene with transparent corners and no legacy video", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 2,
  });
  try {
    const page = await context.newPage();
    const legacyRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("sunford-homepage-16x9")) legacyRequests.push(request.url());
    });
    await page.goto("/");
    await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
    const stage = page.locator(".hero-model-stage--featured");
    await expect(stage).toHaveAttribute("data-status", "ready", { timeout: 30000 });
    await expect(stage.locator("model-viewer")).toHaveJSProperty("src", "/models/acs30-jc21.glb");
    expect((await stage.boundingBox())!.width).toBeGreaterThan(1440 * 0.6);
    await expect
      .poll(() =>
        stage.locator("model-viewer").evaluate((element) => {
          const canvas = element.shadowRoot!.querySelector("canvas")!;
          const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height);
          let hasProduct = false;
          for (let offset = 3; offset < pixels.data.length; offset += 4) {
            if (pixels.data[offset] === 255) {
              hasProduct = true;
              break;
            }
          }
          return (
            canvas.width >= element.clientWidth * window.devicePixelRatio * 0.74 &&
            pixels.data[3] === 0 &&
            hasProduct
          );
        }),
      )
      .toBe(true);
    expect(legacyRequests).toEqual([]);
    await page.screenshot({ path: test.info().outputPath("hero-retina.png") });
  } finally {
    await context.close();
  }
});

test("ACS camera moves while text stays still and pauses outside the viewport", async ({
  page,
}) => {
  await page.goto("/");
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-status", "ready", { timeout: 30000 });
  await expect(stage).toHaveAttribute("data-moving", "true");
  await page.evaluate(() => document.fonts.ready);
  const copy = (await page.locator(".hero-copy").boundingBox())!;
  const orbit = () =>
    stage
      .locator("model-viewer")
      .evaluate((element) => (element as ModelViewerElement).cameraOrbit);
  const start = await orbit();
  await expect.poll(orbit).not.toBe(start);
  const after = (await page.locator(".hero-copy").boundingBox())!;
  expect(after.x).toBeCloseTo(copy.x, 1);
  expect(after.y).toBeCloseTo(copy.y, 1);
  await page.getByRole("button", { name: "หยุดมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "false");
  const paused = await orbit();
  await page.waitForTimeout(250);
  expect(await orbit()).toBe(paused);
  await page.getByRole("button", { name: "เล่นมุมกล้องอัตโนมัติ", exact: true }).click();
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-moving", "false");
  await page.locator(".hero-cinematic").scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-moving", "true");
});

test("ACS respects reduced motion and keeps the scene within mobile screens", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-status", "ready", { timeout: 30000 });
  await expect(stage).toHaveAttribute("data-moving", "false");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    const box = (await stage.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.getByRole("button", { name: "เล่นมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "true");
});

test("an unavailable ACS model retains a product image and working details link", async ({
  page,
}) => {
  await page.route("**/models/acs30-jc21.glb", (route) => route.abort());
  await page.goto("/");
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-status", "error", { timeout: 30000 });
  await expect(stage.locator(".hero-model-fallback img")).toBeVisible();
  await expect(stage.locator("model-viewer")).toHaveCount(0);
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/acs30-jc21",
  );
});
