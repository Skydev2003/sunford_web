import { expect, test, type Page } from "@playwright/test";

const title = "เครื่องชั่ง SUNFORD สำหรับธุรกิจของคุณ";
const scene = (page: Page) => page.locator("[data-hero-scene]");
async function ready(page: Page) {
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
    timeout: 15000,
  });
  await expect(scene(page)).toHaveAttribute("data-ready", "true");
  await page.evaluate(() => document.fonts.ready);
}

for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
  [1280, 720],
  [768, 1024],
  [390, 844],
  [320, 700],
]) {
  test(`grounded image, copy and consultation fit ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const requests: string[] = [];
    const errors: string[] = [];
    page.on("request", (request) => requests.push(request.url()));
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await ready(page);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
    const image = scene(page).locator("img");
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBe(800);
    await expect(image).toHaveAttribute("src", "/images/hero/acs30-jc21-front.webp");
    await expect(scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" })).toHaveAttribute(
      "href",
      "/contact-us",
    );
    for (const locator of [
      scene(page).locator("h1"),
      scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }),
      scene(page).locator("[data-hero-product]"),
    ]) {
      const box = (await locator.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(55);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(height + 1);
    }
    const object = scene(page).locator("[data-hero-object]");
    const shadow = await object.evaluate((node) => {
      const r = node.getBoundingClientRect();
      const s = getComputedStyle(node, "::after");
      return {
        relativeBottom: parseFloat(s.bottom) / r.height,
        animation: s.animationName,
        transform: s.transform,
      };
    });
    expect(shadow.relativeBottom).toBeCloseTo(0.092, 2);
    expect(shadow.animation).toBe("none");
    expect(shadow.transform).toBe("none");
    await expect(
      page.locator("model-viewer, .hero-bubble-layer, [data-hero-studio], .hero-product-ribbon"),
    ).toHaveCount(0);
    expect(
      requests.filter((url) => /\.glb(?:\?|$)|model-viewer|reference-landscape/.test(url)),
    ).toEqual([]);
    expect(
      requests.filter((url) => url.includes("/images/hero/acs30-jc21-front.webp")),
    ).toHaveLength(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    expect(errors).toEqual([]);
    await page.screenshot({ path: test.info().outputPath(`studio-${width}x${height}.png`) });
  });
}

test("only ambient light moves; removed control stays absent and offscreen pauses light", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  await expect(scene(page)).toHaveAttribute("data-running", "true");
  const product = scene(page).locator("[data-hero-product]");
  const before = await product.boundingBox();
  const light = () =>
    scene(page).evaluate((node) =>
      node
        .getAnimations({ subtree: true })
        .filter(
          (a) => a instanceof CSSAnimation && /studio-light|reflected-light/.test(a.animationName),
        )
        .map((a) => Number(a.currentTime)),
    );
  const start = await light();
  expect(start).toHaveLength(2);
  await expect.poll(light).not.toEqual(start);
  expect(await product.boundingBox()).toEqual(before);
  await expect(scene(page).locator("[data-hero-motion-toggle]")).toHaveCount(0);
  await page.locator("#support").scrollIntoViewIfNeeded();
  await expect(scene(page)).toHaveAttribute("data-running", "false");
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(scene(page)).toHaveAttribute("data-running", "true");
});

test("live reduced motion switches light and reveal immediately in both directions", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  await expect(scene(page)).toHaveAttribute("data-running", "false");
  await expect(scene(page).locator("button")).toBeHidden();
  expect(await scene(page).evaluate((n) => n.getAnimations({ subtree: true }).length)).toBe(0);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(scene(page)).toHaveAttribute("data-running", "true");
  await expect(scene(page).locator("button")).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(scene(page)).toHaveAttribute("data-running", "false");
  await expect(page.locator("#brand-film")).toHaveAttribute("data-hero-scroll-reveal", "reduced");
});

test("smooth native section navigation reveals once and preserves following content", async ({
  page,
}) => {
  await page.goto("/");
  await ready(page);
  const next = page.locator("#brand-film");
  await expect(next).toHaveAttribute("data-hero-scroll-reveal", "pending");
  await page.evaluate(() => {
    const samples: number[] = [];
    (window as Window & { samples?: number[] }).samples = samples;
    addEventListener("scroll", () => samples.push(scrollY), { passive: true });
  });
  await page.mouse.wheel(0, 950);
  await expect(next).toHaveAttribute("data-hero-scroll-reveal", "complete");
  const samples = await page.evaluate(() => (window as Window & { samples?: number[] }).samples!);
  expect(samples.filter((y) => y > 10 && y < 600).length).toBeGreaterThan(3);
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await expect(next).toHaveAttribute("data-hero-scroll-reveal", "complete");
  await expect(next.locator("video source")).toHaveAttribute("src", "/videos/sunford-web.mp4");
  await expect(scene(page).locator("video, canvas")).toHaveCount(0);
  await expect(page.locator("[data-home-motion]")).toHaveCount(8);
});

for (const width of [1440, 390]) {
  test(`no JavaScript keeps real content, image, consultation and section anchor at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    const context = await browser.newContext({
      baseURL,
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      await expect(scene(page).getByRole("heading", { name: title })).toBeVisible();
      await expect(scene(page).locator("img")).toBeVisible();
      await expect(scene(page).locator("button")).toBeHidden();
      await expect(page.locator("[data-brand-opening]")).toBeHidden();
      await page.mouse.wheel(0, 950);
      await expect(scene(page).locator('a[href="#brand-film"]')).toHaveCount(0);
      await expect(page.locator("#brand-film")).toBeInViewport();
      await page.goto("/");
      await scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }).click();
      await expect(page).toHaveURL(/\/contact-us$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText("ติดต่อ");
    } finally {
      await context.close();
    }
  });
}

