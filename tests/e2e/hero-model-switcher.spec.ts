import { expect, test, type Page } from "@playwright/test";

// Historical Hero 3D interaction contract, explicitly replaced by the image studio.
test.skip(
  true,
  "Retired homepage 3D/bubbles/ribbon; replacement coverage: hero-scene.spec.ts and hero-header-scroll.spec.ts. Product-page 3D remains covered by product-model.spec.ts.",
);

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

async function ready(page: Page) {
  await page.goto("/");
  for (const name of ["acs30-jc21", "feh5ks", "wps10ks"]) {
    await expect(page.locator(`[data-hero-model="/models/${name}.glb"]`)).toHaveAttribute(
      "data-status",
      "ready",
      { timeout: 30000 },
    );
  }
}

test("ribbon selection reuses cached real models and keeps product facts and models in sync", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  const requests = new Map<string, number>();
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/models/") && path.endsWith(".glb"))
      requests.set(path, (requests.get(path) ?? 0) + 1);
  });
  await ready(page);
  const original = await page
    .locator('[data-hero-model="/models/acs30-jc21.glb"] model-viewer')
    .elementHandle();
  await expect(page.locator('.hero-model-card[data-moving="true"]')).toHaveCount(1);
  await expect(page.locator(".hero-model-standby")).toHaveCount(2);
  const card = page.getByRole("button", { name: "เลือกชม FEH5KS", exact: true });
  await card.focus();
  await card.press("Enter");
  await expect(page.locator("[data-hero-ribbon]")).toHaveAttribute("data-running", "true");
  await expect(page.locator(".hero-model")).toContainText("SUNFORD");
  await expect(page.locator(".hero-description")).toContainText("บริการหลังการขาย");
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "FEH5KS");
  await expect(page.locator(".hero-buttons")).toHaveCount(0);
  await expect(page.locator(".hero-model-stage model-viewer")).toHaveJSProperty(
    "src",
    "/models/feh5ks.glb",
  );
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-cycle-mode", "pinned");
  await page.getByRole("button", { name: "แสดง WPS10KS", exact: true }).click();
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  expect(
    await original!.evaluate(
      (element) => element.isConnected && element.closest(".hero-model-stage") !== null,
    ),
  ).toBe(true);
  expect(Object.fromEntries(requests)).toEqual({
    "/models/acs30-jc21.glb": 1,
    "/models/feh5ks.glb": 1,
    "/models/wps10ks.glb": 1,
  });
});

test("photo drag promotes the linked model while invalid drops and Escape preserve selection", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  const scene = page.locator(".hero-showroom");
  const zone = (await page.locator("[data-hero-dropzone]").boundingBox())!;
  async function start(index: number) {
    await page.keyboard.press("Tab");
    const card = page.locator(`[data-ribbon-card="${index}"]`);
    await card.focus();
    const box = (await card.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(zone.x + zone.width / 2, zone.y + zone.height / 2, { steps: 15 });
  }
  await start(1);
  await expect(scene).toHaveAttribute("data-product-drag", "true");
  await expect(scene).toHaveAttribute("data-product-drop", "true");
  await expect(page.locator("[data-hero-studio]")).toHaveAttribute("data-running", "false");
  await expect(page.locator("[data-hero-ribbon]")).toHaveAttribute("data-running", "true");
  await page.screenshot({ path: test.info().outputPath("hero-dragging-photo.jpg") });
  await page.mouse.up();
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "FEH5KS");
  await expect(page.locator(".hero-model-stage model-viewer")).toHaveJSProperty(
    "src",
    "/models/feh5ks.glb",
  );
  await expect(page.getByRole("status").filter({ hasText: "แสดงโมเดล FEH5KS แล้ว" })).toHaveCount(
    1,
  );
  await expect(scene).not.toHaveAttribute("data-product-drag", "true");
  await page.waitForTimeout(550);
  await start(2);
  await page.mouse.move(30, 300, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "FEH5KS");
  await page.waitForTimeout(550);
  await start(2);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "FEH5KS");
});

