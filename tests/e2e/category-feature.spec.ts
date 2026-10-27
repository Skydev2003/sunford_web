import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test("four category panels change the shared background and reveal working Sunford links", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|didn't match|server rendered/i.test(message.text()))
      errors.push(message.text());
  });
  await page.goto("/");
  const section = page.locator("#product-experience");
  await section.scrollIntoViewIfNeeded();
  // Category artwork must use content-hashed URLs, so replacing the public file
  // cannot reuse an optimized variant of the old image at the same URL.
  const baseSource = new URL(
    (await section.locator(".is-base img").getAttribute("src"))!,
    page.url(),
  ).searchParams.get("url");
  expect(baseSource).toMatch(/^\/_next\/static\/media\/overview\.[a-z0-9_-]+\.webp$/i);
  const imageResponse = await request.get(baseSource!);
  expect(imageResponse.ok()).toBe(true);
  expect(
    (await imageResponse.body()).equals(
      await readFile("public/images/home-categories/overview.webp"),
    ),
  ).toBe(true);
  const panels = section.locator(".category-feature-panel");
  await expect(panels).toHaveCount(4);
  await expect(page.locator("main #products")).toHaveCount(0);
  for (let index = 0; index < 4; index++) {
    const panel = panels.nth(index);
    const trigger = panel.locator(".category-feature-trigger");
    await trigger.hover();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(section.locator('.category-feature-trigger[aria-expanded="true"]')).toHaveCount(1);
    const link = panel.getByRole("link");
    await expect(link).toBeVisible();
    const href = (await link.getAttribute("href"))!;
    expect(href.startsWith("/")).toBe(true);
    expect((await request.get(href)).ok(), href).toBe(true);
    const background = section.locator(".category-feature-image.is-active");
    await expect(background).toHaveCSS("opacity", "1");
    await expect
      .poll(() =>
        background.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  await panels.first().locator(".category-feature-trigger").hover();
  await page.evaluate(() => document.fonts.ready);
  await expect(panels.first().getByRole("link")).toBeInViewport();
  await section.screenshot({
    path: test.info().outputPath("category-feature-desktop.png"),
    animations: "disabled",
  });
  await page.mouse.move(5, 65);
  await expect(section.locator('.category-feature-trigger[aria-expanded="true"]')).toHaveCount(0);
  await section.screenshot({
    path: test.info().outputPath("category-feature-default.png"),
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});

test("category image URLs stay identical from server HTML through hydration and return navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|didn't match|server rendered/i.test(message.text()))
      errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => {
    releaseScripts = resolve;
  });
  await page.route("**/_next/**/*.js*", async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "commit" });
    const images = page.locator("#product-experience .category-feature-backdrops img");
    await expect(images).toHaveCount(5);
    const snapshot = () =>
      images.evaluateAll((elements) =>
        elements.map((element) => ({
          src: new URL(element.getAttribute("src")!, location.href).href,
          srcset: element.getAttribute("srcset"),
          sizes: element.getAttribute("sizes"),
        })),
      );
    const serverImages = await snapshot();
    for (const image of serverImages)
      expect(new URL(image.src).searchParams.get("url")).toMatch(/^\/_next\/static\/media\//);
    releaseScripts();
    await page.waitForLoadState("load");
    const section = page.locator("#product-experience");
    const trigger = section.locator(".category-feature-trigger").first();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(await snapshot()).toEqual(serverImages);
    await section.locator(".category-feature-panel").first().getByRole("link").click();
    await expect(page.locator("main.source-content-page")).toBeVisible();
    await page.goBack();
    await expect(page.locator("#product-experience")).toBeVisible();
    expect(await snapshot()).toEqual(serverImages);
    expect(errors).toEqual([]);
  } finally {
    releaseScripts();
  }
});

test("keyboard users can reveal a category, close it and follow its link", async ({ page }) => {
  await page.goto("/");
  const panel = page.locator("#product-experience .category-feature-panel").first();
  const trigger = panel.locator(".category-feature-trigger");
  await trigger.focus();
  await trigger.press("Enter");
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.press("Enter");
  const link = panel.getByRole("link");
  const href = (await link.getAttribute("href"))!;
  await link.focus();
  await link.press("Enter");
  await expect(page).toHaveURL(new URL(href, "http://localhost:3000").href);
  await expect(page.locator("main.source-content-page")).toBeVisible();
});

test.describe("touch category panels", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("touch opens details, changes selection and closes without page overflow", async ({
    page,
  }) => {
    await page.goto("/");
    const section = page.locator("#product-experience");
    await section.scrollIntoViewIfNeeded();
    const triggers = section.locator(".category-feature-trigger");
    await triggers.first().tap();
    await expect(triggers.first()).toHaveAttribute("aria-expanded", "true");
    await triggers.nth(1).tap();
    await expect(triggers.first()).toHaveAttribute("aria-expanded", "false");
    await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "true");
    const panel = section.locator(".category-feature-panel").nth(1);
    await expect(panel.getByRole("link")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await section.screenshot({
      path: test.info().outputPath("category-feature-mobile.png"),
      animations: "disabled",
    });
    await panel.getByRole("button", { name: /ปิดรายละเอียด/ }).tap();
    await expect(triggers.nth(1)).toHaveAttribute("aria-expanded", "false");
    for (const width of [320, 390, 768, 1280, 1800]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    }
  });
});
