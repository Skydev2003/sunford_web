import { expect, test } from "@playwright/test";
import { solutions } from "../../src/features/content/data/solutions";
import { solutionDetails } from "../../src/features/content/data/solution-details";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";

const groups = defaultNavigation.find(({ href }) => href === "/solutions")!.groups!;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 768, 834, 1440]) {
  test(`solutions retain every destination and contained layout at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/solutions");
    const main = page.locator("main[data-solutions-overview]");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("โซลูชันตามธุรกิจ");
    await expect(main.locator("[data-solutions-section]")).toHaveCount(4);
    const chapters = main.getByRole("navigation", { name: "สำรวจกลุ่มธุรกิจ" });
    await expect(chapters.locator("li")).toHaveCount(3);
    await expect(chapters.locator("a")).toHaveText(groups.map(({ label }) => label));
    const cards = main.getByRole("list", { name: "โซลูชันทั้งหมด", exact: true });
    await expect(cards.locator("a")).toHaveCount(14);
    await expect(cards.locator("h3")).toHaveText(
      solutions.map(({ path }) => solutionDetails[path].title),
    );
    expect(
      await cards
        .locator("a")
        .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    ).toEqual(solutions.map(({ path }) => path));
    for (const [index, group] of groups.entries()) {
      const section = main.locator(`#business-${index + 1}`);
      await expect(section.locator("h3")).toHaveText(group.label);
      await expect(section.locator("a")).toHaveText(group.links.map(({ label }) => label));
      expect(
        await section
          .locator("a")
          .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual(group.links.map(({ href }) => resolveCategoryHref(href)));
    }
    await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
    await expect(page.locator(".site-footer:visible")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    const bounds = await main.evaluate((main) => {
      const cards = main.querySelectorAll(
        '[aria-label="โซลูชันทั้งหมด"] > li > a, [id^="business-"] > ul > li > a',
      );
      return Array.from(cards, (card) => {
        const r = card.getBoundingClientRect();
        return {
          contained: Array.from(card.children).every((child) => {
            const c = child.getBoundingClientRect();
            return (
              c.left >= r.left - 1 &&
              c.right <= r.right + 1 &&
              c.top >= r.top - 1 &&
              c.bottom <= r.bottom + 1
            );
          }),
          scrollFits: card.scrollWidth <= card.clientWidth + 1,
        };
      });
    });
    expect(bounds.every(({ contained, scrollFits }) => contained && scrollFits)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`solutions-top-${width}.png`) });
    await cards.scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`solutions-cards-${width}.png`) });
    await main.locator("#business-1").scrollIntoViewIfNeeded();
    await page.screenshot({ path: test.info().outputPath(`solutions-groups-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

for (const width of [390, 1440]) {
  test(
    "the solutions rail reveals keyboard focus and restores scroll at " + width + "px",
    async ({ page }) => {
      test.slow();
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/solutions");
      const track = page.getByRole("list", { name: "โซลูชันทั้งหมด", exact: true });
      const cards = track.getByRole("link");
      await expect(cards).toHaveCount(solutions.length);
      await expect(track).toHaveAttribute("data-tab-focus-ready", "");
      await page.evaluate(() => document.fonts.ready);
      await track.evaluate((list) => {
        list.scrollIntoView({ block: "center", behavior: "instant" });
        list.focus({ preventScroll: true });
      });
      const readScroll = () => track.evaluate((list) => ({ x: list.scrollLeft, y: scrollY }));
      const initial = await readScroll();
      const cardInRail = async (index: number) => {
        const card = cards.nth(index);
        await expect(card).toBeFocused();
        await expect
          .poll(() =>
            card.evaluate((link) => {
              const list = link.closest("ul")!;
              const left = list.getBoundingClientRect().left + list.clientLeft;
              const bounds = link.getBoundingClientRect();
              return Math.max(left - bounds.left, bounds.right - (left + list.clientWidth));
            }),
          )
          .toBeLessThanOrEqual(1);
      };
      for (let index = 0; index < solutions.length; index++) {
        await page.keyboard.press("Tab");
        await cardInRail(index);
      }
      for (let index = solutions.length - 2; index >= 0; index--) {
        await page.keyboard.press("Shift+Tab");
        await cardInRail(index);
      }
      expect(Math.abs((await readScroll()).y - initial.y)).toBeLessThanOrEqual(1);

      const destination = solutions[solutions.length - 1];
      for (let index = 1; index < solutions.length; index++) {
        await page.keyboard.press("Tab");
        await cardInRail(index);
      }
      const saved = await readScroll();
      expect(saved.x).toBeGreaterThan(0);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(destination.path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        solutionDetails[destination.path].title,
      );
      await page.goBack();
      await expect(page).toHaveURL("/solutions");
      await expect
        .poll(async () => {
          const restored = await readScroll();
          return Math.max(Math.abs(restored.x - saved.x), Math.abs(restored.y - saved.y));
        })
        .toBeLessThanOrEqual(1);
    },
  );
}

test("business anchors and all14 detail links retain reload and history behavior", async ({
  page,
}) => {
  test.slow();
  await page.goto("/solutions");
  for (const index of [0, 1, 2]) {
    await page
      .getByRole("navigation", { name: "สำรวจกลุ่มธุรกิจ" })
      .locator("a")
      .nth(index)
      .click();
    await expect(page).toHaveURL(new RegExp(`#business-${index + 1}$`));
    await expect(page.locator(`#business-${index + 1} h3`)).toBeInViewport();
  }
  await page.reload();
  await expect(page).toHaveURL(/\/solutions$/);
  await expect(page.locator("#solutions-title")).toBeInViewport();
  for (const item of solutions) {
    const title = solutionDetails[item.path].title;
    await page
      .getByRole("list", { name: "โซลูชันทั้งหมด", exact: true })
      .getByRole("link", { name: title, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`${item.path}$`));
    const detail = page.locator(`main[data-solution-detail="${item.path}"]:visible`);
    await expect(detail.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
    await expect(
      detail.locator("[data-solution-evidence], [data-solution-evidence-empty]"),
    ).toBeVisible();
    await expect(detail.getByRole("link", { name: "สอบถามซันฟอร์ด" })).toHaveAttribute(
      "href",
      "/service?section=contact",
    );
    await page.goBack();
    await expect(page.locator("[data-solutions-overview]:visible")).toBeVisible();
  }
});

test("keyboard and native touch reach the last solution without a catalogue popup", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/solutions");
    const list = page.getByRole("list", { name: "โซลูชันทั้งหมด", exact: true });
    await expect(list).toHaveAttribute("data-tab-focus-ready", "");
    await list.scrollIntoViewIfNeeded();
    const box = (await list.boundingBox())!;
    const y = Math.min(650, Math.max(120, box.y + 90));
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 330, y }],
    });
    for (let x = 300; x >= 60; x -= 30)
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => list.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await list.locator("a").first().focus();
    for (let i = 1; i < solutions.length; i++) await page.keyboard.press("Tab");
    const last = list.locator("a").last();
    await expect(last).toBeFocused();
    await expect(last).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/solutions\/driver$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("solutions and product routes keep a single active Header and Footer through cache navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions");
  const header = page.locator("[data-products-header]:visible");
  await header.getByRole("link", { name: "เครื่องชั่ง", exact: true }).click();
  await expect(page.locator('[data-overview-category="scales"]:visible')).toBeVisible();
  await page.goBack();
  await expect(page.locator("[data-solutions-overview]:visible")).toBeVisible();
  await expect(header).toHaveCount(1);
  await expect(page.locator(".site-footer:visible")).toHaveCount(1);
  await expect(page.locator("[data-products-footer]:visible")).toHaveCount(0);
  await header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }).click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ", exact: true });
  await expect(search).toBeVisible();
  await search.getByRole("button", { name: "ปิด", exact: true }).click();
  await header.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }).click();
  await expect(page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true })).toBeDisabled();
});
