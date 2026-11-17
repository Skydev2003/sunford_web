import { expect, test, type Locator, type Page } from "@playwright/test";

type SearchProduct = {
  slug: string;
  name: string;
  image: string;
  fallbackImage?: string;
  warehouseSku: string;
};

let missingImage: SearchProduct;
let withImage: SearchProduct;
const searchTitle = "ค้นพบสิ่งที่ใช่สำหรับคุณ";
const sizes = [320, 390, 600, 768, 834, 1440].map((width) => ({ width, height: 900 }));
sizes.push({ width: 667, height: 375 });

test.beforeAll(async ({ request }) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: SearchProduct[] };
  missingImage = products
    .filter((product) => product.warehouseSku && !product.image && !product.fallbackImage)
    .sort((a, b) => b.name.length - a.name.length)[0];
  withImage = products.find(
    (product) => product.warehouseSku && product.image && !product.fallbackImage,
  )!;
  expect(missingImage?.name.length).toBeGreaterThan(40);
  expect(withImage).toBeTruthy();
});

async function openSearch(page: Page) {
  const trigger = page.getByRole("button", {
    name: page.url().endsWith("/") ? "ค้นหาสินค้า" : "ค้นหาสินค้าและข้อมูล",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: searchTitle, exact: true });
  await expect(dialog).toBeVisible();
  return { trigger, dialog, input: dialog.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }) };
}

async function findProduct(page: Page, product: SearchProduct) {
  await page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" }).fill(product.warehouseSku);
  const row = page.locator(`.search-results > a[href="/products/${product.slug}"]`);
  await expect(row).toBeVisible();
  await expect(row.locator("strong")).toHaveText(product.name);
  return row;
}

async function dimensions(row: Locator) {
  return row.evaluate((element) => {
    const thumbnail = element.querySelector<HTMLElement>(
      ":scope > img, :scope > [data-product-image-placeholder]",
    )!;
    const text = element.querySelector<HTMLElement>(
      ":scope > div:not([data-product-image-placeholder])",
    )!;
    const arrow = element.querySelector(":scope > svg")!;
    const bounds = element.getBoundingClientRect();
    const imageBounds = thumbnail.getBoundingClientRect();
    const textBounds = text.getBoundingClientRect();
    return {
      thumbnail: { width: imageBounds.width, height: imageBounds.height },
      text: { width: textBounds.width, client: text.clientWidth, scroll: text.scrollWidth },
      availableTextWidth:
        bounds.width -
        65 -
        arrow.getBoundingClientRect().width -
        2 * parseFloat(getComputedStyle(element).gap),
    };
  });
}

async function expectDialogFits(page: Page, dialog: Locator) {
  const bounds = (await dialog.boundingBox())!;
  const viewport = page.viewportSize()!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width + 1);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height + 1);
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
    true,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
}

for (const route of ["/", "/products/wps10ks"]) {
  for (const size of sizes) {
    test(`search thumbnails fit ${route} at ${size.width}x${size.height}`, async ({
      page,
    }, info) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(size);
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const { trigger, dialog, input } = await openSearch(page);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));

      for (const state of ["missing", "image", "failed"] as const) {
        const product = state === "missing" ? missingImage : withImage;
        if (state === "failed") {
          const image = dialog.locator(`a[href="/products/${withImage.slug}"] > img`);
          const url = await image.evaluate(
            (element: HTMLImageElement) => element.currentSrc || element.src,
          );
          await page.route(
            (requestUrl) => requestUrl.href === url,
            (request) => request.abort(),
          );
          await findProduct(page, missingImage);
        }
        const row = await findProduct(page, product);
        if (state === "image") {
          await expect(row.locator(":scope > img")).toBeVisible();
          await expect
            .poll(() =>
              row
                .locator(":scope > img")
                .evaluate(
                  (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
                ),
            )
            .toBe(true);
        } else {
          await expect(row.locator(":scope > [data-product-image-placeholder]")).toBeVisible();
        }
        const measured = await dimensions(row);
        await info.attach(`${state}-geometry`, {
          body: JSON.stringify(measured),
          contentType: "application/json",
        });
        if (state === "missing" && [320, 390, 834, 1440].includes(size.width)) {
          await page.screenshot({ path: info.outputPath("search-missing-image.png") });
        }
        expect(Math.abs(measured.thumbnail.width - 65)).toBeLessThanOrEqual(1);
        expect(Math.abs(measured.thumbnail.height - 65)).toBeLessThanOrEqual(1);
        expect(Math.abs(measured.text.width - measured.availableTextWidth)).toBeLessThanOrEqual(1);
        expect(measured.text.scroll).toBeLessThanOrEqual(measured.text.client + 1);
        await expectDialogFits(page, dialog);
      }

      await input.fill("/contact-us");
      const contentRow = dialog.locator('.search-results > a[href="/contact-us"]');
      await expect(contentRow).toBeVisible();
      await expect(
        contentRow.locator(":scope > img, :scope > [data-product-image-placeholder]"),
      ).toHaveCount(0);
      const inset = await contentRow.evaluate(
        (element) =>
          element.querySelector("div")!.getBoundingClientRect().left -
          element.getBoundingClientRect().left,
      );
      expect(Math.abs(inset)).toBeLessThanOrEqual(1);
      await expectDialogFits(page, dialog);
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      expect(errors).toEqual([]);
    });
  }
}

