import { expect, test, type Page } from "@playwright/test";

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

type OpeningFrame = {
  phase: string;
  at: number;
  logoTime: number | null;
  logo: { x: number; y: number; width: number; height: number } | null;
  symbol: { x: number; y: number; width: number; height: number } | null;
  header: { x: number; y: number; width: number; height: number } | null;
  space: { x: number; y: number; width: number; height: number } | null;
  wordOpacity: number | null;
  wordClip: string | null;
  visible: boolean;
  bubblesVisible: boolean;
  bubblePopup: boolean;
};

async function recordOpening(page: Page) {
  await page.addInitScript(() => {
    const samples: unknown[] = [];
    Object.assign(window, { __brandOpeningFrames: samples });
    let sawOpening = false;
    const started = performance.now();
    const box = (element: Element | null) => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };
    const sample = () => {
      const opening = document.querySelector<HTMLElement>("[data-brand-opening]");
      if (opening) {
        sawOpening = true;
        const phase = opening.dataset.phase ?? "pending";
        const logo = opening.querySelector("[data-brand-opening-logo]");
        const word = opening.querySelector("[data-brand-opening-word]");
        const bubbleLayer = document.querySelector(".hero-bubble-layer");
        const style = getComputedStyle(opening);
        const layerStyle = bubbleLayer ? getComputedStyle(bubbleLayer) : null;
        samples.push({
          phase,
          at: performance.now(),
          logoTime: logo ? Number(logo.getAnimations()[0]?.currentTime ?? NaN) : null,
          logo: box(logo),
          symbol: box(opening.querySelector("[data-brand-opening-symbol]")),
          header: box(document.querySelector(".site-header .brand img")),
          space: box(document.querySelector("[data-hero-logo-space]")),
          wordOpacity: word ? Number(getComputedStyle(word).opacity) : null,
          wordClip: word ? getComputedStyle(word).clipPath : null,
          visible:
            style.visibility === "visible" &&
            style.display !== "none" &&
            Number(style.opacity) > 0.05,
          bubblesVisible: layerStyle?.visibility === "visible" && Number(layerStyle.opacity) > 0.05,
          bubblePopup: Boolean(bubbleLayer?.querySelector('[data-popup="true"]')),
        });
        if (phase === "complete") return;
      }
      if ((!sawOpening || performance.now() - started < 10000) && samples.length < 1800)
        requestAnimationFrame(sample);
    };
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (this: Element, keyframes, options) {
      const animation = animate.call(this, keyframes, options);
      if (this.matches("[data-brand-opening-logo]"))
        animation.finished.then(sample).catch(() => {});
      return animation;
    };
    requestAnimationFrame(sample);
  });
}

async function openingFrames(page: Page) {
  return page.evaluate(
    () =>
      (window as unknown as { __brandOpeningFrames: OpeningFrame[] }).__brandOpeningFrames ?? [],
  );
}

