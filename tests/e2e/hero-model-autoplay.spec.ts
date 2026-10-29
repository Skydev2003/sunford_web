import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("products turn continuously, cycle automatically, stay selected on click, and resume only on request", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.clock.install();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const scene = page.locator(".hero-cinematic");
  const models = page.locator(".hero-model-card");
  await expect(scene).toHaveAttribute("data-cycling", "true", { timeout: 30000 });
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(3);
  const acs = page.locator('[data-hero-model="/models/acs30-jc21.glb"]');
  const angle = () =>
    acs
      .locator("model-viewer")
      .evaluate((element) =>
        parseFloat((element as HTMLElement & { cameraOrbit: string }).cameraOrbit),
      );
  const start = await angle();
  // A continuous turn travels beyond the former small oscillation.
  await page.clock.runFor(2500);
  expect((await angle()) - start).toBeGreaterThan(0.3);
  await page.clock.fastForward(7100);
  await expect(page.locator(".hero-model")).toContainText("FEH5KS");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute("href", "/products/feh5ks");
  const wps = page.locator('[data-hero-model="/models/wps10ks.glb"]');
  await wps.getByRole("button").click();
  await expect(scene).toHaveAttribute("data-cycle-mode", "pinned");
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(0);
  const held = await wps
    .locator("model-viewer")
    .evaluate((element) => (element as HTMLElement & { cameraOrbit: string }).cameraOrbit);
  await page.clock.fastForward(21000);
  await expect(page.locator(".hero-model")).toContainText("WPS10KS");
  expect(
    await wps
      .locator("model-viewer")
      .evaluate((element) => (element as HTMLElement & { cameraOrbit: string }).cameraOrbit),
  ).toBe(held);
  await expect(models).toHaveCount(3);
  await page.screenshot({
    path: test.info().outputPath("hero-pinned-borderless.jpg"),
    animations: "disabled",
  });
  await expect(page.locator(".hero-model-preview button").first()).toHaveText("");
  await expect(page.locator(".hero-model-preview button").first()).toHaveCSS(
    "border-top-width",
    "0px",
  );

  await page.getByRole("button", { name: "เล่นวนสินค้าอัตโนมัติ", exact: true }).click();
  await expect(scene).toHaveAttribute("data-cycling", "true");
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(3);
  await page.clock.fastForward(7100);
  await expect(page.locator(".hero-model")).toContainText("ACS-30-JC21");
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-cycling", "false");
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(0);
  await page.clock.fastForward(21000);
  await expect(page.locator(".hero-model")).toContainText("ACS-30-JC21");
  await scene.scrollIntoViewIfNeeded();
  await expect(scene).toHaveAttribute("data-cycling", "true");
});
