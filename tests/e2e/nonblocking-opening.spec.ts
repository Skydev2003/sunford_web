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
      await expect(page.locator("[data-brand-opening]")).toHaveCount(0);
      await expect(hero).toHaveCSS("background-color", "rgb(0, 0, 0)");
      await expect(hero.locator("h1")).toBeVisible({ timeout: 500 });
      await expect(hero.locator("p")).toBeVisible();
      await expect(hero.locator("video[src], video source")).toHaveCount(0);
      await expect(page.getByRole("link", { name: "SUNFORD หน้าแรก", exact: true })).toBeVisible();
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

  test(`search is usable immediately on the homepage at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("[data-brand-opening]")).toHaveCount(0);
    const hero = page.locator("[data-hero-scene]");
    await expect(hero.locator("h1")).toBeVisible({ timeout: 500 });
    await expect(hero.locator("p")).toBeVisible();
    await expect(hero).toHaveAttribute("data-ready", "true");
    await page.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" })).toBeHidden();
  });
}

test("a delayed font download cannot hold Hero content or video playback", async ({ page }) => {
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

test("consultation works on opening the homepage and the contact page gets its own Header surface", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const cta = page.getByRole("link", { name: "ปรึกษาผู้เชี่ยวชาญ", exact: true });
  await expect(cta).toBeVisible({ timeout: 500 });
  await cta.click();
  await expect(page).toHaveURL(/\/service\?section=contact$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "ติดต่อเรา", exact: true }),
  ).toBeVisible();
  await expect(page.locator("[data-nav-home]:visible")).toHaveCount(0);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
});
