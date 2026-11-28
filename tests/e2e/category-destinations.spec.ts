import { catalogPageTitle } from "../../src/features/site/data/site-menu-labels";
import { getProductSubcategoryPageByHref } from "../../src/features/catalog/data/product-subcategory-pages";
import { expect, test } from "@playwright/test";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import { isProductCategoryPath } from "../../src/features/catalog/data/category-paths";
import { getScaleSubcategoryPage } from "../../src/features/catalog/data/scale-subcategory-pages";
import { guidebookBuyingGuides } from "../../src/features/content/data/buying-guides";

const categories = [
  ["scales", "เครื่องชั่ง", "เครื่องชั่ง"],
  ["indicators", "อินดิเคเตอร์แท่นชั่ง", "อินดิเคเตอร์"],
  ["platforms", "โครงสร้างแท่นชั่ง", "แท่นชั่ง"],
  ["pos", "ระบบ POS", "POS"],
  ["accessories", "อุปกรณ์เสริม", "อุปกรณ์เสริม"],
] as const;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`Solutions business links reach the selected scale group at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [label, child] of [
      ["ร้านค้าและตลาดสด", "scale-price", "คำนวณราคาหน้าร้าน"],
      ["ร้านกาแฟ", "scale-kitchen", "งานครัวและกาแฟ"],
      ["เครื่องชั่งสำหรับโรงงาน", "scale-industrial", "อุตสาหกรรม"],
      ["เครื่องชั่งสำหรับห้องแล็บ", "scale-analytical", "งานวิเคราะห์ความแม่นยำสูง"],
    ]) {
      await page.goto("/solutions");
      const link = page
        .locator("main[data-solutions-overview]")
        .getByRole("link", { name: label, exact: true });
      const href = getScaleSubcategoryPage(child)!.href;
      await expect(link).toHaveAttribute("href", href);
      await link.click();
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      await expect(page.locator(`[data-scale-subcategory-page="${child}"]`)).toBeVisible();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });

  test(`Guide return and body links keep their category at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [id, label] of categories) {
      await page.goto(`/guides/${id}`);
      await page.getByRole("link", { name: "ดูสินค้าในหมวดนี้", exact: false }).click();
      await expect(page).toHaveURL(new RegExp(`/${id}$`));
      await expect(page.locator("main#main-content:visible h1")).toHaveText(
        catalogPageTitle(`/${id}`, label),
      );
      await expect(page.getByRole("dialog")).toHaveCount(0);
      const guide = guidebookBuyingGuides.find((item) => item.slug === id)!;
      for (const link of guide.sections
        .flatMap((section) => section.links)
        .filter(
          ({ href }) =>
            Boolean(getProductSubcategoryPageByHref(href)) || isProductCategoryPath(href),
        )) {
        await page.goto(`/service/technical-specification?guide=${id}`);
        const entry = page
          .locator("main#main-content:visible article")
          .getByRole("link", { name: link.label, exact: true });
        await expect(entry).toHaveAttribute("href", link.href);
        const target = new URL(resolveCategoryHref(link.href), page.url());
        await entry.press("Enter");
        await expect(page).toHaveURL(target.href, { timeout: 15_000 });
        if (target.searchParams.has("subcategory"))
          await expect(page.getByRole("dialog")).toBeVisible();
        else await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.locator("main#main-content:visible h1").first()).not.toHaveText(
          "ผลิตภัณฑ์",
        );
      }
    }
  });

  test(`Home keeps previews and direct category navigation at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/");
    const footer = page.locator(".site-footer:visible");
    if (width < 1024)
      await footer
        .locator("summary")
        .filter({ hasText: /^ผลิตภัณฑ์$/ })
        .click();
    for (const [label, id] of [
      ["เครื่องชั่ง", "scales"],
      ["อุปกรณ์เสริม", "accessories"],
      ["ระบบ POS", "pos"],
    ])
      await expect(footer.getByRole("link", { name: label, exact: true })).toHaveAttribute(
        "href",
        `/${id}`,
      );
    const previews = page.locator("#product-experience");
    await expect(previews.getByRole("button", { name: /^สำรวจ / })).toHaveCount(4);
    await previews.getByRole("button", { name: "สำรวจ อุปกรณ์เสริม", exact: true }).click();
    await expect(previews.locator("#category-feature-media")).toHaveAttribute(
      "data-category",
      "accessories",
    );
    await expect(page).toHaveURL(/\/$/);
    for (const [id, label, navLabel] of categories) {
      await page.goto("/");
      await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
      const header = page.locator(".site-header:visible");
      if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const link = header
        .getByRole("link", { name: navLabel, exact: true })
        .filter({ visible: true })
        .first();
      await expect(link).toHaveAttribute("href", `/${id}`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/${id}$`));
      await expect(page.locator("main#main-content:visible h1")).toHaveText(
        catalogPageTitle(`/${id}`, label),
      );
    }
  });
}
