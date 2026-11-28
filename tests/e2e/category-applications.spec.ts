import { catalogPageTitle } from "../../src/features/site/data/site-menu-labels";
import { expect, test } from "@playwright/test";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

for (const width of [390, 1440]) {
  for (const { id, label } of productCategoryDefinitions) {
    test(`${id} retires the applications index and keeps the category filters at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const category = id === "indicators" ? "/platforms/indicators" : `/${id}`;
      await page.goto(`/${id}/applications`);
      await expect(page).toHaveURL(category);
      const overview = page.locator(`[data-overview-category="${id}"]:visible`);
      await expect(overview.getByRole("heading", { level: 1 })).toHaveText(
        catalogPageTitle(`/${id}`, label),
      );
      await expect(overview.locator('a[href$="/applications"]')).toHaveCount(0);
      await expect(overview.locator('[data-return-scope="catalog-finder"]')).toHaveCount(0);
      if (id === "indicators") {
        const features = overview.getByRole("navigation", { name: "คุณสมบัติอินดิเคเตอร์" });
        await expect(features.getByRole("link", { name: "ทุกผลิตภัณฑ์" })).toHaveAttribute(
          "aria-current",
          "true",
        );
        const connectivity = features.getByRole("link", { name: "เชื่อมต่ออุปกรณ์" });
        await connectivity.click();
        await expect(connectivity).toHaveAttribute("aria-current", "true");
        await expect(page).toHaveURL("/platforms/indicators?feature=connectivity");
        await expect(overview.locator('[data-overview-section="hero"]')).toHaveCount(0);
        return;
      }
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
