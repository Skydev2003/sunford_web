import { expect, test, type Page } from "@playwright/test";

type SearchProduct = {
  slug: string;
  name: string;
  warehouseSku: string;
  warehouseModelCodes?: string[];
};

let target: SearchProduct;
let productCount: number;
let initialSlugs: string[];
const title = "ค้นพบสิ่งที่ใช่สำหรับคุณ";

test.beforeAll(async ({ request }) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: SearchProduct[] };
  target = products.find((product) => product.slug === "wps10ks")!;
  expect(target?.warehouseSku).toBeTruthy();
  expect(target?.warehouseModelCodes).toContain("WPS10KS");
  productCount = products.length;
  initialSlugs = products.slice(0, 40).map(({ slug }) => `/products/${slug}`);
});

async function openSearch(page: Page) {
  const trigger = page.getByRole("button", {
    name: page.url().endsWith("/") ? "ค้นหาสินค้า" : "ค้นหาสินค้าและข้อมูล",
    exact: true,
  });
  await expect(trigger).toBeEnabled();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: title, exact: true });
  await expect(dialog).toBeVisible();
  return { trigger, dialog, input: dialog.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }) };
}

for (const route of ["/", "/products/wps10ks"]) {
  for (const width of [320, 390, 834, 1024, 1440]) {
    test(`ranked multi-word search from ${route} at ${width}px`, async ({ page }, info) => {
      const errors: string[] = [];
      const apiRequests: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const { trigger, dialog, input } = await openSearch(page);
      const rows = dialog.locator(".search-results > a");
      const products = dialog.locator('.search-results > a[href^="/products/"]');
      await expect(products).toHaveCount(Math.min(40, productCount));
      expect(
        await products.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual(initialSlugs);
      page.on("request", (request) => {
        if (
          ["fetch", "xhr"].includes(request.resourceType()) &&
          new URL(request.url()).pathname.startsWith("/api/")
        )
          apiRequests.push(request.url());
      });

      const queries = [
        target.warehouseSku,
        target.warehouseSku.toLowerCase().replace(/^([a-z])/, "$1-"),
        "WPS10KS",
        "  wps-10ks  ",
        "wps  10ks",
        `เครื่องชั่ง ${target.warehouseSku}`,
        `${target.warehouseSku} เครื่องชั่ง`,
        "เครื่องชั่ง wps-10ks",
        "wps10ks เครื่องชั่ง wps10ks",
      ];
      for (const query of queries) {
        await input.fill(query);
        await expect(input).toHaveValue(query);
        await expect(products.first()).toHaveAttribute("href", `/products/${target.slug}`);
        await expect(products.first().locator("strong")).toHaveText(target.name);
      }
      await input.fill("WPS10K");
      await expect(
        dialog.locator(`.search-results > a[href="/products/${target.slug}"]`),
      ).toBeVisible();
      await input.fill(`${target.warehouseSku} __missing_search_word__`);
      await expect(rows).toHaveCount(0);
      await expect(dialog.locator(".empty-state")).toBeVisible();
      await expect(dialog.locator(".search-caption")).toHaveText("พบ 0 ผลิตภัณฑ์");

      await input.fill("/contact-us CONTACT");
      const content = dialog.locator('.search-results > a[href="/contact-us"]');
      await expect(content).toBeVisible();
      await expect(
        content.locator(":scope > img, :scope > [data-product-image-placeholder]"),
      ).toHaveCount(0);
      await input.fill("   ");
      await expect(products).toHaveCount(Math.min(40, productCount));
      await expect(dialog.locator(".search-caption")).toHaveText("ผลิตภัณฑ์ของ Sunford");
      await expect(dialog.locator('.search-results > a:not([href^="/products/"])')).toHaveCount(0);
      await dialog.getByRole("button", { name: "ล้างการค้นหา", exact: true }).click();
      await expect(input).toHaveValue("");

      await input.fill("เครื่องชั่ง wps-10ks");
      const geometry = await dialog.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const row = element.querySelector<HTMLElement>(".search-results > a")!;
        const image = row
          .querySelector<HTMLElement>(":scope > img, :scope > [data-product-image-placeholder]")!
          .getBoundingClientRect();
        return {
          left: bounds.left,
          right: bounds.right,
          dialogOverflow: element.scrollWidth > element.clientWidth + 1,
          documentOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          thumbnailWidth: image.width,
          thumbnailHeight: image.height,
        };
      });
      expect(geometry.left).toBeGreaterThanOrEqual(0);
      expect(geometry.right).toBeLessThanOrEqual(width + 1);
      expect(geometry.dialogOverflow).toBe(false);
      expect(geometry.documentOverflow).toBe(false);
      expect(geometry.thumbnailWidth).toBeCloseTo(65, 0);
      expect(geometry.thumbnailHeight).toBeCloseTo(65, 0);
      await info.attach("search-proof", {
        body: JSON.stringify({
          route,
          width,
          sku: target.warehouseSku,
          queries,
          geometry,
          apiRequests,
        }),
        contentType: "application/json",
      });
      await info.attach("ranked-search", {
        body: await page.screenshot(),
        contentType: "image/png",
      });
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      const reopened = await openSearch(page);
      await reopened.input.fill(target.warehouseSku);
      await reopened.dialog.locator(`.search-results > a[href="/products/${target.slug}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/products/${target.slug}$`));
      await expect(reopened.dialog).not.toBeVisible();
      expect(apiRequests).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
}

test.describe("touch search", () => {
  test.use({ hasTouch: true, isMobile: true });
  for (const route of ["/", "/products/wps10ks"]) {
    for (const width of [390, 834]) {
      test(`normalized search and navigation from ${route} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const { dialog, input } = await openSearch(page);
        await input.fill("เครื่องชั่ง wps-10ks");
        const result = dialog.locator(`.search-results > a[href="/products/${target.slug}"]`);
        await expect(result).toBeVisible();
        await dialog.getByRole("button", { name: "ล้างการค้นหา", exact: true }).tap();
        await expect(input).toHaveValue("");
        await input.pressSequentially("wps 10ks");
        await expect(result).toBeVisible();
        await result.tap();
        await expect(page).toHaveURL(new RegExp(`/products/${target.slug}$`));
        await expect(dialog).not.toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(target.name);
      });
    }
  }
});
