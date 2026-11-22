import { expect, test } from "@playwright/test";

const categories = [
  {
    id: "indicators",
    shortLabel: "เลือกตามคุณสมบัติ",
    title: "เลือกอินดิเคเตอร์แท่นชั่งตามคุณสมบัติ",
    links: [
      ["LCD", "/products/category/indicators/lcd"],
      ["เชื่อมต่อ RS232", "/products/category/indicators/rs232"],
      ["ตัวเครื่องกันน้ำ IP67", "/products/category/indicators/waterproof"],
    ],
    listing: "indicator-lcd",
  },
  {
    id: "platforms",
    shortLabel: "เลือกวัสดุและอุปกรณ์ร่วม",
    title: "เลือกวัสดุและอุปกรณ์ร่วมของแท่นชั่ง",
    links: [
      ["สแตนเลส SUS304", "/products/category/platforms/sus304"],
      ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical"],
    ],
    listing: "platform-sus304",
  },
  {
    id: "pos",
    shortLabel: "เลือกระบบและอุปกรณ์",
    title: "เลือกระบบและอุปกรณ์ POS",
    links: [
      ["Android", "/products/category/pos/android"],
      ["เครื่องพิมพ์", "/products/category/accessories/printers"],
      ["สแกนเนอร์และลิ้นชัก", "/products/category/accessories/scanners-and-cash-drawers"],
    ],
    listing: "pos-android",
  },
] as const;

for (const width of [390, 1440]) {
  test.describe(`category application links at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, hasTouch: width === 390 });

    for (const { id, shortLabel, title, links, listing } of categories) {
      test(`${id} uses its own application links and keeps its legacy finder closed`, async ({
        page,
      }) => {
        test.slow();
        await page.emulateMedia({ reducedMotion: "reduce" });
        const path = `/products/category/${id}`;
        const destination = `${path}/applications`;
        await page.goto(`${path}?catalog=all&subcategory=unknown#catalog-search`);
        const overview = page.locator(`[data-overview-category="${id}"]:visible`);
        const finder = overview.locator('[data-return-scope="catalog-finder"]');
        await expect(overview).toHaveAttribute("data-controls-ready", "true");
        await expect(finder).toHaveCount(0);
        await expect(
          overview.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ" }),
        ).toHaveCount(0);
        const filters = overview.getByRole("group", { name: "กรองผลิตภัณฑ์" });
        const application = filters.getByRole("link", { name: shortLabel, exact: true });
        await expect(filters.locator("[data-segmented-filter] > :is(button, a)").last()).toHaveText(
          shortLabel,
        );
        await expect(application).toHaveAttribute("href", destination);
        await expect(application).not.toHaveAttribute("aria-pressed", /.+/);
        await expect(
          overview
            .locator('[data-overview-section="index"]')
            .getByRole("link", { name: title, exact: true }),
        ).toHaveAttribute("href", destination);

        if (width === 390) await application.tap();
        else await application.press("Enter");
        await expect(page).toHaveURL(new URL(destination, page.url()).href);
        const index = page.locator("main:visible");
        await expect(
          index.getByRole("heading", { level: 1, name: title, exact: true }),
        ).toBeVisible();
        for (const [label, href] of links) {
          await expect(index.getByRole("link", { name: label, exact: true })).toHaveAttribute(
            "href",
            href,
          );
        }
        await expect(
          index.locator('a[href^="/products/category/scales/applications"]'),
        ).toHaveCount(0);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await index.getByRole("link", { name: links[0][0], exact: true }).click();
        await expect(page.locator(`[data-product-subcategory-page="${listing}"]`)).toBeVisible();
        await page.goBack();
        await expect(index.getByRole("heading", { name: title, exact: true })).toBeVisible();
        await page.goBack();
        await expect(application).toBeVisible();
        await expect(finder).toHaveCount(0);
      });
    }
  });
}
