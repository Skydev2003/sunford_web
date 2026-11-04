import { expect, test, type Locator } from "@playwright/test";
import { createOrbitFrames, type OrbitPose } from "../../src/features/home/components/hero-orbit";

test.use({ reducedMotion: "reduce" });

test("orbit keyframes resolve shared layer tokens in the browser", async ({ page }) => {
  await page.goto("/");
  const seats = [
    { x: 300, y: 300 },
    { x: 100, y: 100 },
    { x: 500, y: 100 },
  ];
  const pose = (slot: number): OrbitPose => ({
    slot,
    box: { x: seats[slot].x - 50, y: seats[slot].y - 50, width: 100, height: 100 },
    opacity: 1,
  });
  const paths = [0, 1, 2].map(
    (slot) => createOrbitFrames(pose(slot), pose((slot + 2) % 3), seats, 1).layout,
  );
  const samples = await page.evaluate(async (paths) => {
    const element = document.createElement("div");
    element.style.position = "absolute";
    document.body.append(element);
    const values: { actual: number; expected: number }[] = [];
    try {
      for (const frames of paths) {
        const animation = element.animate(frames, { duration: 1000, fill: "both" });
        animation.pause();
        await animation.ready;
        for (const frame of frames) {
          animation.currentTime = Number(frame.offset) * 1000;
          const style = getComputedStyle(element);
          const token = String(frame.zIndex).match(/var\((--[^)]+)\)/)![1];
          values.push({
            actual: Number(style.zIndex),
            expected: Number(style.getPropertyValue(token)),
          });
        }
        animation.cancel();
      }
    } finally {
      element.remove();
    }
    return values;
  }, paths);
  expect(new Set(samples.map((sample) => sample.actual)).size).toBeGreaterThanOrEqual(3);
  for (const sample of samples) {
    expect(sample.actual).toBe(sample.expected);
    expect(sample.actual).toBeGreaterThanOrEqual(0);
    expect(sample.actual).toBeLessThanOrEqual(50);
  }
});

async function expectHitTarget(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const box = element.getBoundingClientRect();
        return element.contains(
          document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
        );
      }),
    )
    .toBe(true);
}

async function expectLayer(locator: Locator, minimum: number, maximum: number) {
  const value = await locator.evaluate((element) => Number(getComputedStyle(element).zIndex));
  expect(value).toBeGreaterThanOrEqual(minimum);
  expect(value).toBeLessThanOrEqual(maximum);
}

test("the Header stays above a layout portal in the document context", async ({ page }) => {
  await page.goto("/");
  const brand = page.locator(".site-header .brand");
  const box = (await brand.boundingBox())!;
  await page.evaluate((box) => {
    const portal = document.createElement("div");
    portal.dataset.layerFixture = "layout";
    portal.style.cssText = `position:fixed;left:${box.x}px;top:${box.y}px;width:${box.width}px;height:${box.height}px;z-index:var(--z-floating);pointer-events:auto`;
    document.body.append(portal);
  }, box);
  try {
    await expectHitTarget(brand);
  } finally {
    await page.locator('[data-layer-fixture="layout"]').evaluate((element) => element.remove());
  }
});

for (const viewport of [
  { width: 320, height: 700 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 844, height: 390 },
  { width: 1440, height: 900 },
]) {
  test(`navigation layers preserve real click targets at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const header = page.locator(".site-header");
    await expectLayer(header, 10, 50);
    await expectHitTarget(header.locator(".brand"));
    const desktop = viewport.width >= 1400;
    if (desktop) {
      await page.locator(".desktop-nav").getByRole("link", { name: "สินค้า", exact: true }).focus();
      await page.keyboard.press("ArrowDown");
      const panel = page.locator(".desktop-submenu");
      await expect(panel).toBeVisible();
      await expectLayer(panel, 100, 500);
      await expectLayer(page.locator(".nav-backdrop"), 100, 500);
      await expectHitTarget(panel.getByRole("link", { name: "สินค้าทั้งหมด", exact: true }));
      await expectHitTarget(header.locator(".brand"));
      await expectLayer(header, 100, 500);
      await page.locator(".nav-backdrop").click({ position: { x: 10, y: viewport.height - 10 } });
      await expect(panel).toHaveAttribute("aria-hidden", "true");
    } else {
      const toggle = page.getByRole("button", { name: "เปิดเมนู", exact: true });
      await toggle.click();
      const menu = page.getByRole("navigation", { name: "เมนูมือถือ" });
      await expect(menu).toBeVisible();
      await expectLayer(menu, 100, 500);
      await expectHitTarget(page.getByRole("button", { name: "ปิดเมนู", exact: true }));
      await page.keyboard.press("Escape");
      await expect(menu).toHaveCount(0);
    }
    await expectLayer(header, 10, 50);
    const search = page.getByRole("button", { name: "ค้นหาสินค้า", exact: true });
    await expectHitTarget(search);
    await search.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toHaveText("ค้นหาสินค้า");
    await expectLayer(tooltip, 100, 500);
    await expectHitTarget(tooltip);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`navigation-${viewport.width}.png`) });
  });
}

for (const width of [1440, 390]) {
  test(`native dialog stays above critical content and keeps its tooltip at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
    await expect(dialog).toBeVisible();
    await expectLayer(dialog, 1000, 5000);
    const backdrop = await dialog.evaluate((element) =>
      Number(getComputedStyle(element, "::backdrop").zIndex),
    );
    expect(backdrop).toBeGreaterThanOrEqual(1000);
    expect(backdrop).toBeLessThanOrEqual(5000);
    await page.evaluate(() => {
      const critical = document.createElement("div");
      critical.dataset.layerFixture = "critical";
      critical.style.cssText =
        "position:fixed;inset:0;z-index:var(--z-critical);background:#ff000008";
      document.body.append(critical);
    });
    const fixture = page.locator('[data-layer-fixture="critical"]');
    await expectLayer(fixture, 9999, Number.MAX_SAFE_INTEGER);
    const field = dialog.getByRole("textbox");
    await expectHitTarget(field);
    await field.fill("FEH5KS");
    await expect(dialog.locator(".search-results")).toContainText("FEH5KS");
    const close = dialog.getByRole("button", { name: "ปิด", exact: true });
    await field.press("Shift+Tab");
    await expect(close).toBeFocused();
    const tooltip = dialog.getByRole("tooltip");
    await expect(tooltip).toHaveText("ปิด");
    await expectLayer(tooltip, 100, 500);
    await expectHitTarget(tooltip);
    expect(await dialog.evaluate((element) => element.matches(":modal"))).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`dialog-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(tooltip).toHaveCount(0);
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await fixture.evaluate((element) => element.remove());
    await expectHitTarget(page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }));
    expect(errors).toEqual([]);
  });
}
