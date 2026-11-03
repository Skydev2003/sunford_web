import { expect, test } from "@playwright/test";

// Historical Hero 3D interaction contract, explicitly replaced by the image studio.
test.skip(
  true,
  "Retired homepage 3D/bubbles/ribbon; replacement coverage: hero-scene.spec.ts and hero-header-scroll.spec.ts. Product-page 3D remains covered by product-model.spec.ts.",
);

test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ["--enable-unsafe-swiftshader"] },
});

test("scrolling away freezes every bubble and fades it out; returning replays the rise", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const layer = page.locator(".hero-bubble-layer");
  const bubbles = layer.locator(".hero-floating-bubble");
  const positions = () =>
    bubbles.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { x: box.x, y: box.y };
      }),
    );
  const home = await positions();
  const badge = layer.locator(".hero-floating-value");
  const handle = badge.getByRole("button");
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(250, 400, { steps: 8 });
  await page.mouse.up();
  await expect(badge).toHaveAttribute("data-returning", "true");
  await page.mouse.wheel(0, 760);
  await expect(layer).toHaveAttribute("data-in-view", "false");
  await expect(layer).toHaveAttribute("inert", "");
  const frozen = await positions();
  const float = await badge
    .locator(".hero-value-badge")
    .evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(220);
  const opacity = Number(await layer.evaluate((e) => getComputedStyle(e).opacity));
  expect(opacity).toBeGreaterThan(0);
  expect(opacity).toBeLessThan(1);
  await page.screenshot({ path: test.info().outputPath("bubbles-fading.png") });
  await page.mouse.wheel(0, 200);
  expect(await positions()).toEqual(frozen);
  expect(
    await badge.locator(".hero-value-badge").evaluate((e) => getComputedStyle(e).transform),
  ).toBe(float);
  await expect(layer).toBeHidden();
  await expect(layer).toHaveCSS("opacity", "0");

  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "true");
  await expect(layer).not.toHaveAttribute("inert");
  expect(await positions()).toEqual(home);
  for (const pop of await layer.locator(".hero-feature-pop").all()) {
    await expect(pop).toHaveCSS("animation-name", "hero-feature-pop");
  }
  const firstPop = layer.locator(".hero-feature-pop").first();
  expect(Number(await firstPop.evaluate((e) => getComputedStyle(e).opacity))).toBeLessThan(1);
  await expect(firstPop).toHaveCSS("opacity", "1");
  await expect(layer).toHaveCSS("opacity", "1");
  await page.screenshot({ path: test.info().outputPath("bubbles-returned.png") });
});

test("fast scroll reversal restarts the rise and still waits for the closing menu", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const layer = page.locator(".hero-bubble-layer");
  await page.evaluate(() => scrollTo({ top: 760, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "false");
  await page.waitForTimeout(120);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "true");
  await expect(layer).toHaveCSS("opacity", "1");
  await page.waitForTimeout(950);
  await expect(layer).toBeVisible();

  await page.evaluate(() => scrollTo({ top: 760, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "false");
  await page.locator(".desktop-nav a").first().focus();
  await expect(page.locator(".nav-backdrop")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "true");
  await expect(layer).toBeHidden();
  await expect(layer).toBeVisible();
  await expect(page.locator(".nav-backdrop")).toBeHidden();
  await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS(
    "animation-name",
    "hero-feature-pop",
  );
});

test("mobile keeps bubbles during Hero scrolling and respects pause and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const layer = page.locator(".hero-bubble-layer");
  await page.evaluate(() => scrollTo({ top: 300, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "true");
  await expect(layer).not.toHaveAttribute("inert");
  await page.evaluate(() => scrollTo({ top: 1000, behavior: "instant" }));
  await expect(layer).toHaveAttribute("data-in-view", "false");
  await expect(layer).toBeHidden();
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(layer).toBeVisible();
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await page.evaluate(() => scrollTo({ top: 1000, behavior: "instant" }));
  await expect(layer).toBeHidden();
  await expect(layer).toHaveCSS("transition-duration", "0s");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(layer).toBeVisible();
  await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS("animation-name", "none");
  await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.evaluate(() => scrollTo({ top: 1000, behavior: "instant" }));
  await expect(layer).toBeHidden();
  await expect(layer).toHaveCSS("transition-duration", "0s");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(layer).toBeVisible();
  await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS("animation-name", "none");
  await page.screenshot({ path: test.info().outputPath("bubbles-returned-mobile.png") });
});
