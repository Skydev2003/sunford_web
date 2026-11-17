import { expect, test } from "@playwright/test";

const moduleClass = (name: string) =>
  `:is([class*="_${name}__"],[class$="_${name}"],[class*="_${name} "])`;

test.setTimeout(90_000);
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [320, 390, 768, 1440]) {
  test(`card roles keep usable content and one padding owner at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, selector, padding] of [
      ["/solutions", moduleClass("solutionCard"), "24px"],
      ["/solutions", moduleClass("businessCard"), "24px"],
      ["/products/category/scales/price", `article${moduleClass("card")}`, "16px"],
      ["/applications-and-softwares", ".software-card-copy", "24px"],
      ["/explore", ".directory-card-copy", "24px"],
      ["/service/quotation", moduleClass("seller"), "24px"],
    ]) {
      await page.goto(route);
      const main = page.locator("main:visible");
      const cards = main.locator(selector);
      await expect(cards.first()).toBeVisible();
      await expect(cards.first()).toHaveCSS("padding-left", padding);
      await expect(cards.first()).toHaveCSS("padding-right", padding);
      await page.evaluate(() => document.fonts.ready);
      const textFits = await cards.evaluateAll((elements) =>
        elements.every((card) => {
          const outer = card.getBoundingClientRect();
          return Array.from(card.querySelectorAll("h2,h3")).every((heading) => {
            const bounds = heading.getBoundingClientRect();
            return bounds.left >= outer.left - 1 && bounds.right <= outer.right + 1;
          });
        }),
      );
      expect(textFits, route).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

for (const width of [390, 1440]) {
  test(`contact and service cards contain text enlarged to 200% at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/contact-us", "/service"]) {
      await page.goto(route);
      const main = page.locator("main:visible");
      await expect(main).toBeVisible();
      const cardSelector = `${moduleClass("channel")},${moduleClass("contactCard")}`;
      await expect(main.locator(cardSelector).first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      const outside = await main.evaluate((element, selector) => {
        const targets = Array.from(
          element.querySelectorAll<HTMLElement>("h1,h2,h3,p,strong,address"),
        );
        const original = targets.map((target) => {
          const style = getComputedStyle(target);
          return { target, size: parseFloat(style.fontSize), height: style.lineHeight };
        });
        for (const { target, size, height } of original) {
          target.style.fontSize = `${size * 2}px`;
          if (height !== "normal") target.style.lineHeight = `${parseFloat(height) * 2}px`;
        }
        const failures: string[] = [];
        for (const card of element.querySelectorAll(selector)) {
          const bounds = card.getBoundingClientRect();
          const walker = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent?.trim() || node.parentElement?.closest("svg,[aria-hidden=true]"))
              continue;
            const range = document.createRange();
            range.selectNodeContents(node);
            if (
              Array.from(range.getClientRects()).some(
                (rect) =>
                  rect.width &&
                  (rect.left < bounds.left - 1 ||
                    rect.right > bounds.right + 1 ||
                    rect.bottom > bounds.bottom + 1),
              )
            )
              failures.push(node.textContent.trim());
          }
        }
        return failures;
      }, cardSelector);
      expect(outside, route).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

for (const width of [320, 390, 768, 1440]) {
  test(`service and form card zones retain readable content at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [route, selector, expected] of [
      ["/contact-us", `a${moduleClass("channel")}`, 24],
      ["/service", moduleClass("contactCard"), 24],
      ["/service", moduleClass("panelHeading"), 24],
      ["/service/quotation", "form", width >= 1280 ? 32 : width >= 768 ? 24 : 16],
    ] as const) {
      await page.goto(route);
      const zone = page.locator("main:visible").locator(selector).first();
      await expect(zone).toBeVisible();
      await expect(zone).toHaveCSS("padding-left", `${expected}px`);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await zone.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        const outside: string[] = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          if (!node.textContent?.trim() || node.parentElement?.closest("svg,[aria-hidden=true]"))
            continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const rect of range.getClientRects()) {
            if (rect.width && (rect.left < bounds.left - 1 || rect.right > bounds.right + 1)) {
              outside.push(node.textContent.trim());
            }
          }
        }
        return outside;
      });
      expect(overflow, route).toEqual([]);
    }
    await page.setViewportSize({ width: 1440, height: 700 });
    await page.goto("/service");
    await expect(page.locator("main:visible").locator(moduleClass("contactCard"))).toHaveCSS(
      "padding-left",
      "16px",
    );
    await expect(page.locator("main:visible").locator(moduleClass("hero"))).toHaveCSS(
      "padding-top",
      "10px",
    );
    await expect(page.locator("main:visible").locator(moduleClass("hero"))).toHaveCSS(
      "padding-bottom",
      "8px",
    );
  });
}
