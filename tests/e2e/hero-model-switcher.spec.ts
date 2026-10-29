import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("real 3D previews swap with the main product without refetching or recreating viewers", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests = new Map<string, number>();
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/models/") && path.endsWith(".glb"))
      requests.set(path, (requests.get(path) ?? 0) + 1);
  });
  await page.goto("/");
  for (const name of ["acs30-jc21", "feh5ks", "wps10ks"]) {
    await expect(page.locator(`[data-hero-model="/models/${name}.glb"]`)).toHaveAttribute(
      "data-status",
      "ready",
      { timeout: 30000 },
    );
  }
  const acs = page.locator('[data-hero-model="/models/acs30-jc21.glb"]');
  const feh = page.locator('[data-hero-model="/models/feh5ks.glb"]');
  const wps = page.locator('[data-hero-model="/models/wps10ks.glb"]');
  const original = await acs.locator("model-viewer").elementHandle();
  const target = await feh.locator("model-viewer").elementHandle();
  await expect(page.locator(".hero-model-preview")).toHaveCount(2);
  await expect(page.locator(".hero-model-card model-viewer")).toHaveCount(3);
  await expect(page.locator('.hero-model-preview[data-moving="true"]')).toHaveCount(2);
  const fehSlot = await feh.getAttribute("data-slot");
  expect(fehSlot).toBe("1");
  await feh.getByRole("button").click();
  await expect(page.locator(".hero-model")).toContainText("FEH5KS");
  await expect(feh).toHaveClass(/hero-model-stage/);
  await expect(feh).toHaveAttribute("data-moving", "false");
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-cycle-mode", "pinned");
  await expect(acs).toHaveAttribute("data-slot", "2");
  await expect(wps).toHaveAttribute("data-slot", "1");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute("href", "/products/feh5ks");
  await expect
    .poll(() =>
      feh.evaluate(
        (element) =>
          element.getAnimations().filter((animation) => animation.playState === "running").length,
      ),
    )
    .toBe(0);
  expect(
    await target!.evaluate(
      (element) => element.isConnected && element.closest(".hero-model-stage") !== null,
    ),
  ).toBe(true);
  expect(await original!.evaluate((element) => element.isConnected)).toBe(true);
  await expect.poll(() => acs.evaluate((element) => element.style.width)).toBe("");
  await page.screenshot({ path: test.info().outputPath("hero-feh-main.jpg") });

  await wps.getByRole("button").click();
  await expect(wps).toHaveClass(/hero-model-stage/);
  await expect(feh).toHaveAttribute("data-slot", "2");
  await expect(acs).toHaveAttribute("data-slot", "1");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/wps10ks",
  );
  // Stationary carousel controls can interrupt an in-flight swap safely.
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  await expect(feh).toHaveClass(/hero-model-stage/);
  await expect(page.locator(".hero-model-stage")).toHaveCount(1);
  await expect(page.locator(".hero-model-preview")).toHaveCount(2);
  await expect(page.locator(".hero-model-card model-viewer")).toHaveCount(3);
  expect(Object.fromEntries(requests)).toEqual({
    "/models/acs30-jc21.glb": 1,
    "/models/feh5ks.glb": 1,
    "/models/wps10ks.glb": 1,
  });
  // Keyboard selection transfers focus to the promoted model's camera controls.
  const acsButton = acs.getByRole("button");
  await acsButton.focus();
  await acsButton.press("Enter");
  await expect(acs).toHaveClass(/hero-model-stage/);
  await expect(acs.locator("model-viewer")).toBeFocused();
});

test.describe("touch previews", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test("tap promotes the real model on mobile and reduced motion skips the swap animation", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const wps = page.locator('[data-hero-model="/models/wps10ks.glb"]');
    await expect(wps).toHaveAttribute("data-status", "ready", { timeout: 30000 });
    await expect(wps.locator("model-viewer")).toHaveJSProperty("loaded", true);
    await wps.getByRole("button").tap();
    await expect(wps).toHaveClass(/hero-model-stage/);
    await expect(page.locator(".hero-model")).toContainText("WPS10KS");
    await expect(wps).toHaveAttribute("data-moving", "false");
    expect(await wps.evaluate((element) => element.getAnimations().length)).toBe(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
      "href",
      "/products/wps10ks",
    );
    await page.screenshot({ path: test.info().outputPath("hero-touch-wps.jpg") });
    await page
      .getByRole("button", { name: "แสดงโมเดล ACS-30-JC21 เป็นตัวหลัก", exact: true })
      .tap();
    await expect(page.locator(".hero-model")).toContainText("ACS-30-JC21");
  });
});
