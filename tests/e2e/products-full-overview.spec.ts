import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 734, 768, 834, 1024, 1068, 1440, 1920]) {
  test(`complete reference sections and route-only chrome at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/products");
    await expect(page.locator("[data-products-header]")).toHaveCount(1);
    await expect(page.locator("[data-products-footer]")).toHaveCount(1);
    await expect(page.locator(".site-header, .site-footer")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ผลิตภัณฑ์");
    expect(
      await page
        .locator("[data-overview-section]")
        .evaluateAll((sections) =>
          sections.map((section) => section.getAttribute("data-overview-section")),
        ),
    ).toEqual([
      "chapters",
      "hero",
      "lineup",
      "services",
      "features",
      "essentials",
      "accordion",
      "index",
    ]);
    await expect(page.locator("#products-chapters li")).toHaveCount(5);
    await expect(page.locator("#products-lineup li")).toHaveCount(6);
    await expect(page.locator("#products-services li")).toHaveCount(6);
    await expect(page.locator("#products-features li")).toHaveCount(6);
    await expect(page.locator("#products-essentials li")).toHaveCount(2);
    expect(
      await page
        .locator("#products-features li")
        .first()
        .evaluate((card) => ({
          width: Math.round(card.getBoundingClientRect().width),
          height: Math.round(card.getBoundingClientRect().height),
        })),
    ).toEqual(
      width <= 734
        ? { width: 260, height: 480 }
        : width <= 1068
          ? { width: 344, height: 628 }
          : { width: 372, height: 680 },
    );
    expect(
      await page
        .locator("[data-products-header]")
        .evaluate((header) => Math.round(header.getBoundingClientRect().height)),
    ).toBe(width < 834 ? 48 : 44);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`overview-${width}.png`) });
    await writeFile(
      test.info().outputPath(`overview-${width}-geometry.json`),
      JSON.stringify(
        await page.evaluate(() => ({
          width: innerWidth,
          height: innerHeight,
          documentWidth: document.documentElement.scrollWidth,
          sections: Array.from(
            document.querySelectorAll<HTMLElement>("[data-overview-section]"),
          ).map((section) => ({
            section: section.dataset.overviewSection,
            top: Math.round(section.getBoundingClientRect().top + scrollY),
            height: Math.round(section.getBoundingClientRect().height),
          })),
        })),
        null,
        2,
      ),
    );
    for (const section of await page.locator("[data-overview-section]").all()) {
      await section.scrollIntoViewIfNeeded();
      const image = section.locator("img").filter({ visible: true }).first();
      if (await image.count())
        await expect
          .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
          .toBeGreaterThan(0);
      await page.screenshot({
        path: test
          .info()
          .outputPath(
            `overview-${width}-${await section.getAttribute("data-overview-section")}.png`,
          ),
      });
    }
    await page.locator("[data-products-footer]").scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`overview-${width}-footer.png`) });
    await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
    const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
    await expect(finder).toBeVisible();
    await expect(finder.getByRole("status")).toHaveText("146 รายการ");
    await expect(finder.locator("#catalog-showcase")).toHaveCount(0);
    await finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" }).fill("WPS10KS");
    await expect(finder.locator("#mock-product-results article h3")).toHaveText(["WPS10KS"]);
    await page.keyboard.press("Escape");
    await expect(finder).not.toBeVisible();
    await expect(page.locator('[data-overview-section="lineup"] button').first()).toBeFocused();
    await page.getByRole("button", { name: "ดูสินค้าทั้งหมด", exact: true }).first().click();
    await expect(finder.getByRole("textbox", { name: "ค้นหารุ่นสินค้า" })).toHaveValue("WPS10KS");
    await page.keyboard.press("Escape");
    expect(errors).toEqual([]);
  });
}

test("service and feature popups use distinct reference sizes and restore focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/products");
  for (const [id, title, minimumWidth] of [
    ["products-services", "จัดส่งถึงคุณ.", 810],
    ["products-features", "เลือกเครื่องชั่งให้เหมาะกับงาน", 1240],
  ] as const) {
    const trigger = page.locator(`#${id} li`).first().getByRole("button");
    await trigger.click();
    const modal = page.getByRole("dialog", { name: title, exact: true });
    await expect(modal).toBeVisible();
    expect(
      await modal.locator(":scope > div").evaluate((panel) => panel.getBoundingClientRect().width),
    ).toBeGreaterThanOrEqual(minimumWidth);
    expect(
      await modal.locator(":scope > div").evaluate((panel) => getComputedStyle(panel).borderRadius),
    ).toBe("28px");
    await page.keyboard.press("Tab");
    expect(await modal.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`${id}-modal.png`) });
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
    await expect(trigger).toBeFocused();
  }
});

