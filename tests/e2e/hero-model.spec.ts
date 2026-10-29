import { expect, test, type Page } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

async function selectModel(page: Page, name = "WPS10KS") {
  await page.getByRole("button", { name: `แสดง ${name}`, exact: true }).click();
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-status", "ready", { timeout: 30000 });
  return stage;
}

test("WPS10KS loads on selection, moves its camera, and stops for pause, dragging and offscreen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  let modelRequests = 0;
  page.on("request", (request) => {
    if (new URL(request.url()).pathname === "/models/wps10ks.glb") modelRequests++;
  });
  await page.goto("/");
  await expect(page.locator(".hero-model-stage")).toBeVisible();
  await expect(page.locator('[data-hero-model="/models/wps10ks.glb"]')).toHaveAttribute(
    "data-status",
    "ready",
    { timeout: 30000 },
  );
  expect(modelRequests).toBe(1);
  const stage = await selectModel(page);
  const viewer = stage.locator("model-viewer");
  await expect(stage).toHaveAttribute("data-moving", "false");
  await page.getByRole("button", { name: "เล่นมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "true");
  expect(modelRequests).toBe(1);
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "WPS10KS");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/wps10ks",
  );
  const orbit = () =>
    viewer.evaluate((element) => (element as HTMLElement & { cameraOrbit: string }).cameraOrbit);
  const initial = await orbit();
  await expect.poll(orbit).not.toBe(initial);
  await page.evaluate(() => document.fonts.ready);
  const copy = (await page.locator(".hero-copy").boundingBox())!;
  await page.getByRole("button", { name: "หยุดมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "false");
  const pausedOrbit = await orbit();
  await page.waitForTimeout(350);
  expect(await orbit()).toBe(pausedOrbit);
  const after = (await page.locator(".hero-copy").boundingBox())!;
  expect(after.x).toBeCloseTo(copy.x, 1);
  expect(after.y).toBeCloseTo(copy.y, 1);
  await page.getByRole("button", { name: "เล่นมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "true");
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-moving", "false");
  await page.locator(".hero-cinematic").scrollIntoViewIfNeeded();
  await expect(stage).toHaveAttribute("data-moving", "true");
  const box = (await viewer.boundingBox())!;
  const theta = () =>
    viewer.evaluate(
      (element) =>
        (element as HTMLElement & { getCameraOrbit(): { theta: number } }).getCameraOrbit().theta,
    );
  const beforeDrag = await theta();
  await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.55, { steps: 12 });
  await page.mouse.up();
  await expect(stage).toHaveAttribute("data-moving", "false");
  await expect.poll(async () => Math.abs((await theta()) - beforeDrag)).toBeGreaterThan(0.01);
  await page.getByRole("button", { name: "สินค้าถัดไป", exact: true }).click();
  await expect(stage).toHaveCount(1);
  await expect(viewer).toHaveJSProperty("src", "/models/acs30-jc21.glb");
});

test("FEH5KS uses its own model and switching slides keeps only one main viewer", async ({
  page,
}) => {
  await page.goto("/");
  const stage = await selectModel(page, "FEH5KS");
  const viewer = stage.locator("model-viewer");
  await page.getByRole("button", { name: "เล่นมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(viewer).toHaveJSProperty("src", "/models/feh5ks.glb");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute("href", "/products/feh5ks");
  await expect(stage).toHaveAttribute("data-moving", "true");
  const orbit = () =>
    viewer.evaluate((element) => (element as HTMLElement & { cameraOrbit: string }).cameraOrbit);
  const initial = await orbit();
  await expect.poll(orbit).not.toBe(initial);
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const box = (await stage.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  }
  await selectModel(page);
  await expect(page.locator(".hero-model-stage model-viewer")).toHaveCount(1);
  await expect(viewer).toHaveJSProperty("src", "/models/wps10ks.glb");
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  await expect(stage).toHaveAttribute("data-status", "ready", { timeout: 30000 });
  await expect(viewer).toHaveJSProperty("src", "/models/acs30-jc21.glb");
});

test("WPS10KS respects reduced motion and fits mobile viewports", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const stage = await selectModel(page);
  await expect(stage).toHaveAttribute("data-moving", "false");
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const box = (await stage.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  }
  await page.getByRole("button", { name: "เล่นมุมกล้องอัตโนมัติ", exact: true }).click();
  await expect(stage).toHaveAttribute("data-moving", "true");
});

test("a failed GLB preserves the product image and details link", async ({ page }) => {
  await page.route("**/models/wps10ks.glb", (route) => route.abort());
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง WPS10KS", exact: true }).click();
  const stage = page.locator(".hero-model-stage");
  await expect(stage).toHaveAttribute("data-status", "error", { timeout: 30000 });
  await expect(stage.locator(".hero-model-fallback img")).toBeVisible();
  await expect(stage.locator("model-viewer")).toHaveCount(0);
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/wps10ks",
  );
});