test("failed artwork leaves product recovery and consultation usable", async ({ page }) => {
  await page.route("**/images/hero/acs30-jc21-front.webp", (route) => route.abort());
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  await expect(scene(page).locator("[data-hero-product]")).toContainText(
    "ไม่สามารถแสดงภาพสินค้าได้",
  );
  await expect(scene(page).locator("[data-hero-product]")).toHaveAttribute(
    "href",
    "/products/acs30-jc21",
  );
  await scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" }).click();
  await expect(page).toHaveURL(/\/contact-us$/);
});

test("one image request survives delayed loading and 800/801/mobile round trips", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requests = 0;
  await page.route("**/images/hero/acs30-jc21-front.webp", async (route) => {
    requests++;
    await gate;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await ready(page);
    for (const width of [800, 801, 390, 1440]) await page.setViewportSize({ width, height: 900 });
    const reserved = await scene(page).locator("[data-hero-product]").boundingBox();
    release();
    await expect
      .poll(() =>
        scene(page)
          .locator("img")
          .evaluate((node: HTMLImageElement) => node.naturalWidth),
      )
      .toBe(800);
    expect(requests).toBe(1);
    expect(await scene(page).locator("[data-hero-product]").boundingBox()).toEqual(reserved);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator("model-viewer")).toHaveCount(0);
  } finally {
    release();
  }
});

test("consultation is keyboard reachable with a visible focus indicator and preserved internal header", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);
  const cta = scene(page).getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" });
  await cta.focus();
  await expect(cta).toBeFocused();
  expect(await cta.evaluate((n) => getComputedStyle(n).outlineWidth)).toBe("3px");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/contact-us$/);
  await expect(page.locator("[data-hero-scene]")).toBeHidden();
  await expect(page.locator(".site-header")).not.toHaveAttribute("data-hero-backdrop-tracked");
  await expect(page.locator(".site-header")).not.toHaveAttribute("data-hero-backdrop");
  await expect(page.locator(".nav-glass")).toHaveCSS("background-color", "rgb(247, 247, 249)");
});
