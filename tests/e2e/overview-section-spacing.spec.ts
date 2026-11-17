import { expect, test } from "@playwright/test";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { getIndicatorSubcategories } from "../../src/features/catalog/data/indicator-subcategories";
import type { Product } from "../../src/features/catalog/types";

const heroCounts = new Map<string, number>();
test.beforeAll(async ({ request }) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  const indicatorIds = new Set(
    getIndicatorSubcategories(products).flatMap((item) => item.productIds),
  );
  for (const category of productCategoryDefinitions) {
    const images = products.filter(
      (product) =>
        product.image &&
        (product.warehouseCategoryId === category.id ||
          (category.id === "indicators" && indicatorIds.has(product.id))),
    );
    heroCounts.set(category.id, Math.min(2, images.length));
  }
});

for (const width of [320, 390, 834, 1440]) {
  test(`category overview featured-card spacing stays compact with working controls at ${width}px`, async ({
    page,
  }, info) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const category of productCategoryDefinitions) {
      await page.goto(`/products/category/${category.id}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(category.label);
      await page.waitForFunction(() => document.fonts.status === "loaded");
      const hero = page.locator('[data-overview-section="hero"]');
      const expectedCards = heroCounts.get(category.id)!;
      await expect(hero.locator("[data-slide]")).toHaveCount(expectedCards);
      if (expectedCards === 0) {
        expect(
          await hero.evaluate((element) => element.getBoundingClientRect().height),
        ).toBeLessThanOrEqual(100);
        await expect(hero.getByRole("tablist")).toHaveCount(0);
        continue;
      }
      const firstCard = hero.locator('[data-slide="0"]');
      await expect(firstCard).toBeVisible();
      await hero.evaluate((element) =>
        window.scrollTo({
          top: element.getBoundingClientRect().top + scrollY - 80,
          behavior: "instant",
        }),
      );
      const tabs = hero.getByRole("tab");
      if (expectedCards > 1) await expect(tabs.first()).toBeEnabled();
      const geometry = await hero.evaluate((element) => {
        const card = element.querySelector('[data-slide="0"]')!.getBoundingClientRect();
        const lineup = document
          .querySelector('[data-overview-section="lineup"]')!
          .getBoundingClientRect();
        const controls = element
          .querySelector('[role="tablist"]')
          ?.parentElement?.getBoundingClientRect();
        return {
          gap: lineup.top - card.bottom,
          cardHeight: card.height,
          controlsBottomInset: controls ? card.bottom - controls.bottom : null,
          controlsInside:
            !controls ||
            (controls.top >= card.top &&
              controls.left >= card.left &&
              controls.right <= card.right),
          documentFits: document.documentElement.scrollWidth <= innerWidth,
        };
      });
      await info.attach(`${category.id}-geometry`, {
        body: JSON.stringify(geometry),
        contentType: "application/json",
      });
      if ([390, 1440].includes(width) && ["scales", "accessories"].includes(category.id))
        await page.screenshot({ path: info.outputPath(`${category.id}-spacing.png`) });
      expect(geometry.gap, category.id).toBeCloseTo(62, 0);
      expect(geometry.cardHeight).toBe(width < 735 ? 480 : width < 1069 ? 628 : 680);
      if (expectedCards > 1) expect(geometry.controlsBottomInset).toBeCloseTo(24, 0);
      expect(geometry.controlsInside).toBe(true);
      expect(geometry.documentFits).toBe(true);
      if ((await tabs.count()) > 1) {
        await tabs.nth(1).click();
        await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
      }
      if (expectedCards > 1) {
        const play = hero.getByRole("button", { name: "เล่นแกลเลอรีสินค้าเด่น", exact: true });
        await play.click();
        const pause = hero.getByRole("button", { name: "หยุดแกลเลอรีสินค้าเด่น", exact: true });
        await expect(pause).toBeVisible();
        await pause.click();
        await expect(play).toBeVisible();
      }
    }
  });
}