test("ribbon cards remain attached to their band at the sides and rear throughout a turn", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const ribbon = page.locator("[data-hero-ribbon]");
  await expect(ribbon).toHaveAttribute("data-static", "false");
  const unsupported = await ribbon.evaluate((element) => {
    const cards = Array.from(element.querySelectorAll<HTMLElement>("[data-ribbon-card]"));
    const surfaces = Array.from(
      element.parentElement!.querySelectorAll<SVGPathElement>("[data-ring-surface]"),
    );
    const misses: string[] = [];
    for (const phase of [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875]) {
      cards.forEach((card) =>
        card.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = Number(animation.effect!.getTiming().duration) * phase;
        }),
      );
      for (const card of cards) {
        if (card.hidden || Number(getComputedStyle(card).opacity) < 0.1) continue;
        const style = getComputedStyle(card);
        const matrix = new DOMMatrix(style.transform);
        const [ox, oy] = style.transformOrigin.split(" ").map(Number.parseFloat);
        const width = Number.parseFloat(style.width);
        const height = Number.parseFloat(style.height);
        const viewport = element.getBoundingClientRect();
        // Check the visible perimeter, not only the center: upright cards can have
        // their centers on the track while their upper corners cross its red rim.
        for (const [x, y] of [
          [14, 2],
          [width / 2, 2],
          [width - 14, 2],
          [14, height - 2],
          [width / 2, height - 2],
          [width - 14, height - 2],
          [2, height / 2],
          [width - 2, height / 2],
        ]) {
          const point = matrix.transformPoint(new DOMPoint(x - ox, y - oy));
          const screen = new DOMPoint(
            viewport.x + card.offsetLeft + ox + point.x / point.w,
            viewport.y + card.offsetTop + oy + point.y / point.w,
          );
          if (screen.x < 0 || screen.x > innerWidth || screen.y < 0 || screen.y > innerHeight)
            continue;
          const supported = surfaces.some((surface) => {
            const railMatrix = surface.getScreenCTM();
            return (
              railMatrix && surface.isPointInFill(screen.matrixTransform(railMatrix.inverse()))
            );
          });
          if (!supported) misses.push(`${phase}:${card.dataset.ribbonCard}:${x},${y}`);
        }
      }
    }
    return misses;
  });
  expect(unsupported).toEqual([]);
});