for (const width of [390, 1440]) {
  test(`gallery paddles, image accordion, menu and footer work at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/products");
    for (const [id, label] of [
      ["products-lineup", "เลื่อนผลิตภัณฑ์"],
      ["products-services", "เลื่อนบริการ"],
      ["products-features", "เลื่อนเรื่องราวผลิตภัณฑ์"],
    ]) {
      const gallery = page.locator(`#${id}`);
      await page.getByRole("button", { name: `${label}ถัดไป`, exact: true }).click();
      await expect.poll(() => gallery.evaluate((track) => track.scrollLeft)).toBeGreaterThan(0);
      await page.getByRole("button", { name: `${label}ก่อนหน้า`, exact: true }).click();
      await expect.poll(() => gallery.evaluate((track) => track.scrollLeft)).toBe(0);
    }
    const accordion = page.locator('[data-overview-section="accordion"]');
    const buttons = accordion.getByRole("button");
    for (let index = 0; index < 3; index++) {
      await buttons.nth(index).click();
      await expect(buttons.nth(index)).toHaveAttribute("aria-expanded", "true");
      await expect(accordion.locator('[aria-expanded="true"]')).toHaveCount(1);
      await expect(accordion.getByRole("region").filter({ visible: true })).toHaveCount(1);
      const title = await buttons.nth(index).textContent();
      await expect(
        accordion.getByRole("img", { name: title!, exact: true }).filter({ visible: true }),
      ).toHaveCount(1);
    }
    const header = page.locator("[data-products-header]");
    if (width < 834) {
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await header.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true }).click();
    } else await header.getByRole("link", { name: "เครื่องชั่ง", exact: true }).hover();
    await expect(
      header.locator(
        '#products-navigation-panel a[href^="/products/category/scales?subcategory="]',
      ),
    ).toHaveCount(8);
    await page.screenshot({ path: test.info().outputPath(`products-menu-${width}.png`) });
    if (width >= 834) await header.getByRole("link", { name: "เครื่องชั่ง", exact: true }).focus();
    await page.keyboard.press("Escape");
    await expect(header.locator("#products-navigation-panel")).toHaveCount(0);
    if (width < 735) {
      const footer = page.locator("[data-products-footer] details").first();
      await footer.locator("summary").click();
      await expect(footer).toHaveAttribute("open", "");
      await expect(
        footer.getByRole("link", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }),
      ).toBeVisible();
    } else await expect(page.locator("[data-products-footer] h3")).toHaveCount(5);
  });
}

test("hero pauses for reduced motion, supports keyboard tabs, play and offscreen pause", async ({
  page,
}) => {
  await page.goto("/products");
  const hero = page.locator('[data-overview-section="hero"]');
  const tabs = hero.getByRole("tab");
  await expect(
    hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
  ).toBeVisible();
  await expect(tabs.first()).toBeEnabled();
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  await hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }).click();
  await expect(
    hero.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true }),
  ).toBeVisible();
  await page.locator("[data-products-footer]").scrollIntoViewIfNeeded();
  await expect(
    hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
  ).toHaveCount(1);
});

