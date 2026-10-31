import { expect, test } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

test("all bubbles rise smoothly and return to their random origin, including the profit badge", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const bubbles = page.locator(".hero-bubble-layer .hero-floating-bubble");
  await expect(bubbles).toHaveCount(4);
  const start = await bubbles.evaluateAll((elements) =>
    elements.map((e) => {
      const b = e.getBoundingClientRect();
      return { x: b.x, y: b.y };
    }),
  );
  const pops = page.locator(".hero-bubble-layer .hero-feature-pop");
  await expect(pops).toHaveCount(4);
  for (const pop of await pops.all()) {
    await expect(pop).toHaveCSS("animation-name", "hero-feature-pop");
    const duration = await pop.evaluate((e) => parseFloat(getComputedStyle(e).animationDuration));
    expect(duration).toBeGreaterThanOrEqual(2.5);
    expect(duration).toBeLessThanOrEqual(2.9);
  }
  const firstTransform = await pops.first().evaluate((e) => {
    // Sample a fresh entrance even when slow browser assertions outlast the first one.
    const animation = e.getAnimations()[0];
    animation.currentTime = 0;
    animation.play();
    return getComputedStyle(e).transform;
  });
  await expect
    .poll(() => pops.first().evaluate((e) => getComputedStyle(e).transform))
    .not.toBe(firstTransform);
  await expect
    .poll(() =>
      pops.evaluateAll((elements) =>
        elements.every((e) => e.getAnimations().every((a) => a.playState === "finished")),
      ),
    )
    .toBe(true);
  for (const surface of await page
    .locator(".hero-bubble-layer .hero-feature-bubble, .hero-bubble-layer .hero-value-badge")
    .all()) {
    await expect(surface).toHaveCSS("animation-name", "hero-feature-float");
    expect(await surface.evaluate((e) => getComputedStyle(e).backgroundImage)).not.toContain(
      "rgba(",
    );
  }
  await page.screenshot({ path: test.info().outputPath("smaller-bubbles.png") });
  for (const index of [1, 3]) {
    const bubble = bubbles.nth(index);
    const handle = bubble.getByRole("button");
    const home = (await handle.boundingBox())!;
    await page.mouse.move(home.x + home.width / 2, home.y + home.height / 2);
    await page.mouse.down();
    await page.mouse.move(70, 70, { steps: 10 });
    await expect(bubble).toHaveAttribute("data-dragging", "true");
    expect(
      await handle.evaluate((e) => {
        const r = e.getBoundingClientRect();
        return e.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
      }),
    ).toBe(true);
    await page.mouse.up();
    await expect(bubble).toHaveAttribute("data-returning", "true");
    expect((await handle.boundingBox())!.x).toBeLessThan(home.x - 100);
    await expect(bubble.locator(".hero-feature-pop")).toHaveCSS("animation-name", "none");
    await expect.poll(async () => (await handle.boundingBox())!.x).toBeCloseTo(home.x, 0);
    await expect.poll(async () => (await handle.boundingBox())!.y).toBeCloseTo(home.y, 0);
    await expect(bubble).toHaveAttribute("data-returning", "false");
    await expect(bubble).toHaveAttribute("data-bubble-pinned", "false");
  }
  const handle = bubbles.nth(1).getByRole("button");
  await handle.focus();
  await page.keyboard.down("ArrowRight");
  await expect(bubbles.nth(1)).toHaveAttribute("data-bubble-pinned", "true");
  expect((await handle.boundingBox())!.x).toBeCloseTo(start[1].x + 10, 0);
  await page.keyboard.up("ArrowRight");
  await expect.poll(async () => (await handle.boundingBox())!.x).toBeCloseTo(start[1].x, 0);
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const next = await bubbles.evaluateAll((elements) =>
    elements.map((e) => {
      const b = e.getBoundingClientRect();
      return { x: b.x, y: b.y };
    }),
  );
  expect(next).not.toEqual(start);
  await expect(bubbles.nth(3).locator(".hero-feature-pop")).toHaveCSS(
    "animation-name",
    "hero-feature-pop",
  );
});

test("return can be interrupted, follows scrolling, and is immediate with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const bubble = page.locator(".hero-floating-value");
  const handle = bubble.getByRole("button");
  const home = (await handle.boundingBox())!;
  await page.mouse.move(home.x + home.width / 2, home.y + home.height / 2);
  await page.mouse.down();
  await page.mouse.move(200, 500, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  const client = await page.context().newCDPSession(page);
  const moving = (await handle.boundingBox())!;
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: moving.x + moving.width / 2,
    y: moving.y + moving.height / 2,
    button: "left",
    clickCount: 1,
  });
  await expect(bubble).toHaveAttribute("data-dragging", "true");
  const caught = (await handle.boundingBox())!;
  expect(Math.abs(caught.x - moving.x)).toBeLessThan(40);
  expect(Math.abs(caught.y - moving.y)).toBeLessThan(40);
  await page.evaluate(() => scrollTo(0, 300));
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(300);
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: caught.x + caught.width / 2,
    y: caught.y + caught.height / 2,
    button: "left",
    clickCount: 1,
  });
  await expect.poll(async () => (await handle.boundingBox())!.y).toBeCloseTo(home.y - 300, 0);
  await client.detach();
  await page.evaluate(() => scrollTo(0, 0));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(bubble.locator(".hero-value-badge")).toHaveCSS("animation-name", "none");
  await expect.poll(async () => (await handle.boundingBox())!.y).toBeCloseTo(home.y, 0);
  await page.mouse.move(home.x + home.width / 2, home.y + home.height / 2);
  await page.mouse.down();
  await page.mouse.move(150, 400, { steps: 6 });
  await page.mouse.up();
  expect((await handle.boundingBox())!.x).toBeCloseTo(home.x, 0);
  await expect(bubble).toHaveCSS("transition-duration", "0s");
});

test.describe("touch bubbles", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test("touch release returns home without scrolling; cancellation and reduced motion remain readable", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).tap();
    const bubble = page.locator(".hero-bubble-layer li").nth(1);
    const handle = bubble.getByRole("button");
    const box = (await handle.boundingBox())!;
    const client = await page.context().newCDPSession(page);
    const start = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    for (const end of ["touchCancel", "touchEnd"] as const) {
      await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: start.x + 160, y: start.y - 150 }],
      });
      await expect(bubble).toHaveAttribute("data-dragging", "true");
      expect((await handle.boundingBox())!.x).toBeGreaterThan(box.x + 100);
      await client.send("Input.dispatchTouchEvent", { type: end, touchPoints: [] });
      await expect(bubble).toHaveAttribute("data-bubble-pinned", "false");
      await expect.poll(async () => (await handle.boundingBox())!.x).toBeCloseTo(box.x, 0);
      await expect.poll(async () => (await handle.boundingBox())!.y).toBeCloseTo(box.y, 0);
      expect(await page.evaluate(() => scrollY)).toBe(0);
    }
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(bubble.locator(".hero-feature-bubble")).toHaveCSS("animation-name", "none");
    await expect(bubble.locator(".hero-feature-text")).toBeVisible();
    await page.screenshot({ path: test.info().outputPath("smaller-bubbles-mobile.png") });
    await client.detach();
  });
});
