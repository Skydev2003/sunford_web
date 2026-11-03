import { expect, test, type Page } from "@playwright/test";

async function approach(page: Page) {
  const launcher = page.locator("[data-mascot-launcher]");
  const bounds = (await launcher.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  return launcher;
}

test("the mascot replaces the chat button and retains all contact channels plus the shop invitation", async ({
  page,
  request,
}) => {
  await page.goto("/products/acs30-jc21");
  const mascot = page.locator("[data-shop-mascot]");
  await expect(mascot).toHaveCount(1);
  await expect(page.locator(".contact-launcher")).toHaveCount(0);
  expect((await request.get("/images/mascot/walk-right-01.webp")).ok()).toBe(true);
  await expect(mascot).toHaveAttribute("data-frames-ready", "true");
  const start = (await mascot.boundingBox())!.x;
  await expect.poll(async () => (await mascot.boundingBox())!.x).toBeLessThan(start - 5);
  await expect(mascot).toHaveAttribute("data-facing", "left");
  await expect(mascot).toHaveAttribute("data-walking", "true");
  const cycle = await mascot.evaluate((element) => {
    const animation = element
      .getAnimations({ subtree: true })
      .find((animation) => (animation as CSSAnimation).animationName.includes("invitation"))!;
    const bubble = element.querySelector("[data-mascot-invitation]")!;
    animation.pause();
    animation.currentTime = 15500;
    const shown = getComputedStyle(bubble).visibility;
    animation.currentTime = 17500;
    const hidden = getComputedStyle(bubble).visibility;
    animation.currentTime = 30500;
    return { shown, hidden, repeated: getComputedStyle(bubble).visibility };
  });
  expect(cycle).toEqual({ shown: "visible", hidden: "hidden", repeated: "visible" });
  const launcher = await approach(page);
  await expect(mascot).toHaveAttribute("data-walking", "false");
  const bubble = mascot.locator("[data-mascot-invitation]");
  await expect(bubble).toHaveJSProperty("tagName", "BUTTON");
  await expect(bubble).not.toHaveAttribute("href");
  await bubble.click();
  await expect(launcher).toHaveAttribute("aria-expanded", "true");
  const panel = mascot.locator("[data-mascot-contact]");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link")).toHaveCount(4);
  await expect(panel.getByRole("link", { name: /^โทรศัพท์/ })).toHaveAttribute("href", /^tel:/);
  await expect(panel.getByRole("link", { name: /ผ่าน LINE/ })).toHaveAttribute("href", /line\.me/);
  await expect(panel.getByRole("link", { name: "แชทผ่าน Facebook" })).toHaveAttribute(
    "href",
    /m\.me/,
  );
  await expect(panel.getByRole("link", { name: "เยี่ยมชม Sunford Shop" })).toHaveAttribute(
    "href",
    /sunfordshop\.com/,
  );
  await page.keyboard.press("Escape");
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  await expect(launcher).toBeFocused();
  await mascot.getByRole("button", { name: "หยุดการเคลื่อนไหวมาสคอต", exact: true }).click();
  await expect(mascot).toHaveAttribute("data-paused", "true");
  await mascot.getByRole("button", { name: "เล่นการเคลื่อนไหวมาสคอต", exact: true }).click();
  await expect(mascot).toHaveAttribute("data-paused", "false");
});

test("drag direction drives the feet, holding stops them and dragging never opens contact links", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/products/acs30-jc21");
  const mascot = page.locator("[data-shop-mascot]");
  const launcher = await approach(page);
  await expect(mascot).toHaveAttribute("data-frames-ready", "true");
  const before = (await launcher.boundingBox())!;
  const x = before.x + before.width / 2;
  const y = before.y + before.height / 2;
  await page.mouse.down();
  await page.mouse.move(x - 250, y - 200, { steps: 20 });
  await expect(mascot).toHaveAttribute("data-dragging", "true");
  await expect(mascot).toHaveAttribute("data-facing", "left");
  const phase = await mascot.evaluate((element) => element.getAttribute("style"));
  await page.mouse.move(x - 170, y - 160, { steps: 12 });
  await expect(mascot).toHaveAttribute("data-facing", "right");
  await page.screenshot({ path: test.info().outputPath("dragging-clear-64-frames.png") });
  expect(await mascot.evaluate((element) => element.getAttribute("style"))).not.toBe(phase);
  const held = await mascot.evaluate((element) =>
    [
      element.style.getPropertyValue("--walk-frame-x"),
      element.style.getPropertyValue("--walk-frame-y"),
    ].join("/"),
  );
  await page.waitForTimeout(200);
  expect(
    await mascot.evaluate((element) =>
      [
        element.style.getPropertyValue("--walk-frame-x"),
        element.style.getPropertyValue("--walk-frame-y"),
      ].join("/"),
    ),
  ).toBe(held);
  await page.mouse.up();
  await expect(mascot).toHaveAttribute("data-dragging", "false");
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  expect(page.context().pages()).toHaveLength(1);
  const after = (await launcher.boundingBox())!;
  expect(before.x - after.x).toBeGreaterThan(140);
  expect(before.y - after.y).toBeGreaterThan(130);
  await approach(page);
  await page.mouse.down();
  await page.mouse.move(2, 2, { steps: 15 });
  await page.mouse.up();
  const edge = (await mascot.boundingBox())!;
  expect(edge.x).toBeGreaterThanOrEqual(15);
  expect(edge.y).toBeGreaterThanOrEqual(0);
  await page.mouse.move(1200, 500);
  await expect(mascot).toHaveAttribute("data-walking", "true");
  await approach(page);
  await launcher.click();
  await page.screenshot({ path: test.info().outputPath("dragged-mascot-contact-desktop.png") });
});

