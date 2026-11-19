import { expect, test } from "@playwright/test";

test("the glass S pauses offscreen and in a hidden tab, then settles once", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/products", { waitUntil: "domcontentloaded" });
  const slot = page.locator("[data-products-logo]");
  const wash = page.locator("[data-products-header-wash]");
  await expect(slot.locator("canvas")).toBeVisible({ timeout: 15000 });
  const clock = () => wash.evaluate((el) => Number(el.getAnimations()[0]?.currentTime));
  await expect.poll(clock).toBeGreaterThan(0);
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await expect(slot).not.toBeInViewport();
  await page.waitForTimeout(100);
  const held = await clock();
  await page.waitForTimeout(150);
  expect(await clock()).toBe(held);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect.poll(clock).toBeGreaterThan(held);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hidden = await clock();
  await page.waitForTimeout(150);
  expect(await clock()).toBe(hidden);
  await page.evaluate(() => {
    Reflect.deleteProperty(document, "hidden");
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(slot.locator("canvas")).toHaveCount(0, { timeout: 10000 });
  await expect(slot.locator("img")).toBeVisible();
  await expect(wash).toBeHidden();
  await page.evaluate(() => window.scrollTo({ top: 1400, behavior: "instant" }));
  await expect(slot).not.toBeInViewport();
  await slot.scrollIntoViewIfNeeded();
  await expect(slot.locator("canvas")).toHaveCount(0);
});

for (const width of [390, 768, 1440]) {
  test(`glass S expands left and reveals SUNFORD within five seconds at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 920 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products", { waitUntil: "domcontentloaded" });
    const slot = page.locator("[data-products-logo]");
    const header = page.locator("[data-products-directory] > header");
    const wash = page.locator("[data-products-header-wash]");
    await expect.poll(() => wash.evaluate((el) => el.getAnimations().length)).toBe(1);
    const letters = slot.locator("[data-letter]");
    const opacity = () =>
      letters.evaluateAll((nodes) => nodes.map((node) => Number(getComputedStyle(node).opacity)));
    expect(await opacity()).toEqual([1, 1, 1, 1, 1, 1]);
    await page.clock.install({ time: new Date("2026-11-19T03:00:00Z") });
    await page.clock.pauseAt(new Date("2026-11-19T03:00:02Z"));
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(slot.locator("canvas")).toBeAttached({ timeout: 15000 });
    await expect(slot).not.toHaveAttribute("data-glass", "playing");
    await expect(slot.locator("img")).toBeHidden();
    await expect(slot.locator("canvas")).toBeHidden();
    await page.clock.runFor(32);
    await expect(slot.locator("canvas")).toBeVisible();
    await expect(slot.locator("img")).toBeHidden();
    await expect(wash).toBeVisible();
    const timing = await wash.evaluate((el) => {
      const anim = el.getAnimations()[0].effect as KeyframeEffect;
      return {
        duration: anim.getTiming().duration,
        stops: anim.getKeyframes().map((k) => k.offset),
      };
    });
    expect(timing).toEqual({ duration: 5000, stops: [0, 0.12667, 0.36, 0.65333, 1] });
    await page.clock.fastForward(1500);
    await header.screenshot({ path: test.info().outputPath(`glass-${width}.png`) });
    const bounds = await slot.boundingBox();
    const initial = (await slot.locator("img").boundingBox())!;
    expect(await opacity()).toEqual([0, 0, 0, 0, 0, 0]);
    const readClock = () => wash.evaluate((el) => Number(el.getAnimations()[0].currentTime));
    await page.clock.fastForward(Math.round(2990 - (await readClock())));
    const glass = (await slot.locator("canvas").boundingBox())!;
    const beforeHandoff = (await slot.locator("img").boundingBox())!;
    expect(glass.height * 0.6).toBeCloseTo(beforeHandoff.height, 0);
    expect(glass.x + glass.width / 2).toBeCloseTo(beforeHandoff.x + beforeHandoff.width / 2, 0);
    await page.clock.fastForward(20);
    await expect(slot.locator("img")).toBeVisible();
    await expect(slot.locator("canvas")).toBeHidden();
    // Sample immediately after each entrance starts, while the next glyph is still hidden.
    for (let index = 0; index < 6; index++) {
      await page.clock.fastForward(Math.round(3580 + 150 * index - (await readClock())));
      const alpha = await opacity();
      expect(alpha[index]).toBeGreaterThan(0);
      expect(alpha[index]).toBeLessThan(1);
      expect(alpha.slice(index + 1)).toEqual(Array(5 - index).fill(0));
      if (index === 2)
        await header.screenshot({ path: test.info().outputPath(`unfold-${width}.png`) });
    }
    expect(
      await letters.evaluateAll((nodes) =>
        nodes.map((n) => n.getAttribute("data-letter")).join(""),
      ),
    ).toBe("UNFORD");
    await page.clock.fastForward(Math.round(4990 - (await readClock())));
    expect(await opacity()).toEqual([1, 1, 1, 1, 1, 1]);
    const final = (await slot.locator("img").boundingBox())!;
    expect(final.width).toBeGreaterThan(initial.width * 1.25);
    expect(final.x).toBeLessThan(initial.x);
    await page.clock.fastForward(32);
    for (const target of [
      header.locator("h1"),
      header.getByRole("link"),
      page.locator("#products-categories"),
    ]) {
      const b = (await target.boundingBox())!;
      expect(
        bounds!.x + bounds!.width <= b.x ||
          b.x + b.width <= bounds!.x ||
          bounds!.y + bounds!.height <= b.y ||
          b.y + b.height <= bounds!.y,
      ).toBe(true);
    }
    await expect(slot.locator("img")).toBeVisible({ timeout: 10000 });
    await expect(wash).toBeHidden();
    expect((await slot.locator("img").boundingBox())!.x).toBeCloseTo(final.x, 1);
    await header.screenshot({ path: test.info().outputPath(`still-${width}.png`) });
  });
}

test("reduced motion and unavailable WebGL2 show the complete SUNFORD wordmark", async ({
  page,
}) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = new Proxy(HTMLCanvasElement.prototype.getContext, {
      apply(target, self, args) {
        if (args[0] === "webgl2") {
          document.documentElement.dataset.webglAttempted = "true";
          return null;
        }
        return Reflect.apply(target, self, args);
      },
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const slot = page.locator("[data-products-logo]");
  const img = slot.locator("img");
  await expect(img).toBeVisible();
  await expect(img).toHaveJSProperty("naturalHeight", 640);
  const allLettersVisible = () =>
    slot.locator("[data-letter]").evaluateAll((nodes) =>
      nodes
        .filter((n) => getComputedStyle(n).opacity === "1")
        .map((n) => n.getAttribute("data-letter"))
        .join(""),
    );
  expect(await allLettersVisible()).toBe("UNFORD");
  await expect(slot.locator("canvas")).toHaveCount(0);
  await expect(page.locator("html")).not.toHaveAttribute("data-webgl-attempted", "true");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator("html")).toHaveAttribute("data-webgl-attempted", "true");
  await expect(slot.locator("canvas")).toHaveCount(0);
  await expect(img).toBeVisible();
  expect(await allLettersVisible()).toBe("UNFORD");
  await expect(page.locator("[data-products-header-wash]")).toBeHidden();
});

test("category links and consultation lead to their destinations", async ({ page }) => {
  await page.goto("/products");
  const directory = page.locator("[data-products-directory]");
  const categories = directory.locator("nav li a");
  await expect(categories).toHaveCount(6);
  await expect(page.locator('[aria-controls="products-categories"]')).toHaveCount(0);
  await categories.first().click();
  await expect(page).toHaveURL("/products/category/scales");
  await page.goBack();
  const contact = directory.getByRole("link", { name: /ให้เราช่วยเลือก/ });
  const href = await contact.getAttribute("href");
  await contact.click();
  await expect(page).toHaveURL(href!);
});

test("shelf arrows show press, cancellation, keyboard focus and both endpoints", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1521, height: 940 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const section = page.locator("[data-products-category-section]").first();
  const track = section.locator("ul");
  const previous = section.getByRole("button", { name: /ก่อนหน้า$/ });
  const next = section.getByRole("button", { name: /ถัดไป$/ });
  await expect(previous).toBeDisabled();
  await next.scrollIntoViewIfNeeded();
  await next.hover();
  const initial = await next.locator("svg").evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.mouse.down();
  await expect(next.locator("svg")).not.toHaveCSS("background-color", initial);
  await page.screenshot({ path: test.info().outputPath("pressed.png") });
  await page.mouse.move(0, 0);
  await page.mouse.up();
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
  const pitch = await track.evaluate(
    (el) => el.children[1].getBoundingClientRect().x - el.children[0].getBoundingClientRect().x,
  );
  await next.click();
  await expect(previous).toBeEnabled();
  await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(pitch);
  await previous.click();
  await expect(previous).toBeDisabled();
  await track.focus();
  await page.keyboard.press("Tab");
  const card = track.locator("a").first();
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS("outline-style", "solid");
  await page.screenshot({ path: test.info().outputPath("focus.png") });
  const href = await card.getAttribute("href");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(href!);
  await page.goBack();
  await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "instant" }));
  await expect(next).toBeDisabled();
  await expect(previous).toBeEnabled();
});

test.describe("mobile category paddles", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("available directions sit on the edges and return to the first category", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products");
    const nav = page.getByRole("navigation", { name: "เลือกหมวดผลิตภัณฑ์" });
    const track = nav.getByRole("list");
    const previous = nav.locator("button").first();
    const next = nav.locator("button").last();
    await expect(next).toBeVisible();
    const right = (await next.boundingBox())!;
    const row = (await track.boundingBox())!;
    expect(right.x + right.width).toBeCloseTo(row.x + row.width, 0);
    expect(right.y).toBeCloseTo(row.y, 0);
    expect(right.height).toBeCloseTo(row.height, 0);
    await expect(previous).toBeHidden();
    await next.tap();
    await expect(previous).toBeVisible();
    expect((await previous.boundingBox())!.x).toBeCloseTo(row.x, 0);
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    if (await next.isVisible()) await next.tap();
    await expect(next).toBeHidden();
    await previous.tap();
    if (await previous.isVisible()) await previous.tap();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBe(0);
    await expect(previous).toBeHidden();
  });
});

test("the wheel scrolls the document over a product without changing the shelf", async ({
  page,
}) => {
  await page.goto("/products");
  const track = page.locator("#products-rail-scales");
  await track.locator("a").first().hover();
  const top = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 260);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(top);
  expect(await track.evaluate((el) => el.scrollLeft)).toBe(0);
});

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`arrow navigation respects ${reducedMotion} and lands on the next card`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion });
    await page.goto("/products");
    const track = page.locator("#products-rail-scales");
    const next = page.getByRole("button", {
      name: "เลื่อนเครื่องชั่งถัดไป",
      exact: true,
    });
    await expect(next).toBeEnabled();
    const sample = await next.evaluate((node) => {
      const list = document.getElementById(node.getAttribute("aria-controls")!)!;
      const distance =
        list.children[1].getBoundingClientRect().left -
        list.children[0].getBoundingClientRect().left;
      (node as HTMLButtonElement).click();
      return { left: list.scrollLeft, distance };
    });
    if (reducedMotion === "reduce") expect(Math.abs(sample.left - sample.distance)).toBeLessThan(2);
    else expect(sample.left).toBeLessThan(sample.distance - 1);
    await expect
      .poll(() =>
        track.evaluate((list, distance) => Math.abs(list.scrollLeft - distance), sample.distance),
      )
      .toBeLessThan(2);
  });
}

for (const width of [390, 1521]) {
  test(`product shelf buttons follow the specified duration at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 940 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/products");
    const track = page.locator("#products-rail-scales");
    const next = page.getByRole("button", {
      name: "เลื่อนเครื่องชั่งถัดไป",
      exact: true,
    });
    await expect(next).toBeEnabled();
    const run = await next.evaluate(async (button) => {
      const list = document.getElementById(button.getAttribute("aria-controls")!)!;
      const pitch =
        list.children[1].getBoundingClientRect().left -
        list.children[0].getBoundingClientRect().left;
      const start = performance.now();
      (button as HTMLButtonElement).click();
      let intermediate = false;
      while (list.hasAttribute("data-stepping")) {
        await new Promise(requestAnimationFrame);
        intermediate ||= list.scrollLeft > 0 && list.scrollLeft < pitch - 1;
      }
      return {
        duration: performance.now() - start,
        intermediate,
        error: Math.abs(list.scrollLeft - pitch),
      };
    });
    expect(run.intermediate).toBe(true);
    expect(Math.abs(run.duration - (width === 1521 ? 465 : 478))).toBeLessThan(65);
    expect(run.error).toBeLessThan(1);
    await next.evaluate((button) => {
      (button as HTMLButtonElement).click();
      (button as HTMLButtonElement).click();
    });
    await expect
      .poll(() =>
        track.evaluate((list) => {
          const pitch =
            list.children[1].getBoundingClientRect().left -
            list.children[0].getBoundingClientRect().left;
          return Math.abs(list.scrollLeft - pitch * 3);
        }),
      )
      .toBeLessThan(2);
    await next.click();
    await track.dispatchEvent("wheel", { deltaX: 10 });
    await expect(track).toHaveCSS("scroll-snap-type", /x mandatory|inline mandatory/);
  });
}

for (const [route, selector] of [
  ["/products", "#products-categories a"],
  ["/products/category/scales", "#products-chapters button:enabled"],
  ["/products?catalog=all", "#catalog-categories button:enabled"],
]) {
  test(`image menus show the pointer over their visible content on ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1521, height: 940 });
    await page.goto(route);
    const controls = page.locator(selector);
    await expect(controls.first()).toBeVisible();
    for (const control of await controls.all()) {
      await control.hover();
      const cursors = await control.evaluate((item) => {
        const box = item.getBoundingClientRect();
        const points = [item.querySelector("img")!, item.lastElementChild!].flatMap((node) => {
          const r = node.getBoundingClientRect();
          return r.width && r.height ? [[r.left + r.width / 2, r.top + r.height / 2]] : [];
        });
        points.push([box.left + box.width / 2, box.top + 2]);
        return points.map(([x, y]) => {
          const hit = document.elementFromPoint(x, y);
          return hit && item.contains(hit) && getComputedStyle(hit).cursor === "pointer";
        });
      });
      expect(cursors, route).toEqual(
        selector.startsWith("#catalog-categories") ? [true, true] : [true, true, true],
      );
    }
  });
}