for (const route of ["/", "/products/wps10ks"]) {
  for (const size of [
    { width: 390, height: 900 },
    { width: 1440, height: 900 },
    { width: 667, height: 375 },
  ]) {
    test(`search chevrons and hidden scrollbar preserve scrolling from ${route} at ${size.width}x${size.height}`, async ({
      page,
    }, info) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize(size);
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const { dialog, input, trigger } = await openSearch(page);
      await input.fill("");
      const rows = dialog.locator(".search-results > a");
      await expect(rows.first()).toBeVisible();
      expect(await rows.count()).toBeGreaterThan(1);
      await expect(rows.locator(":scope > svg:not(.lucide-chevron-right)")).toHaveCount(0);
      await expect(rows.first().locator(":scope > svg")).toHaveAttribute("width", "18");
      const scroll = await dialog.evaluate((element) => ({
        hidden: getComputedStyle(element).scrollbarWidth,
        webkit: getComputedStyle(element, "::-webkit-scrollbar").display,
        overflows: element.scrollHeight > element.clientHeight,
      }));
      expect(scroll).toEqual({ hidden: "none", webkit: "none", overflows: true });
      await expectDialogFits(page, dialog);
      if (size.height === 900)
        await page.screenshot({ path: info.outputPath("search-chevrons.png") });
      await dialog.hover({ position: { x: 40, y: 200 } });
      await page.mouse.wheel(0, 650);
      await expect.poll(() => dialog.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
      await rows.last().scrollIntoViewIfNeeded();
      await expect(rows.last()).toBeInViewport();
      await input.fill("/contact-us");
      const content = dialog.locator('.search-results > a[href="/contact-us"]');
      await expect(content.locator(":scope > svg")).toHaveClass(/lucide-chevron-right/);
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await openSearch(page);
      const product = await findProduct(page, withImage);
      await expect(product.locator(":scope > svg")).toHaveClass(/lucide-chevron-right/);
      await product.click();
      await expect(page).toHaveURL((url) => url.pathname === `/products/${withImage.slug}`);
      await expect(dialog).not.toBeVisible();
    });
  }
}

test.describe("touch search interactions", () => {
  test.use({ hasTouch: true, isMobile: true });
  for (const route of ["/", "/products/wps10ks"]) {
    test(`search, clear, empty state, navigation and closing from ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(route);
      const { dialog, input } = await openSearch(page);
      await findProduct(page, missingImage);
      await dialog.getByRole("button", { name: "ล้างการค้นหา", exact: true }).tap();
      await expect(input).toHaveValue("");
      await input.fill("__rsp01_no_matching_result__");
      await expect(dialog.locator(".empty-state")).toBeVisible();
      const row = await findProduct(page, withImage);
      await row.tap();
      await expect(page).toHaveURL(new RegExp(`/products/${withImage.slug}$`));
      await expect(dialog).not.toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(withImage.name);
      const reopened = await openSearch(page);
      await reopened.dialog.getByRole("button", { name: "ปิด", exact: true }).tap();
      await expect(reopened.dialog).not.toBeVisible();
      await expect(reopened.trigger).toBeFocused();
    });
  }
});
