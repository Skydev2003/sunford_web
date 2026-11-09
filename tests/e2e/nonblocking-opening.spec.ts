import { expect, test } from "@playwright/test";

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`Hero and native links remain exposed before hydration at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    let release!: () => void;
    const scripts = new Promise<void>((resolve) => (release = resolve));
    await page.route(/\/_next\/static\/.*\.js(?:\?|$)/, async (route) => {
      await scripts;
      await route.continue();
    });
    try {
      await page.goto("/", { waitUntil: "commit" });
      const hero = page.locator("[data-hero-scene]");
      await expect(hero.locator("h1")).toBeAttached();
      await expect(hero).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await expect(hero.locator("h1")).toBeVisible({ timeout: 500 });
      await expect(hero.locator("p")).toBeVisible();
      await expect(page.locator(".site-header .brand")).toBeVisible();
      const cta = hero.getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" });
      await expect(cta).toBeVisible();
      expect(
        await cta.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2),
          );
        }),
      ).toBe(true);
      expect(await hero.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(false);
      await page.mouse.wheel(0, 180);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
    } finally {
      release();
      await page.unrouteAll({ behavior: "wait" });
    }
  });

  test(`the logo stays in its reserved space and leaves search clickable at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const opening = page.locator("[data-brand-opening]");
    await expect(opening).toHaveAttribute("data-phase", "symbol");
    const hero = page.locator("[data-hero-scene]");
    await expect(hero.locator("h1")).toBeVisible({ timeout: 500 });
    await expect(hero.locator("p")).toBeVisible();
    await expect(hero).toHaveAttribute("data-ready", "true");
    await expect(page.locator(".site-header .brand")).toBeVisible();
    await expect(opening).toHaveCSS("pointer-events", "none");
    const bounds = (await opening.boundingBox())!;
    const space = (await hero.locator("[data-hero-logo-space]").boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(space.x - 1);
    expect(bounds.y).toBeGreaterThanOrEqual(space.y - 1);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(space.x + space.width + 1);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(space.y + space.height + 1);
    expect(await opening.getAttribute("data-phase")).not.toBe("complete");
    await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" })).toBeHidden();
  });
}

test("a delayed logo font dependency cannot hold Hero content or video playback", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  let release!: () => void;
  const fonts = new Promise<void>((resolve) => (release = resolve));
  await page.route("**/*.ttf", async (route) => {
    await fonts;
    await route.continue();
  });
  try {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const hero = page.locator("[data-hero-scene]");
    await expect(hero).toHaveAttribute("data-enhanced", "true");
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "pending");
    await expect(hero.locator("h1")).toBeVisible({ timeout: 1500 });
    await expect(hero.locator("p")).toBeVisible();
    await expect(hero).toHaveAttribute("data-ready", "true");
    await expect
      .poll(() => hero.locator("video").evaluate((video: HTMLVideoElement) => video.paused))
      .toBe(false);
    const cta = hero.getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ" });
    await cta.focus();
    await expect(cta).toBeFocused();
    expect(await hero.evaluate((element) => Boolean(element.closest("[inert]")))).toBe(false);
  } finally {
    release();
    await page.unrouteAll({ behavior: "wait" });
  }
});

test("consultation works during the logo and the contact page gets its own Header surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "symbol");
  const cta = page.getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ", exact: true });
  await expect(cta).toBeVisible({ timeout: 500 });
  await cta.click();
  await expect(page).toHaveURL(/\/contact-us$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ติดต่อเรา");
  await expect(page.locator(".site-header:visible")).toHaveCount(0);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
});
