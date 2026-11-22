import { expect, test, type Locator, type Page } from "@playwright/test";

type Reveal = {
  target: string;
  index: number;
  duration: number;
  delay: number;
  easing: string;
  startOpacity: number;
  endOpacity: number;
  translate: string;
};
type ProbedWindow = Window & { scrollReveals?: Reveal[] };

async function installProbe(page: Page) {
  await page.addInitScript(() => {
    const records: Reveal[] = [];
    (window as ProbedWindow).scrollReveals = records;
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (
        options &&
        typeof options === "object" &&
        options.id === "sunford-scroll-reveal" &&
        Array.isArray(frames)
      ) {
        records.push({
          target: this.id || this.querySelector("h2")?.id || this.closest("section")?.id || "",
          index: this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : -1,
          duration: Number(options.duration),
          delay: Number(options.delay),
          easing: String(options.easing),
          startOpacity: Number(frames[0].opacity),
          endOpacity: Number(frames[1].opacity),
          translate: String(frames[0].translate),
        });
      }
      return animate.call(this, frames, options);
    };
  });
}

function reveals(page: Page) {
  return page.evaluate(() => (window as ProbedWindow).scrollReveals ?? []);
}

async function approach(target: Locator) {
  await target.evaluate((element) => {
    const top = scrollY + element.getBoundingClientRect().top;
    scrollTo({ top: Math.max(0, top - innerHeight - 30), behavior: "instant" });
  });
  await expect(target).not.toBeInViewport();
}

async function showFraction(target: Locator, fraction: number) {
  await target.evaluate((element, value) => {
    const { top, height } = element.getBoundingClientRect();
    scrollTo({ top: scrollY + top - innerHeight + height * value, behavior: "instant" });
  }, fraction);
}

test("homepage heading reveals once when scrolled into view", async ({ page }) => {
  await installProbe(page);
  await page.goto("/");
  await expect(page.locator("#main-content")).toHaveAttribute("data-scroll-reveal-mode", "enabled");
  const heading = page.locator("#story h2").first();
  await expect(heading).toHaveCSS("opacity", "0");
  expect(await reveals(page)).toEqual([]);

  await approach(heading);
  await heading.scrollIntoViewIfNeeded();
  await expect
    .poll(async () => (await reveals(page)).filter(({ target }) => target === "story"))
    .toContainEqual(
      expect.objectContaining({
        duration: 950,
        delay: 0,
        easing: "cubic-bezier(0.25, 0.35, 0.25, 1)",
        startOpacity: 0,
        endOpacity: 1,
        translate: "0 24px",
      }),
    );
  await expect(heading).toHaveCSS("translate", "none");
  const previous = (await reveals(page)).filter(({ target }) => target === "story").length;
  await approach(heading);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeInViewport();
  expect((await reveals(page)).filter(({ target }) => target === "story")).toHaveLength(previous);
});

for (const [path, heading] of [
  ["/products", "products-category-indicators"],
  ["/products/category/scales", "products-services-title"],
] as const) {
  test(`below-fold heading at ${path} reveals once without staging the page title`, async ({
    page,
  }) => {
    await installProbe(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const main = page.locator("main#main-content:visible");
    await expect(main).toHaveAttribute("data-scroll-reveal-mode", "enabled");
    await expect(main.locator("[data-scroll-reveal] h1")).toHaveCount(0);
    const target = main.locator(`[data-scroll-reveal]:has(#${heading})`);
    await expect(target).toHaveCSS("opacity", "0");
    await target.scrollIntoViewIfNeeded();
    const matching = async () => (await reveals(page)).filter((item) => item.target === heading);
    await expect
      .poll(matching)
      .toContainEqual(expect.objectContaining({ duration: 950, delay: 0, translate: "0 24px" }));
    await expect(target).toHaveCSS("translate", "none");
    await approach(target);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toBeInViewport();
    expect(await matching()).toHaveLength(1);
  });
}

test("product listing reveals grid cards with only four repeating delays", async ({ page }) => {
  await installProbe(page);
  await page.goto("/products/category/scales/industrial");
  const listing = page.locator("[data-scroll-reveal-listing]");
  await expect(listing).toHaveAttribute("data-scroll-reveal-mode", "enabled");
  const card = listing.locator("#mock-product-results > article").nth(9);
  await expect(card).toBeAttached();
  await expect(card).toHaveCSS("opacity", "0");
  expect(await reveals(page)).toEqual([]);

  await showFraction(card, 0.05);
  await expect(card).toBeInViewport({ ratio: 0.03 });
  await expect(card).not.toBeInViewport({ ratio: 0.1 });
  await expect(card).toHaveCSS("opacity", "0");
  expect((await reveals(page)).find(({ index }) => index === 9)).toBeUndefined();

  await showFraction(card, 0.11);
  await expect(card).toBeInViewport({ ratio: 0.1 });
  await expect
    .poll(async () => (await reveals(page)).find(({ index }) => index === 9)?.delay)
    .toBe(100);
  const animated = await reveals(page);
  for (const { index, delay, duration, easing } of animated) {
    expect(delay).toBe((index % 4) * 100);
    expect(duration).toBe(950);
    expect(easing).toBe("cubic-bezier(0.25, 0.35, 0.25, 1)");
  }
  const link = card.locator("a").last();
  await link.focus();
  await expect(link).toBeFocused();
  await expect(card).toHaveCSS("translate", "none");
  await link.click();
  await expect(page).toHaveURL(/\/products\/[^/]+(?:\?.*)?$/);
  const beforeBack = await reveals(page);
  await page.goBack();
  await expect(card).toHaveCSS("opacity", "1");
  const afterBack = await reveals(page);
  if (afterBack.length) expect(afterBack).toEqual(beforeBack);

  const pending = listing.locator("#mock-product-results > article").nth(20);
  await expect(pending).toHaveCSS("opacity", "0");
  const pendingLink = pending.locator("a").first();
  await pendingLink.evaluate((anchor) => anchor.focus({ preventScroll: true }));
  await expect(pendingLink).toBeFocused();
  await expect(pending).toHaveCSS("opacity", "1");
  await pending.scrollIntoViewIfNeeded();
  expect((await reveals(page)).find(({ index }) => index === 20)).toBeUndefined();
});

test("reduced motion leaves homepage headings in place", async ({ page }) => {
  await installProbe(page);
  await page.goto("/");
  const main = page.locator("#main-content");
  const heading = page.locator("#story h2").first();
  await expect(main).toHaveAttribute("data-scroll-reveal-mode", "enabled");
  await expect(heading).toHaveCSS("opacity", "0");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(main).toHaveAttribute("data-scroll-reveal-mode", "reduced");
  await approach(heading);
  await page.mouse.wheel(0, 190);
  await expect(heading).toBeInViewport();
  expect(await reveals(page)).toEqual([]);
  await expect(heading).toHaveCSS("opacity", "1");
});

test("homepage headings and controls are available when IntersectionObserver is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "IntersectionObserver", { value: undefined });
  });
  await page.goto("/");
  await expect(page.locator("#section-two-title")).toHaveCSS("opacity", "1");
  const play = page.locator("#sunford-biz-talk button");
  await expect(play).toBeEnabled();
  await play.focus();
  await expect(play).toBeFocused();
  await expect(page.locator("#main-content")).not.toHaveAttribute("data-scroll-reveal-mode");
});
