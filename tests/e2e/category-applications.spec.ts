import { expect, test } from "@playwright/test";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

for (const width of [390, 1440]) {
  for (const { id, label } of productCategoryDefinitions) {
    test(`${id} retires the applications index and keeps the category filters at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const category = `/products/category/${id}`;
      await page.goto(`${category}/applications`);
      await expect(page).toHaveURL(category);
      const overview = page.locator(`[data-overview-category="${id}"]:visible`);
      await expect(overview.getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(overview.locator('a[href$="/applications"]')).toHaveCount(0);
      await expect(overview.locator('[data-return-scope="catalog-finder"]')).toHaveCount(0);
      const platforms = id === "platforms";
      const filters = overview.getByRole("group", {
        name: platforms ? "กรองตามวัสดุ" : "กรองผลิตภัณฑ์",
      });
      const all = filters.getByRole("button", {
        name: platforms ? "ทุกวัสดุ" : "ทุกผลิตภัณฑ์",
        exact: true,
      });
      await expect(all).toHaveAttribute("aria-pressed", "true");
      const group = filters.getByRole("button").nth(1);
      await group.click();
      await expect(group).toHaveAttribute("aria-pressed", "true");
      await expect(page).toHaveURL(category);
      await expect(overview.locator('[data-overview-section="hero"]')).toHaveCount(
        id === "scales" ? 1 : 0,
      );
    });
  }
}