test("one mascot remains across site pages and its panel fits mobile with reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/products/feh5ks", "/service", "/contact-us"]) {
    await page.goto(route);
    await expect(page.locator("[data-shop-mascot]")).toHaveCount(1);
    await expect(page.locator(".contact-launcher")).toHaveCount(0);
  }
  const mascot = page.locator("[data-shop-mascot]");
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const launcher = await approach(page);
    await launcher.click();
    await expect(mascot.locator("[data-mascot-contact]")).toBeVisible();
    const result = await mascot.evaluate((element) => ({
      animations: element
        .getAnimations({ subtree: true })
        .filter((animation) => animation.playState === "running").length,
      bounds: Array.from(
        element.querySelectorAll("[data-mascot-contact] a, [data-mascot-launcher], button"),
      ).map((element) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.x, right: rect.right, y: rect.y, bottom: rect.bottom };
      }),
    }));
    expect(result.animations).toBe(0);
    for (const bounds of result.bounds) {
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(width);
      expect(bounds.y).toBeGreaterThanOrEqual(0);
      expect(bounds.bottom).toBeLessThanOrEqual(900);
    }
    if (width !== 320)
      await page.screenshot({ path: test.info().outputPath(`global-mascot-${width}.png`) });
    await page.keyboard.press("Escape");
  }
});

test.describe("touch dragging", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("touch hold and drag moves the mascot without opening the contact panel", async ({
    page,
  }) => {
    await page.goto("/products/acs30-jc21");
    const mascot = page.locator("[data-shop-mascot]");
    const launcher = page.locator("[data-mascot-launcher]");
    await expect(mascot).toHaveAttribute("data-frames-ready", "true");
    const before = (await launcher.boundingBox())!;
    const x = before.x + before.width / 2;
    const y = before.y + before.height / 2;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 12; step++)
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x - step * 8, y: y - step * 12 }],
      });
    await expect(mascot).toHaveAttribute("data-dragging", "true");
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect((await launcher.boundingBox())!.y).toBeLessThan(before.y - 100);
    await cdp.detach();
  });
});

test("the retained mascot stays painted through sheet boundaries, loop wrap and hover", async ({
  page,
}) => {
  await page.goto("/service");
  const mascot = page.locator("[data-shop-mascot]");
  await expect(mascot).toHaveAttribute("data-frames-ready", "true");
  await page.mouse.move(0, 100);
  const result = await mascot.locator("canvas").evaluate(async (canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d")!;
    const frames: number[] = [];
    let minimum = Infinity;
    const started = performance.now();
    let sampled = 0;
    while (performance.now() - started < 12000) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (performance.now() - sampled < 60) continue;
      sampled = performance.now();
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let opaque = 0;
      for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 180) opaque++;
      minimum = Math.min(minimum, opaque);
      frames.push(Number(canvas.dataset.frame));
      if (
        frames.length > 25 &&
        new Set(frames).size > 20 &&
        frames.some((frame, index) => index > 0 && frame < frames[index - 1])
      )
        break;
    }
    return {
      minimum,
      count: frames.length,
      unique: new Set(frames).size,
      wrapped: frames.some((frame, index) => index > 0 && frame < frames[index - 1]),
    };
  });
  expect(result.minimum).toBeGreaterThan(1000);
  expect(result.count).toBeGreaterThan(25);
  expect(result.unique).toBeGreaterThan(20);
  expect(result.wrapped).toBe(true);
  await approach(page);
  const before = await mascot
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await page.waitForTimeout(300);
  expect(
    await mascot.locator("canvas").evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()),
  ).toBe(before);
  await expect(mascot.locator("canvas")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: test.info().outputPath("continuous-painted-mascot.png") });
});
