import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`product title and category links work with reduced motion or scripts disabled at ${width}px`, async ({
    browser,
    baseURL,
  }) => {
    for (const javaScriptEnabled of [true, false]) {
      const context = await browser.newContext({
        baseURL,
        viewport: { width, height: 900 },
        javaScriptEnabled,
        reducedMotion: "reduce",
      });
      try {
        const page = await context.newPage();
        await page.goto("/products");
        const directory = page.locator("[data-products-directory]");
        await expect(
          directory.getByRole("heading", { level: 1, name: "เครื่องชั่งน้ำหนักล้ำสมัย" }),
        ).toBeAttached();
        const wordmark = directory.locator("[data-products-logo]");
        await expect(wordmark.locator("img")).toBeVisible();
        expect(
          await wordmark
            .locator("[data-letter]")
            .evaluateAll((letters) =>
              letters.every((letter) => getComputedStyle(letter).opacity === "1"),
            ),
        ).toBe(true);
        await expect(directory.locator("[data-products-header-wash], header canvas")).toHaveCount(
          0,
        );
        const category = directory
          .locator('#products-categories a[href="/products/category/scales"]')
          .first();
        await expect(category).toBeVisible();
        await expect(directory.locator("#products-rail-scales a").first()).toBeVisible();
        await category.click();
        await expect(page).toHaveURL(/\/products\/category\/scales$/);
      } finally {
        await context.close();
      }
    }
  });
}

test("the SUNFORD letters open in order without a glass canvas", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products");
  const mark = page.locator("[data-products-logo]");
  const initial = mark.locator("img");
  const letters = mark.locator("[data-letter]");
  await expect(initial).toBeVisible();
  const finalX = (await initial.boundingBox())!.x;
  await page.clock.install({ time: new Date("2026-11-21T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-11-21T00:00:02Z"));
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect
    .poll(() => mark.evaluate((el) => el.getAnimations({ subtree: true }).length))
    .toBe(7);
  const opacity = () =>
    letters.evaluateAll((nodes) => nodes.map((node) => Number(getComputedStyle(node).opacity)));
  expect(await opacity()).toEqual([0, 0, 0, 0, 0, 0]);
  const startX = (await initial.boundingBox())!.x;
  await page.clock.runFor(780);
  const revealed = await opacity();
  expect(revealed[0]).toBeGreaterThan(0);
  expect(revealed[0]).toBeLessThan(1);
  expect(revealed.slice(1)).toEqual([0, 0, 0, 0, 0]);
  expect((await initial.boundingBox())!.x).toBeLessThan(startX);
  await page.clock.runFor(1600);
  await expect(mark).toHaveAttribute("data-settled", "");
  expect(await opacity()).toEqual([1, 1, 1, 1, 1, 1]);
  expect((await initial.boundingBox())!.x).toBeCloseTo(finalX, 1);
  await expect(mark.locator("canvas")).toHaveCount(0);
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
  await expect(track).toBeVisible();
  await expect(next).toBeEnabled();
  const cards = await track.locator(":scope > li").count();
  for (let i = 0; i < cards && (await next.isEnabled()); i++) {
    const before = await track.evaluate((el) => el.scrollLeft);
    await next.click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  }
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

for (const [route, trackId, width] of [
  ["/products", "products-rail-scales", 390],
  ["/products", "products-rail-scales", 1521],
  ["/products/category/indicators", "products-lineup", 390],
  ["/products/category/indicators", "products-lineup", 1440],
] as const) {
  test(`product shelf buttons follow the specified duration on ${route} at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 940 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(route);
    const track = page.locator(`#${trackId}`);
    const next = page.locator(`button[aria-controls="${trackId}"][aria-label$="ถัดไป"]`);
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
    expect(Math.abs(run.duration - (width >= 1024 ? 465 : 478))).toBeLessThan(65);
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

for (const width of [768, 1440]) {
  test(`shelf arrows settle on real card starts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 940 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/products");

    const indicators = page.locator("#products-rail-indicators");
    const indicatorNext = page.locator('button[aria-controls="products-rail-indicators"]').last();
    await indicatorNext.scrollIntoViewIfNeeded();
    await expect(indicatorNext).toBeEnabled();
    const thirdStop = await indicators.evaluate(
      (list) =>
        list.children[3].getBoundingClientRect().left -
        list.firstElementChild!.getBoundingClientRect().left,
    );
    await indicatorNext.evaluate((node) => {
      const button = node as HTMLButtonElement;
      button.click();
      button.click();
      button.click();
    });
    await expect(indicators).not.toHaveAttribute("data-stepping");
    expect(
      Math.abs((await indicators.evaluate((list) => list.scrollLeft)) - thirdStop),
    ).toBeLessThan(1);

    const scales = page.locator("#products-rail-scales");
    const [scalePrevious, scaleNext] = await page
      .locator('button[aria-controls="products-rail-scales"]')
      .all();
    await scaleNext.scrollIntoViewIfNeeded();
    const lastCardStart = await scales.evaluate((list) => {
      const rightEdge = list.scrollWidth - list.clientWidth;
      const firstLeft = list.firstElementChild!.getBoundingClientRect().left;
      const cardStarts = Array.from(
        list.children,
        (card) => card.getBoundingClientRect().left - firstLeft,
      );
      list.scrollTo({ left: rightEdge, behavior: "instant" });
      return cardStarts.findLast((left) => left < rightEdge)!;
    });
    await expect(scaleNext).toBeDisabled();
    await scalePrevious.click();
    await expect(scales).not.toHaveAttribute("data-stepping");
    expect(
      Math.abs((await scales.evaluate((list) => list.scrollLeft)) - lastCardStart),
    ).toBeLessThan(1);
  });
}

for (const [route, selector] of [
  ["/products", "#products-categories a"],
  ["/products/category/scales", "#products-chapters a[href]"],
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