test("cached client navigation preserves one correct header/footer on products home contact guide and detail", async ({
  page,
}) => {
  test.slow();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/products");
  const detailPath = await page
    .locator('#products-lineup a[href^="/products/"]')
    .first()
    .getAttribute("href");
  const baseline = await page.context().newPage();
  for (const path of ["/contact-us", "/guides/scales", detailPath!, "/"]) {
    await baseline.goto(path, { waitUntil: "domcontentloaded" });
    await expect(baseline.locator(":is([data-products-header], .site-header):visible")).toHaveCount(
      1,
    );
    await expect
      .poll(() =>
        baseline
          .locator(":is([data-products-header], .site-header):visible")
          .evaluate((header) => header.closest('[class*="surface"]')!.className),
      )
      .toContain("surface");
    await expect
      .poll(() =>
        baseline
          .locator(":is([data-products-header], .site-header):visible")
          .evaluate((header) => getComputedStyle(header.closest('[class*="surface"]')!).paddingTop),
      )
      .not.toBe("");
    const frameStyle = await baseline
      .locator(":is([data-products-header], .site-header):visible")
      .evaluate((header) => {
        const style = getComputedStyle(header.closest('[class*="surface"]')!);
        return { background: style.backgroundColor, padding: style.paddingTop };
      });
    const destination =
      path === "/"
        ? page.locator("[data-products-header] a[href='/']")
        : page.locator(`[data-products-overview] a[href='${path}']`).first();
    await destination.click();
    await expect(page).toHaveURL(new URL(path, page.url()).href);
    await expect(page.locator(":is([data-products-header], .site-header):visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible")).toHaveCount(1);
    await expect
      .poll(() =>
        page.locator(":is([data-products-header], .site-header):visible").evaluate((header) => {
          const style = getComputedStyle(header.closest('[class*="surface"]')!);
          return { background: style.backgroundColor, padding: style.paddingTop };
        }),
      )
      .toEqual(frameStyle);
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.locator(":is([data-products-header], .site-header):visible")).toHaveCount(1);
    await expect(page.locator(".site-header:visible, .site-footer:visible")).toHaveCount(0);
    await page.goForward({ waitUntil: "domcontentloaded" });
    await expect(page.locator(":is([data-products-header], .site-header):visible")).toHaveCount(1);
    await page.goBack({ waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/products$/);
    await expect(page.locator(":is([data-products-header], .site-header):visible")).toHaveCount(1);
    await expect(page.locator(".site-header:visible, .site-footer:visible")).toHaveCount(0);
  }
  await baseline.close();
  expect(errors).toEqual([]);
});

test.describe("reference gallery touch gestures", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("native swipe moves the hero while vertical page scrolling remains available", async ({
    page,
    context,
  }) => {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/products");
    const track = page.locator('[data-overview-section="hero"] ul');
    await track.scrollIntoViewIfNeeded();
    await expect(
      page.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true }),
    ).toBeVisible();
    await page.bringToFront();
    const session = await context.newCDPSession(page);
    const swipe = async (dx: number, dy: number) => {
      const bounds = (await track.boundingBox())!;
      const x = dx ? 300 : 195;
      const y = Math.max(100, Math.min(700, bounds.y + bounds.height / 2));
      await session.send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [{ x, y }],
      });
      for (let step = 1; step <= 8; step++) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: x + (dx * step) / 8, y: y + (dy * step) / 8 }],
        });
        await page.waitForTimeout(16);
      }
      await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
      await page.waitForTimeout(250);
    };
    await swipe(-240, 0);
    await expect.poll(() => track.evaluate((element) => element.scrollLeft)).toBeGreaterThan(100);
    await expect(
      page.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true }),
    ).toBeVisible();
    await track.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => scrollY);
    await swipe(0, -120);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath("native-touch-gallery.png") });
    await session.detach();
  });
});
