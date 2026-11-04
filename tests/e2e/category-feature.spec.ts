import { expect, test } from "@playwright/test";
import type { Product } from "../../src/features/catalog/types";
import { catalogProductGroup } from "../../src/features/catalog/data/catalog-supplements";

const categoryTitles = ["เครื่องชั่ง", "อุปกรณ์เสริม", "โครงสร้างแท่นชั่ง", "อินดิเคเตอร์แท่นชั่ง"];
const categoryPaths = [
  "/products",
  "/product/scale-accessories",
  "/product/scale-platforms",
  "/Indicator",
];

test("category choices and product belt fit below navigation on desktop", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#product-experience");
  for (const viewport of [
    { width: 1536, height: 730 },
    { width: 1280, height: 720 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => {
      const section = document.querySelector("#product-experience")!;
      const header = document.querySelector(".site-header")!;
      scrollTo({
        top: section.getBoundingClientRect().top + scrollY - header.getBoundingClientRect().height,
        behavior: "instant",
      });
    });
    for (const button of await section.locator(".category-feature-trigger").all()) {
      await button.click();
      const bounds = (await section.boundingBox())!;
      const nav = (await page.locator(".site-header").boundingBox())!;
      expect(bounds.y).toBeGreaterThanOrEqual(nav.height - 1);
      expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
      expect(
        await section
          .locator(".category-feature-panel")
          .evaluateAll((cards) =>
            cards.every((card) => card.scrollHeight <= card.clientHeight + 1),
          ),
      ).toBe(true);
      await expect(section.locator(".category-feature-products")).toBeInViewport({ ratio: 1 });
    }
  }
});

test("category selection changes its media while preserving every description and destination", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#product-experience");
  await section.scrollIntoViewIfNeeded();
  const buttons = section.locator(".category-feature-trigger");
  await expect(buttons).toHaveCount(4);
  await expect(section.locator(".category-feature-card-heading")).toHaveText(categoryTitles);
  await expect(section.locator(".category-feature-description")).toHaveCount(4);
  await expect(section.locator(".category-feature-panel a")).toHaveCount(0);
  await expect(section.locator(".category-feature-icon img")).toHaveCount(0);
  await expect(section.locator(".category-feature-icon svg")).toHaveCount(4);
  const icons = await section
    .locator(".category-feature-icon svg")
    .evaluateAll((nodes) => nodes.map((node) => node.innerHTML));
  expect(new Set(icons).size).toBe(4);
  await expect(page.locator(".source-showcase, .showcase-tile")).toHaveCount(0);
  const response = await page.request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products }: { products: Product[] } = await response.json();
  const groups = categoryPaths.map((path) =>
    products.filter((product) => catalogProductGroup(product) === path && product.image),
  );
  const expectedImages = [
    "/images/pd/WPS10KS.png",
    "/images/pd/TRP-58B.png",
    "/videos/ChatGPT Image Nov 4, 2026, 01_57_30 PM.png",
    "/videos/ChatGPT Image Nov 4, 2026, 01_57_44 PM.png",
  ];
  const sources = new Set<string>();
  for (let index = 0; index < 4; index++) {
    const button = buttons.nth(index);
    await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true");
    await expect(section.locator('button[aria-pressed="true"]')).toHaveCount(1);
    const image = section.locator(".category-feature-media img").last();
    await expect
      .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
      .toBeGreaterThan(0);
    await expect(image).toHaveAttribute(
      "alt",
      (await button.locator(".category-feature-card-heading").innerText()).trim(),
    );
    sources.add((await image.getAttribute("src"))!);
    expect(new URL((await image.getAttribute("src"))!, page.url()).searchParams.get("url")).toBe(
      expectedImages[index],
    );
    await expect(image).toHaveCSS("object-fit", "contain");
    await expect(section.locator(".category-feature-media img")).toHaveCount(index === 1 ? 2 : 1);
    if (index === 1)
      await expect(section.getByAltText("ไฟสัญญาณสามสี SUNFORD RYG-POLE")).toBeVisible();
    const originals = section.locator(".category-feature-product:not(.is-duplicate)");
    const count = await originals.count();
    expect(count).toBeGreaterThan(0);
    expect(
      await originals.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-product-id")),
      ),
    ).toEqual(groups[index].map((product) => product.id));
    const paddedCount = count * Math.max(1, Math.ceil(20 / count));
    await expect(section.locator(".category-feature-product")).toHaveCount(paddedCount * 3);
    expect(
      await section
        .locator(".category-feature-track")
        .evaluate((node) => (node as HTMLElement).style.animationDuration),
    ).toBe(`${paddedCount * 2}s`);
    const entries = await originals.evaluateAll((nodes) =>
      nodes.map((node) => ({
        id: node.getAttribute("data-product-id"),
        title: node.getAttribute("aria-label"),
        href: node.getAttribute("href"),
        image: node.querySelector("img")?.getAttribute("src"),
      })),
    );
    for (const entry of entries) {
      const product = products.find((product) => product.id === entry.id)!;
      expect(product).toBeTruthy();
      expect(entry.title).toBe(product.name);
      expect(entry.href).toBe(`/products/${product.slug}`);
      const url = new URL(entry.image!, page.url());
      expect(url.searchParams.get("url") ?? url.pathname).toBe(product.image);
    }
    expect(await originals.first().getAttribute("href")).toMatch(/^\/products\//);
    expect(
      await section
        .locator(".category-feature-product.is-duplicate")
        .evaluateAll((nodes) =>
          nodes.every(
            (node) =>
              node.getAttribute("aria-hidden") === "true" && node.getAttribute("tabindex") === "-1",
          ),
        ),
    ).toBe(true);
  }
  expect(sources.size).toBe(4);
  await buttons.first().focus();
  await page.keyboard.press("Enter");
  await expect(buttons.first()).toHaveAttribute("aria-pressed", "true");
  expect(await buttons.first().evaluate((n) => getComputedStyle(n).outlineWidth)).toBe("3px");
});

