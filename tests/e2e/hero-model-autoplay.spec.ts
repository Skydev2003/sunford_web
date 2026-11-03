import { expect, test } from "@playwright/test";

// Historical Hero 3D interaction contract, explicitly replaced by the image studio.
test.skip(
  true,
  "Retired homepage 3D/bubbles/ribbon; replacement coverage: hero-scene.spec.ts and hero-header-scroll.spec.ts. Product-page 3D remains covered by product-model.spec.ts.",
);
import type { ModelViewerElement } from "@google/model-viewer";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("products rotate in the renderer without rewriting the camera and stop on request", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(page.locator(".hero-model-stage")).toHaveAttribute("data-status", "ready", {
    timeout: 30000,
  });
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).click();
  const viewer = page.locator(".hero-model-stage model-viewer");
  const angle = () => viewer.evaluate((e) => -(e as ModelViewerElement).turntableRotation);
  const camera = await viewer.evaluate((e) => (e as ModelViewerElement).cameraOrbit);
  const start = await angle();
  // Use real render frames: the WebGL renderer's animation loop isn't driven by
  // Playwright's fake timer used below to fast-forward product cycling.
  await expect.poll(angle, { timeout: 10000 }).toBeGreaterThan(start + 0.03);
  expect(await viewer.evaluate((e) => (e as ModelViewerElement).cameraOrbit)).toBe(camera);
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  const held = await angle();
  await page.waitForTimeout(400);
  expect(await angle()).toBe(held);
});

test("products cycle automatically, stay selected on click, and resume only on request", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const scene = page.locator(".hero-cinematic");
  const models = page.locator(".hero-model-card");
  await expect(scene).toHaveAttribute("data-cycling", "true", { timeout: 30000 });
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(1);
  await page.clock.fastForward(7100);
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "FEH5KS");
  await expect(
    page.getByRole("list", { name: "จุดเด่น FEH5KS", exact: true }).getByRole("listitem"),
  ).toHaveCount(3);
  await expect(page.locator(".hero-buttons")).toHaveCount(0);
  const wps = page.locator('[data-hero-model="/models/wps10ks.glb"]');
  await page.getByRole("button", { name: "แสดง WPS10KS", exact: true }).click();
  await expect(page.getByRole("list", { name: "จุดเด่น WPS10KS", exact: true })).toContainText(
    "IP67",
  );
  await expect(scene).toHaveAttribute("data-cycle-mode", "pinned");
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(1);
  await page.clock.fastForward(21000);
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "WPS10KS");
  await expect(wps).toHaveAttribute("data-moving", "true");
  await expect(models).toHaveCount(3);
  await page.screenshot({
    path: test.info().outputPath("hero-pinned-borderless.jpg"),
    animations: "disabled",
  });
  await page.getByRole("button", { name: "เล่นวนสินค้าอัตโนมัติ", exact: true }).click();
  await expect(scene).toHaveAttribute("data-cycling", "true");
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(1);
  await page.clock.fastForward(7100);
  await expect(page.locator(".hero-cinematic")).toHaveAttribute(
    "data-active-product",
    "ACS-30-JC21",
  );
  await page.locator("#story").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-cycling", "false");
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(0);
  await page.clock.fastForward(21000);
  await expect(page.locator(".hero-cinematic")).toHaveAttribute(
    "data-active-product",
    "ACS-30-JC21",
  );
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-cycling", "true");
});
