import { test, expect } from "@playwright/test";

async function loadPageImages(page: import("@playwright/test").Page) {
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate(
          (element) =>
            (element as HTMLImageElement).complete &&
            (element as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page
    .locator(".stories-track, .video-track")
    .evaluateAll((elements) =>
      elements.forEach((element) => element.scrollTo({ left: 0, behavior: "instant" })),
    );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

test("homepage renders product imagery and cycles featured products", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("SUNFORD ACS-30-JC21");
  await expect(page.locator(".hero-model")).toContainText("ACS-30-JC21");
  await expect(page.locator(".hero-buttons a").first()).toHaveAttribute(
    "href",
    "/products/acs30-jc21",
  );
  await expect(page.locator(".hero-product-video")).toHaveAttribute(
    "aria-label",
    "แอนิเมชันสินค้า ACS-30-JC21",
  );
  await page.getByRole("button", { name: "สินค้าถัดไป" }).click();
  await expect(page.locator(".hero-model")).toContainText("FEH5KS");
  await expect(page.locator(".hero-product-image")).toBeVisible();
  await expect(page.locator(".hero-product-video")).toHaveCount(0);
  await page.getByRole("button", { name: "สินค้าก่อนหน้า" }).click();
  await expect(page.locator(".hero-model")).toContainText("ACS-30-JC21");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".hero-product-video")).toBeVisible();
  await loadPageImages(page);
  await page.screenshot({
    path: "/tmp/sunford-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.screenshot({ path: "/tmp/sunford-first-screen.png", animations: "disabled" });
  expect(errors).toEqual([]);
});

test("category filters show matching products and restore the catalogue", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".product-card")).toHaveCount(3);
  await page.getByRole("button", { name: "เครื่องชั่งอุตสาหกรรม", exact: true }).click();
  await expect(page.locator(".product-card").first()).toBeVisible();
  await expect(page.locator(".product-card h3").filter({ hasText: "TIS-150-JC62Z" })).toBeVisible();
  await page.getByRole("button", { name: "ทั้งหมด", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(3);
});

test("search opens product details, supports empty results and Escape", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("does-not-exist");
  await expect(dialog.getByText("ไม่พบสินค้า ลองค้นหา WPS, FEH หรือเครื่องชั่ง")).toBeVisible();
  await dialog.getByRole("textbox").fill("FEH5KS");
  await expect(dialog.locator(".search-results a").first()).toBeVisible();
  await dialog.locator(".search-results a").first().click();
  await expect(page).toHaveURL(/\/products\/feh5ks$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("FEH5KS");
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("comparison uses selected product data and clears selections", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ WPS10KS", exact: true }).click();
  await page
    .getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ ACS-30-JC21", exact: true })
    .click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
  const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("table")).toContainText("WPS10KS");
  await expect(dialog.getByRole("table")).toContainText("ACS-30-JC21");
  await expect(dialog.getByRole("table")).toContainText("30 กิโลกรัม");
  await dialog.getByRole("button", { name: "ปิด", exact: true }).click();
  await page.getByRole("button", { name: "ล้างรายการเปรียบเทียบ" }).click();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
});

test("mobile navigation works and page does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู" }).click();
  await expect(page.getByRole("navigation", { name: "เมนูมือถือ" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "เมนูมือถือ" })
    .getByRole("link", { name: "ระบบ POS", exact: true })
    .click();
  await expect(page.getByRole("navigation", { name: "เมนูมือถือ" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await loadPageImages(page);
  await page.screenshot({
    path: "/tmp/sunford-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

test("catalogue API returns data and unknown products render an unindexable 404 page", async ({
  request,
  page,
}) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.products.length).toBeGreaterThanOrEqual(150);
  await page.goto("/products");
  await page.getByRole("button", { name: "ผลิตภัณฑ์ทั้งหมด", exact: true }).click();
  await expect(page.locator(".product-card")).toHaveCount(24);
  await page.getByRole("button", { name: /ดูเพิ่มเติม \(24/ }).click();
  await expect(page.locator(".product-card")).toHaveCount(48);
  const missing = await page.goto("/products/does-not-exist");
  await expect(page.getByRole("heading", { name: "ยังไม่พบหน้าที่คุณกำลังมองหา" })).toBeVisible();
  // Streaming production responses can send 200 before notFound() resolves.
  // In that case Next.js must mark the rendered 404 page as non-indexable.
  expect([200, 404]).toContain(missing?.status());
  if (missing?.status() === 200) {
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  }
});

test("long Thai article URLs use bounded internal paths and preserve the public URL", async ({
  page,
}) => {
  const path =
    "/การพิมพ์สติ๊กเกอร์น้ำหนัก-วันที่-เวลา-ภาพพื้นหลัง-บาร์โค้ด-คิวอาร์โค้ดจากเครื่องชั่ง";
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  await expect(page.locator(".content-heading h1")).toBeVisible();
  await expect(page.locator(".source-prose").first()).toBeVisible();
  expect(decodeURI(new URL(page.url()).pathname)).toBe(path);
});
