import { expect, test } from "@playwright/test";
import { buyingGuides } from "../../src/features/content/data/buying-guides";

const categories = [
  ["scales", "เครื่องชั่ง"],
  ["indicators", "อินดิเคเตอร์แท่นชั่ง"],
  ["platforms", "โครงสร้างแท่นชั่ง"],
  ["pos", "ระบบ POS"],
  ["accessories", "อุปกรณ์เสริม"],
] as const;

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`Solutions business links reach the selected scale group at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [label, child, filter] of [
      ["ร้านค้าและตลาดสด", "scale-price", "คำนวณราคาหน้าร้าน"],
      ["ร้านกาแฟ", "scale-kitchen", "งานครัวและกาแฟ"],
      ["เครื่องชั่งสำหรับโรงงาน", "scale-industrial", "อุตสาหกรรมงานผลิต"],
      ["เครื่องชั่งสำหรับห้องแล็บ", "scale-analytical", "งานวิเคราะห์ความแม่นยำสูง"],
    ]) {
      await page.goto("/solutions");
      const link = page
        .locator("main[data-solutions-overview]")
        .getByRole("link", { name: label, exact: true });
      await expect(link).toHaveAttribute("href", `/products/category/scales?subcategory=${child}`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/products/category/scales\\?subcategory=${child}$`));
      const dialog = page.getByRole("dialog", { name: "ดูเครื่องชั่งทั้งหมด", exact: true });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("button", { name: filter, exact: true })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(dialog).not.toContainText("ยังไม่พบสินค้าที่คุณค้นหา");
    }
  });

  test(`Guide return and body links keep their category at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const [id, label] of categories) {
      await page.goto(`/guides/${id}`);
      await page.getByRole("link", { name: "ดูสินค้าในหมวดนี้", exact: false }).click();
      await expect(page).toHaveURL(new RegExp(`/products/category/${id}$`));
      await expect(page.locator("main#main-content:visible h1")).toHaveText(label);
      await expect(page.getByRole("dialog")).toHaveCount(0);
      const guide = buyingGuides.find((item) => item.slug === id)!;
      for (const link of guide.sections
        .flatMap((section) => section.links)
        .filter((link) => link.href.startsWith("/products/category/"))) {
        await page.goto(`/guides/${id}`);
        await page
          .locator("main#main-content:visible article")
          .getByRole("link", { name: link.label, exact: true })
          .click();
        await expect(page).toHaveURL(new URL(link.href, page.url()).href);
        const target = new URL(link.href, page.url());
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
    for (const [label, id] of [
      ["เครื่องชั่งดิจิทัล", "scales"],
      ["อุปกรณ์เสริม", "accessories"],
      ["ระบบ POS และอุปกรณ์", "pos"],
    ])
      await expect(footer.getByRole("link", { name: label, exact: true })).toHaveAttribute(
        "href",
        `/products/category/${id}`,
      );
    const previews = page.locator("#product-experience");
    await expect(previews.getByRole("button", { name: /^สำรวจ / })).toHaveCount(4);
    await previews.getByRole("button", { name: "สำรวจ อุปกรณ์เสริม", exact: true }).click();
    await expect(previews.locator("#category-feature-media")).toHaveAttribute(
      "data-category",
      "accessories",
    );
    await expect(page).toHaveURL(/\/$/);
    for (const [id, label] of categories) {
      await page.goto("/");
      const header = page.locator(".site-header:visible");
      if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const link = header
        .getByRole("link", { name: label, exact: true })
        .filter({ visible: true })
        .first();
      await expect(link).toHaveAttribute("href", `/products/category/${id}`);
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/products/category/${id}$`));
      await expect(page.locator("main#main-content:visible h1")).toHaveText(label);
    }
  });
}