test("a category belt product opens its existing product details with Enter", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const link = page.locator(".category-feature-product:not(.is-duplicate)").first();
  const href = await link.getAttribute("href");
  await link.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new URL(href!, page.url()).href);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("failed category artwork retains its frame and category navigation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/_next/image?*", (route) => {
    const source = new URL(route.request().url()).searchParams.get("url") ?? "";
    return source === "/images/pd/WPS10KS.png" ? route.abort() : route.continue();
  });
  await page.goto("/");
  const section = page.locator("#product-experience");
  await section.scrollIntoViewIfNeeded();
  const media = section.locator(".category-feature-media");
  await expect(media.locator(".media-placeholder")).toBeVisible();
  const frame = (await media.boundingBox())!;
  expect(frame.width / frame.height).toBeCloseTo(16 / 9, 2);
  await section.getByRole("button", { name: "สำรวจ อินดิเคเตอร์แท่นชั่ง", exact: true }).click();
  await expect(
    section.getByRole("button", { name: "สำรวจ อินดิเคเตอร์แท่นชั่ง", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(media.locator("img")).toBeVisible();
});

test("category belt flows continuously, pauses on hover and preserves its timeline when selection changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const section = page.locator("#product-experience");
  const buttons = section.locator(".category-feature-trigger");
  await buttons.nth(1).click();
  await expect(buttons.nth(1)).toHaveAttribute("aria-pressed", "true");
  const track = section.locator(".category-feature-track");
  const handle = await track.elementHandle();
  const time = () => track.evaluate((e) => e.getAnimations()[0]?.currentTime as number);
  await section.locator(".category-feature-belt").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const start = await time();
  await expect.poll(time).toBeGreaterThan(start + 100);
  await section.locator(".category-feature-belt").hover();
  const paused = await time();
  await page.waitForTimeout(200);
  expect(Math.abs((await time()) - paused)).toBeLessThan(2);
  await page.mouse.move(0, 0);
  await expect.poll(time).toBeGreaterThan(paused + 100);
  const before = await time();
  await buttons.nth(2).click();
  await expect(buttons.nth(2)).toHaveAttribute("aria-pressed", "true");
  expect(
    await handle!.evaluate((e) => e === document.querySelector(".category-feature-track")),
  ).toBe(true);
  expect(await time()).toBeGreaterThanOrEqual(before);
  const selectedImage = await section
    .locator(".category-feature-media img")
    .last()
    .getAttribute("src");
  const panel = section.locator(".category-feature-panel").first();
  await panel.hover();
  await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, -4)");
  await expect(buttons.nth(2)).toHaveAttribute("aria-pressed", "true");
  await expect(section.locator(".category-feature-media img").last()).toHaveAttribute(
    "src",
    selectedImage!,
  );
  await expect(track).toHaveCSS("gap", "12px");
  await expect(section.locator(".category-feature-product").first()).toHaveCSS("width", "70px");
});

test("category keyboard links remain reachable and live reduced motion provides a static scrollable list", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const section = page.locator("#product-experience");
  await section.locator(".category-feature-trigger").first().click();
  const belt = section.locator(".category-feature-belt");
  const link = section.locator(".category-feature-product:not(.is-duplicate)").last();
  await page.keyboard.press("Tab");
  await link.focus();
  await expect(link).toBeFocused();
  await expect(link).toBeInViewport();
  await expect(section.locator(".category-feature-track")).toHaveCSS("animation-name", "none");
  await section.locator(".category-feature-trigger").first().focus();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(section.locator(".category-feature-track")).toHaveCSS("animation-name", "none");
  await expect(section.locator(".category-feature-product.is-duplicate").first()).toBeHidden();
  await expect(belt).toHaveCSS("overflow-x", "auto");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(section.locator(".category-feature-track")).toHaveCSS(
    "animation-name",
    "category-feature-scroll",
  );
});