for (const width of [320, 390, 430, 768, 1440]) {
  test(`ribbon cards stay bounded through a complete interpolated turn at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const ribbon = page.locator("[data-hero-ribbon]");
    await expect(ribbon).toHaveAttribute("data-static", "false");
    const oversized = await ribbon.evaluate((element) => {
      const card = element.querySelector<HTMLElement>('[data-ribbon-card="0"]')!;
      const animation = card.getAnimations()[0];
      animation.pause();
      const duration = Number(animation.effect!.getTiming().duration);
      const failures: { phase: number; width: number; height: number }[] = [];
      // Include intermediate frames: keyframe-only checks miss matrix decomposition spikes.
      for (let step = 0; step <= 1920; step++) {
        animation.currentTime = (duration * step) / 1920;
        const box = card.getBoundingClientRect();
        if (box.width > card.offsetWidth * 1.25 || box.height > card.offsetHeight * 2) {
          failures.push({ phase: step / 1920, width: box.width, height: box.height });
        }
      }
      return failures.slice(0, 8);
    });
    expect(oversized).toEqual([]);
  });
}

test("ribbon loops independently of pinned models and pauses for controls, offscreen and reduced motion", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await ready(page);
  const ribbon = page.locator("[data-hero-ribbon]");
  await expect(ribbon).toHaveAttribute("data-running", "true");
  const card = page.locator('[data-ribbon-card="2"]');
  const transform = () => card.evaluate((element) => getComputedStyle(element).transform);
  const initial = await transform();
  await expect.poll(transform).not.toBe(initial);
  const sheen = page.locator("[data-ribbon-glint]").first();
  const initialLight = await sheen.evaluate((element) => element.style.transform);
  const flow = page.locator("[data-studio-flow]");
  const initialFlow = await flow.getAttribute("style");
  await page.mouse.move(1100, 740);
  await expect.poll(() => flow.getAttribute("style")).not.toBe(initialFlow);
  await expect.poll(() => sheen.evaluate((element) => element.style.transform)).toBe(initialLight);
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  await expect(ribbon).toHaveAttribute("data-running", "true");
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await expect(ribbon).toHaveAttribute("data-running", "false");
  await expect
    .poll(() =>
      card.evaluate((element) =>
        element
          .getAnimations()
          .every((animation) => animation.playState === "paused" && !animation.pending),
      ),
    )
    .toBe(true);
  const paused = await transform();
  await page.waitForTimeout(150);
  expect(await transform()).toBe(paused);
  const frontGaps = await ribbon.evaluate((element) => {
    const cards = Array.from(element.querySelectorAll<HTMLElement>("[data-ribbon-card]"));
    cards.forEach((card) =>
      card.getAnimations().forEach((animation) => {
        animation.currentTime = 0;
      }),
    );
    const boxes = cards
      .filter((card) => !card.hidden && getComputedStyle(card).zIndex === "4")
      .map((card) => card.getBoundingClientRect())
      .filter((box) => box.x > innerWidth * 0.2 && box.right < innerWidth * 0.8)
      .sort((a, b) => a.x - b.x);
    return boxes.slice(1).map((box, index) => box.left - boxes[index].right);
  });
  expect(frontGaps.length).toBeGreaterThan(0);
  expect(Math.min(...frontGaps)).toBeGreaterThan(8);
  // A full turn must go behind the front row and return to the same place.
  const poses = await page.locator('[data-ribbon-card="0"]').evaluate((element) => {
    const animation = element.getAnimations()[0];
    const duration = Number(animation.effect!.getTiming().duration);
    return [0, 0.25, 0.5, 0.75, 1].map((phase) => {
      animation.currentTime = phase * duration;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        bottom: rect.bottom,
        z: Number(getComputedStyle(element).zIndex),
      };
    });
  });
  expect(poses[1].x).toBeLessThan(poses[0].x);
  expect(poses[3].x).toBeGreaterThan(poses[0].x);
  expect(poses[2].width).toBeLessThan(poses[0].width * 0.6);
  expect(poses[2].bottom).toBeLessThan(poses[0].bottom);
  const sceneHeight = await page.locator(".hero-main").evaluate((element) => element.clientHeight);
  expect(poses[0].bottom - poses[2].bottom).toBeGreaterThan(sceneHeight * 0.4);
  // Rear cards share the scene's stacking context and actually pass behind the main model.
  expect(await ribbon.evaluate((element) => getComputedStyle(element).contain)).toBe("none");
  expect(await ribbon.evaluate((element) => getComputedStyle(element.parentElement!).zIndex)).toBe(
    "auto",
  );
  const modelLayer = await page
    .locator(".hero-model-stage")
    .evaluate((element) => Number(getComputedStyle(element).zIndex));
  expect(poses[2].z).toBeLessThan(modelLayer);
  expect(poses[0].z).toBeGreaterThan(modelLayer);
  expect(poses[2].z).toBeLessThan(poses[0].z);
  expect(poses[4].x).toBeCloseTo(poses[0].x, 1);
  expect(poses[4].y).toBeCloseTo(poses[0].y, 1);
  const cardHeight = await card.evaluate((element) => element.clientHeight);
  await page.setViewportSize({ width: 1440, height: 720 });
  await expect
    .poll(() => card.evaluate((element) => element.clientHeight))
    .toBeLessThanOrEqual(cardHeight);
  await expect
    .poll(() =>
      page
        .locator('[data-ribbon-card="0"]')
        .evaluate(
          (element) =>
            element.getBoundingClientRect().bottom <=
            element.closest(".hero-main")!.getBoundingClientRect().bottom,
        ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await expect(ribbon).toHaveAttribute("data-running", "true");
  await page.locator("#story").scrollIntoViewIfNeeded();
  await expect(ribbon).toHaveAttribute("data-running", "false");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(ribbon).toHaveAttribute("data-static", "true");
  expect(
    await page
      .locator("[data-ribbon-card]")
      .evaluateAll((cards) => cards.every((card) => card.getAnimations().length === 0)),
  ).toBe(true);
});

test.describe("touch ribbon", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test("mobile controls stay visible above the fold and support touch selection and playback", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await ready(page);
    const scene = page.locator(".hero-showroom");
    const controls = page.locator(".slide-controls");
    await page.getByRole("button", { name: "หยุดวนสินค้าอัตโนมัติ", exact: true }).tap();
    await expect(scene).toHaveAttribute("data-cycle-mode", "pinned");
    for (const [width, height] of [
      [320, 667],
      [390, 844],
      [768, 1024],
    ]) {
      await page.setViewportSize({ width, height });
      await page.evaluate(() => window.scrollTo(0, 0));
      await expect(controls).toHaveCSS("opacity", "1");
      await expect(controls).toBeInViewport({ ratio: 1 });
      const copy = (await page.locator(".hero-copy").boundingBox())!;
      const bar = (await controls.boundingBox())!;
      expect(bar.y).toBeGreaterThanOrEqual(copy.y + copy.height);
      expect(bar.x).toBeGreaterThanOrEqual(0);
      expect(bar.x + bar.width).toBeLessThanOrEqual(width);
      for (const button of await controls.getByRole("button").all()) {
        const box = (await button.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).tap();
      await page.getByRole("button", { name: "สินค้าถัดไป", exact: true }).tap();
      await expect(scene).toHaveAttribute("data-active-product", "FEH5KS");
      await expect(page.locator(".hero-buttons")).toHaveCount(0);
      await page.getByRole("button", { name: "สินค้าก่อนหน้า", exact: true }).tap();
      await expect(scene).toHaveAttribute("data-active-product", "ACS-30-JC21");
      expect(await page.evaluate(() => scrollY)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await expect(page.locator("[data-hero-motion-toggle]")).toHaveCount(1);
    await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).tap();
    const motion = page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true });
    await expect(motion).toHaveCSS("opacity", "1");
    await expect(motion).toHaveCSS("width", "44px");
    await expect(motion).toHaveCSS("height", "44px");
    await motion.tap();
    await expect(page.locator(".hero-model-stage")).toHaveAttribute("data-moving", "true");
    await expect(page.locator("[data-hero-studio]")).toHaveAttribute("data-running", "true");
    await expect(page.locator("[data-hero-ribbon]")).toHaveAttribute("data-running", "true");
    await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).tap();
    await expect(page.locator(".hero-model-stage")).toHaveAttribute("data-moving", "false");
    await expect(page.locator("[data-hero-studio]")).toHaveAttribute("data-running", "false");
    await expect(page.locator("[data-hero-ribbon]")).toHaveAttribute("data-running", "false");
    await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).tap();
    await expect(page.locator("[data-hero-ribbon]")).toHaveAttribute("data-running", "true");
    await page.getByRole("button", { name: "เล่นวนสินค้าอัตโนมัติ", exact: true }).tap();
    await expect(scene).toHaveAttribute("data-cycle-mode", "auto");
    await expect(scene).toHaveAttribute("data-cycling", "true");
  });
  test("holding a photo on touch can drag it to the main stage without scrolling the page", async ({
    page,
  }) => {
    test.setTimeout(60000);
    await ready(page);
    await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).tap();
    const card = page.locator('[data-ribbon-card="1"]');
    await page.keyboard.press("Tab");
    await card.focus();
    await card.evaluate((element) =>
      element.scrollIntoView({ block: "center", behavior: "instant" }),
    );
    const box = (await card.boundingBox())!;
    const zone = (await page.locator("[data-hero-dropzone]").boundingBox())!;
    const initialScroll = await page.evaluate(() => scrollY);
    const client = await page.context().newCDPSession(page);
    const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
    const to = { x: zone.x + zone.width / 2, y: zone.y + zone.height / 2 };
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
    await page.waitForTimeout(650);
    await expect(page.locator(".hero-showroom")).toHaveAttribute("data-product-drag", "true");
    for (let step = 1; step <= 12; step++) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [
          { x: from.x + ((to.x - from.x) * step) / 12, y: from.y + ((to.y - from.y) * step) / 12 },
        ],
      });
    }
    await expect(page.locator(".hero-showroom")).toHaveAttribute("data-product-drop", "true");
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "FEH5KS");
    expect(await page.evaluate(() => scrollY)).toBe(initialScroll);
  });
  test("reduced motion uses static accessible photos without horizontal page overflow", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: "เลือกชม WPS10KS", exact: true }).tap();
    await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-active-product", "WPS10KS");
    await expect(page.locator(".hero-model-stage")).toHaveAttribute("data-moving", "false");
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.locator(".hero-buttons")).toHaveCount(0);
    }
    await page.screenshot({ path: test.info().outputPath("hero-showroom-mobile.jpg") });
  });
});