async function expectReleased(page: Page) {
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 10000,
  });
  await expect(page.locator("[data-brand-opening]")).toBeHidden();
  await expect(page.locator(".hero-cinematic")).toHaveAttribute("data-opening", "false");
  await expect(page.locator(".hero-bubble-layer")).toHaveCount(0);
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-ready", "true");
  expect(
    await page.evaluate(() => ({
      bodyOverflow: getComputedStyle(document.body).overflow,
      htmlOverflow: getComputedStyle(document.documentElement).overflow,
      blocked: Boolean(document.querySelector(".site-header")?.closest("[inert]")),
    })),
  ).toEqual({ bodyOverflow: "visible", htmlOverflow: "visible", blocked: false });
  await expect(page.locator(".hero-cinematic")).not.toHaveAttribute("inert", "");
}

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 844, height: 390 },
]) {
  test(`the decorative logo reveals its name inside the reserved Hero space at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await recordOpening(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expectReleased(page);
    const frames = await openingFrames(page);
    await test.info().attach("opening-frames.json", {
      body: JSON.stringify(frames),
      contentType: "application/json",
    });
    const phases = [...new Set(frames.map((frame) => frame.phase))];
    expect(phases).toEqual(expect.arrayContaining(["symbol", "name", "settled", "complete"]));
    expect(phases.indexOf("symbol")).toBeLessThan(phases.indexOf("name"));
    expect(phases.indexOf("name")).toBeLessThan(phases.indexOf("settled"));
    const symbolFrames = frames.filter(
      (frame) =>
        frame.logo && frame.logoTime !== null && frame.logoTime >= 450 && frame.logoTime <= 525,
    );
    expect(symbolFrames.length).toBeGreaterThan(1);
    const symbol = symbolFrames.at(-1)!;
    expect(
      Math.abs(
        symbol.logo!.x +
          (symbol.logo!.width * 95) / 690 -
          (symbol.space!.x + symbol.space!.width / 2),
      ),
    ).toBeLessThan(4);
    expect(symbol.wordOpacity).toBeLessThan(0.01);
    const named = frames.filter(
      (frame) =>
        frame.logo && frame.logoTime !== null && frame.logoTime >= 900 && frame.logoTime <= 950,
    );
    expect(named.length).toBeGreaterThan(1);
    expect(named.at(-1)!.wordOpacity).toBeGreaterThan(0.99);
    expect(named.at(-1)!.wordClip).not.toBe(symbol.wordClip);
    const centered = named.at(-1)!;
    expect(
      Math.abs(
        centered.logo!.x +
          centered.logo!.width / 2 -
          (centered.space!.x + centered.space!.width / 2),
      ),
    ).toBeLessThan(6);
    expect(
      Math.abs(
        centered.logo!.y +
          centered.logo!.height / 2 -
          (centered.space!.y + centered.space!.height / 2),
      ),
    ).toBeLessThan(6);
    const active = frames.filter(
      (frame) => frame.phase !== "complete" && frame.logo && frame.logo.width > 0 && frame.space,
    );
    for (const frame of active) {
      expect(frame.logo!.x).toBeGreaterThanOrEqual(frame.space!.x - 1);
      expect(frame.logo!.y).toBeGreaterThanOrEqual(frame.space!.y - 1);
      expect(frame.logo!.x + frame.logo!.width).toBeLessThanOrEqual(
        frame.space!.x + frame.space!.width + 1,
      );
      expect(frame.logo!.y + frame.logo!.height).toBeLessThanOrEqual(
        frame.space!.y + frame.space!.height + 1,
      );
    }
    expect(
      frames.filter(
        (frame) =>
          ["symbol", "name"].includes(frame.phase) && (frame.bubblesVisible || frame.bubblePopup),
      ),
    ).toEqual([]);
    await expect(page.locator(".site-header .brand")).toBeVisible();
    await expect(page.locator(".hero-bubble-layer, model-viewer")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`brand-revealed-${viewport.width}.png`) });
    await expect(page.locator("[data-hero-logo-space] [data-brand-opening]")).toBeHidden();
    await expect(page.locator("[data-hero-scene] video source")).toHaveAttribute(
      "src",
      "/videos/sunford-web.mp4",
    );
    expect(errors).toEqual([]);
  });
}

test("the opening plays again after reloading the homepage", async ({ page }) => {
  await recordOpening(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectReleased(page);
  expect((await openingFrames(page)).some((frame) => frame.phase === "symbol")).toBe(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expectReleased(page);
  const replay = await openingFrames(page);
  expect(replay.some((frame) => frame.phase === "symbol" && frame.visible)).toBe(true);
  expect(replay.some((frame) => frame.phase === "settled")).toBe(true);
});

test("cold fonts only delay the decoration and its final name stays inside the Hero space", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/*.ttf", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.continue();
  });
  await recordOpening(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-hero-scene] h1")).toBeVisible({ timeout: 1000 });
  await expect(page.locator(".site-header .brand")).toBeVisible();
  await expectReleased(page);
  const frames = await openingFrames(page);
  const settled = frames
    .filter((frame) => frame.logoTime !== null && frame.logoTime >= 1000 && frame.logoTime <= 1500)
    .at(-1)!;
  expect(settled).toBeDefined();
  expect(
    Math.abs(
      settled.logo!.x + settled.logo!.width / 2 - (settled.space!.x + settled.space!.width / 2),
    ),
  ).toBeLessThan(1);
  expect(
    Math.abs(
      settled.logo!.y + settled.logo!.height / 2 - (settled.space!.y + settled.space!.height / 2),
    ),
  ).toBeLessThan(1);
});

test("reduced motion shows an immediately usable homepage", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await recordOpening(page);
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expectReleased(page);
  expect((await openingFrames(page)).some((frame) => frame.visible)).toBe(false);
  const consultation = page.locator('[data-hero-scene] a[href="/contact-us"]');
  await consultation.focus();
  await expect(consultation).toBeFocused();
});

for (const exit of ["Escape", "Tab", "resize", "reduced motion"] as const) {
  test(`${exit} during the opening restores navigation and page scrolling`, async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "symbol", {
      timeout: 10000,
    });
    if (exit === "resize") await page.setViewportSize({ width: 850, height: 700 });
    else if (exit === "reduced motion") await page.emulateMedia({ reducedMotion: "reduce" });
    else await page.keyboard.press(exit);
    await expectReleased(page);
    await page.evaluate(() => scrollTo({ top: 160, behavior: "instant" }));
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    if (exit === "Tab")
      expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe("BODY");
  });
}

test("without JavaScript the opening cannot cover or lock the site", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-brand-opening]")).toBeHidden();
    await expect(
      page.getByRole("heading", {
        name: "เครื่องชั่ง สำหรับธุรกิจของคุณ",
        exact: true,
        level: 1,
      }),
    ).toBeVisible();
    await expect(page.locator(".site-header .brand")).toBeVisible();
    expect(
      await page.evaluate(() => document.querySelector("main")?.closest("[inert]")),
    ).toBeNull();
    await page.evaluate(() => scrollTo({ top: 160, behavior: "instant" }));
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
  } finally {
    await context.close();
  }
});

test("the opening stays on the homepage and preserves anchored visits", async ({ page }) => {
  await page.goto("/products");
  await expect(page.locator("[data-brand-opening]")).toHaveCount(0);
  await recordOpening(page);
  await page.goto("/#stories", { waitUntil: "domcontentloaded" });
  await expectReleased(page);
  expect(
    (await openingFrames(page)).some((frame) =>
      ["symbol", "name", "docking"].includes(frame.phase),
    ),
  ).toBe(false);
  await expect(page.locator("#stories")).toBeInViewport();
});

test("failed hydration releases the opening, header and Hero through the CSS fallback", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, (route) => route.abort());
  await page.goto("/", { waitUntil: "domcontentloaded" });
  expect(await page.evaluate(() => matchMedia("(scripting: enabled)").matches)).toBe(true);
  const opening = page.locator("[data-brand-opening]");
  await expect(opening).toHaveAttribute("data-phase", "pending");
  await expect(opening).toBeHidden({ timeout: 10000 });
  await expect(page.locator(".site-header .brand")).toBeVisible();
  await expect(page.locator(".site-header .desktop-nav")).toHaveCSS("opacity", "1");
  await expect(page.locator(".hero-main:visible")).toHaveCSS("visibility", "visible");
  await expect(
    page.getByRole("heading", {
      name: "เครื่องชั่ง สำหรับธุรกิจของคุณ",
      exact: true,
      level: 1,
    }),
  ).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).overflow)).toBe(
    "visible",
  );
  expect(await page.locator(".hero-cinematic").getAttribute("inert")).toBeNull();
  await page.evaluate(() => scrollTo({ top: 160, behavior: "instant" }));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(100);
});