for (const width of [1440, 390]) {
  test(`moving scale and accessory links navigate on the first click at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const category of [0, 1]) {
      await page.goto("/");
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
      const section = page.locator("#product-experience");
      await section.locator(".category-feature-trigger").nth(category).click();
      const belt = section.locator(".category-feature-belt");
      await belt.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await section.locator(".category-feature-track").evaluate((e) => {
        e.getAnimations()[0].currentTime = 5000;
      });
      await belt.hover();
      const target = await belt.evaluate((e) => {
        const box = e.getBoundingClientRect();
        for (const link of e.querySelectorAll<HTMLAnchorElement>("a")) {
          const r = link.getBoundingClientRect();
          if (r.left > box.left + box.width * 0.15 && r.right < box.right - box.width * 0.1)
            return { href: link.href, x: r.x + r.width / 2, y: r.y + r.height / 2 };
        }
        return null;
      });
      expect(target).not.toBeNull();
      await page.mouse.click(target!.x, target!.y);
      await expect(page).toHaveURL(target!.href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
}

test("moving accessory links open on the first touch tap", async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 1000 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "no-preference",
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    await page.getByRole("button", { name: "สำรวจ อุปกรณ์เสริม", exact: true }).tap();
    const belt = page.locator(".category-feature-belt");
    await belt.scrollIntoViewIfNeeded();
    await page.locator(".category-feature-track").evaluate((e) => {
      e.getAnimations()[0].currentTime = 5000;
    });
    const target = await belt.evaluate((e) => {
      const box = e.getBoundingClientRect();
      const link = [...e.querySelectorAll<HTMLAnchorElement>("a")].find((a) => {
        const r = a.getBoundingClientRect();
        return r.left > box.left + box.width * 0.15 && r.right < box.right - box.width * 0.1;
      })!;
      const r = link.getBoundingClientRect();
      return { href: link.href, x: r.x + r.width / 2, y: r.y + r.height / 2 };
    });
    await page.touchscreen.tap(target.x, target.y);
    await expect(page).toHaveURL(target.href);
  } finally {
    await context.close();
  }
});

test("category media precedes readable two-column choices on mobile and sits alongside on desktop", async ({
  page,
}, testInfo) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const section = page.locator("#product-experience");
  for (const width of [320, 390, 576, 577, 768, 769, 991, 992, 1399, 1400, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await section.scrollIntoViewIfNeeded();
    const media = (await section.locator(".category-feature-media").boundingBox())!;
    const grid = (await section.locator(".category-feature-grid").boundingBox())!;
    expect(media.width / media.height).toBeCloseTo(16 / 9, 2);
    if (width < 992) {
      expect(grid.y).toBeGreaterThanOrEqual(media.y + media.height + 20);
    } else {
      expect(media.x).toBeGreaterThan(grid.x + grid.width);
    }
    for (const description of await section.locator(".category-feature-description").all()) {
      if (width < 576) await expect(description).toBeHidden();
      else {
        await expect(description).toBeVisible();
        expect(await description.evaluate((n) => n.scrollWidth <= n.clientWidth + 1)).toBe(true);
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if ([320, 390, 768, 1440].includes(width)) {
      await expect(section.locator(".category-feature-card-heading")).toHaveText(categoryTitles);
      for (const button of await section.locator(".category-feature-trigger").all()) {
        await button.click();
        await expect(button).toHaveAttribute("aria-pressed", "true");
        const image = section.locator(".category-feature-media img").last();
        await expect
          .poll(() => image.evaluate((node: HTMLImageElement) => node.naturalWidth))
          .toBeGreaterThan(0);
        expect(await button.evaluate((node) => node.scrollWidth <= node.clientWidth + 1)).toBe(
          true,
        );
      }
      await section.screenshot({ path: testInfo.outputPath(`categories-${width}.png`) });
    }
  }
  expect(pageErrors).toEqual([]);
});

test("category artwork, vector icons and product destinations remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    const section = page.locator("#product-experience");
    await expect(section.locator(".category-feature-description")).toHaveCount(4);
    await expect(section.locator(".category-feature-panel a")).toHaveCount(0);
    await expect(section.locator(".category-feature-icon svg")).toHaveCount(4);
    await expect(section.locator(".category-feature-media img")).toBeVisible();
    await expect(
      section.locator(".category-feature-product:not(.is-duplicate)").first(),
    ).toHaveAttribute("href", /^\/products\//);
  } finally {
    await context.close();
  }
});
