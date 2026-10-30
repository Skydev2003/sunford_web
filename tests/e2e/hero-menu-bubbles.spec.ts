import { expect, test } from "@playwright/test";

test.use({
  viewport: { width: 1440, height: 900 },
  launchOptions: { args: ["--enable-unsafe-swiftshader"] },
});

test("bubbles wait for the entire menu exit before rising again, including a previously dragged bubble", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const layer = page.locator(".hero-bubble-layer");
  const bubble = layer.locator("li").first();
  await bubble.getByRole("button").focus();
  await page.keyboard.down("ArrowRight");
  await page.keyboard.up("ArrowRight");
  await expect(bubble).toHaveAttribute("data-returning", "false");
  await expect(bubble).toHaveAttribute("data-interacted", "true");
  const before = await layer.locator(".hero-floating-bubble").evaluateAll((elements) =>
    elements.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  await page.locator(".desktop-nav a").first().hover();
  await expect(page.locator(".nav-backdrop")).toHaveCSS("opacity", "1");
  await expect(layer).toBeHidden();
  await expect(layer).toHaveAttribute("inert", "");

  const observation = page.evaluate(
    () =>
      new Promise<
        Array<{
          closing: boolean;
          menuVisible: boolean;
          backdropVisible: boolean;
          bubblesVisible: boolean;
          opacity: number;
          y: number;
        }>
      >((resolve) => {
        const menu = document.querySelector("#desktop-submenu")!;
        const backdrop = document.querySelector(".nav-backdrop")!;
        const bubbles = document.querySelector(".hero-bubble-layer")!;
        const pop = bubbles.querySelector(".hero-feature-pop")!;
        const frames: Array<{
          closing: boolean;
          menuVisible: boolean;
          backdropVisible: boolean;
          bubblesVisible: boolean;
          opacity: number;
          y: number;
        }> = [];
        const start = performance.now();
        const sample = () => {
          const style = getComputedStyle(pop);
          frames.push({
            closing: !menu.classList.contains("is-open"),
            menuVisible: getComputedStyle(menu).visibility !== "hidden",
            backdropVisible: getComputedStyle(backdrop).visibility !== "hidden",
            bubblesVisible: getComputedStyle(bubbles).visibility === "visible",
            opacity: Number(style.opacity),
            y: style.transform === "none" ? 0 : new DOMMatrixReadOnly(style.transform).m42,
          });
          if (performance.now() - start >= 2400) resolve(frames);
          else requestAnimationFrame(sample);
        };
        sample();
      }),
  );
  await page.keyboard.press("Escape");
  const frames = await observation;
  expect(frames.some((f) => f.closing && (f.menuVisible || f.backdropVisible))).toBe(true);
  expect(frames.filter((f) => f.bubblesVisible && (f.menuVisible || f.backdropVisible))).toEqual(
    [],
  );
  const entering = frames.filter((f) => f.bubblesVisible);
  expect(entering.length).toBeGreaterThan(20);
  expect(entering[0].opacity).toBeLessThan(0.2);
  expect(entering[0].y).toBeGreaterThan(30);
  expect(entering.some((f) => f.opacity > 0.2 && f.opacity < 0.9)).toBe(true);
  expect(entering.at(-1)!.opacity).toBe(1);
  expect(entering.at(-1)!.y).toBe(0);
  await expect(layer).toBeVisible();
  await expect(layer).not.toHaveAttribute("inert");
  for (const pop of await layer.locator(".hero-feature-pop").all()) {
    await expect(pop).toHaveCSS("animation-name", "hero-feature-pop");
  }
  const after = await layer.locator(".hero-floating-bubble").evaluateAll((elements) =>
    elements.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x, y: r.y };
    }),
  );
  expect(after).toEqual(before);
  await test
    .info()
    .attach("closing-frames", { body: JSON.stringify(frames), contentType: "application/json" });
  await page.screenshot({ path: test.info().outputPath("bubbles-after-menu.png") });
});

test("quick reopening cancels a pending reveal; pause, reduced motion and mobile resize remain usable", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  const layer = page.locator(".hero-bubble-layer");
  const links = page.locator(".desktop-nav a");
  await links.first().focus();
  await expect(page.locator(".nav-backdrop")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  await links.nth(1).focus();
  await expect(links.nth(1)).toHaveAttribute("aria-expanded", "true");
  await page.waitForTimeout(550);
  await expect(layer).toBeHidden();
  await page.mouse.click(20, 800);
  await expect(layer).toBeVisible();
  await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS(
    "animation-name",
    "hero-feature-pop",
  );

  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await links.first().focus();
  await expect(layer).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(layer).toBeVisible();
  for (const pop of await layer.locator(".hero-feature-pop").all())
    await expect(pop).toHaveCSS("animation-name", "none");

  await page.getByRole("button", { name: "เล่นการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await links.nth(1).focus();
  await expect(layer).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(layer).toBeVisible();
  for (const pop of await layer.locator(".hero-feature-pop").all())
    await expect(pop).toHaveCSS("animation-name", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await links.first().focus();
  await expect(layer).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(layer).toBeVisible();
  await expect(layer).not.toHaveAttribute("inert");
});

test("a product change during menu closure also waits for the backdrop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "แสดง FEH5KS", exact: true }).click();
  await page.locator(".desktop-nav a").first().focus();
  await expect(page.locator(".nav-backdrop")).toHaveCSS("opacity", "1");
  await page.keyboard.press("Escape");
  // Exercise the same bubble remount as autoplay while navigation is still closing.
  await page.getByRole("button", { name: "แสดง WPS10KS", exact: true }).dispatchEvent("click");
  const layer = page.locator(".hero-bubble-layer");
  await expect(layer.getByRole("list", { includeHidden: true })).toHaveAttribute(
    "aria-label",
    "จุดเด่น WPS10KS",
  );
  const duringClose = await page.evaluate(() => ({
    backdrop: getComputedStyle(document.querySelector(".nav-backdrop")!).visibility,
    bubbles: getComputedStyle(document.querySelector(".hero-bubble-layer")!).visibility,
  }));
  expect(duringClose).toEqual({ backdrop: "visible", bubbles: "hidden" });
  await expect(layer).toBeVisible();
  await expect(page.locator(".nav-backdrop")).toBeHidden();
  await expect(layer.locator(".hero-feature-pop").first()).toHaveCSS(
    "animation-name",
    "hero-feature-pop",
  );
});
