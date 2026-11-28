import { expect, test } from "@playwright/test";

const builder = "/platforms/custom-spec";
const indicatorFeatures = [
  "เชื่อมต่ออุปกรณ์",
  "กันน้ำกันฝุ่น",
  "คำนวณราคา",
  "นับจำนวน",
  "เตือนน้ำหนักขาดเกิน",
];
const platformFeatures = ["Bench-top", "Mini-floor", "Standard-floor", "High-Leg", "Weighing desk"];

test("desktop reveals one Platform feature group at a time with hover and keyboard", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/platforms/indicators");
  const header = page.locator("[data-products-header]:visible");
  await expect(header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล" })).toBeEnabled();
  const trigger = header.getByRole("link", { name: "แท่นชั่ง", exact: true });
  await expect(trigger).toHaveAttribute("aria-current", "location");
  await expect(trigger).toHaveCSS("text-decoration-line", "none");
  await trigger.hover();
  const menu = header.locator('[data-nav-menu="/platforms"]');
  const products = menu.locator('[data-nav-column="primary"]');
  const features = menu.locator('[data-nav-column="uses"]');
  await expect(products.getByRole("link")).toHaveText([
    "อินดิเคเตอร์",
    "โครงสร้างแท่นชั่ง",
    "จัดสเปค",
  ]);
  const indicators = features.getByRole("group", { name: "คุณสมบัติ / อินดิเคเตอร์" });
  const structures = features.getByRole("group", { name: "คุณสมบัติ / โครงสร้างแท่นชั่ง" });
  const indicatorLink = products.getByRole("link", { name: "อินดิเคเตอร์", exact: true });
  await expect(products.getByRole("button")).toHaveCount(0);
  await expect(products.locator("svg")).toHaveCount(0);
  await expect(indicators.getByRole("link")).toHaveText(indicatorFeatures);
  await expect(structures).toBeHidden();
  await products.getByRole("link", { name: "โครงสร้างแท่นชั่ง" }).hover();
  await expect(indicators).toBeHidden();
  await expect(structures.getByRole("link")).toHaveText(platformFeatures);
  const bench = features.getByRole("link", { name: "Bench-top" });
  await bench.hover();
  await expect(bench).toHaveAttribute("href", "/platforms/structures?type=bench-top");
  await page.mouse.move(0, 850);
  await expect(menu).toBeHidden();
  await trigger.hover();
  await expect(indicators.getByRole("link")).toHaveText(indicatorFeatures);
  await expect(structures).toBeHidden();
  await products.getByRole("link", { name: "โครงสร้างแท่นชั่ง" }).press("ArrowRight");
  await expect(bench).toBeFocused();
  await indicatorLink.press("ArrowRight");
  await expect(indicators.getByRole("link").first()).toBeFocused();
  await expect(structures).toBeHidden();
  await expect(indicators.getByRole("link").first()).toHaveAttribute(
    "href",
    "/platforms/indicators?feature=connectivity",
  );
  const help = menu.locator('[data-nav-column="help"]');
  await expect(help.getByRole("link")).toHaveText([
    "ขอใบเสนอราคา",
    "เลือกซื้อที่ร้านออนไลน์",
    "ติดต่อเรา",
  ]);
  await expect(help.getByRole("link", { name: "ขอใบเสนอราคา" })).toHaveAttribute(
    "href",
    "/service/quotation",
  );
  await expect(help.getByRole("link", { name: "เลือกซื้อที่ร้านออนไลน์" })).toHaveAttribute(
    "href",
    /^https:\/\/sunfordshop\.com\//,
  );
  await expect(help.getByRole("link", { name: "ติดต่อเรา" })).toHaveAttribute(
    "href",
    "/service?section=contact",
  );
  await products.getByRole("link", { name: "จัดสเปค" }).click();
  await expect(page).toHaveURL(builder);
  await expect(page.getByRole("heading", { level: 1, name: "จัดสเปคแท่นชั่ง" })).toBeVisible();
  await expect(page.getByRole("button", { name: "แท่นชั่ง", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

for (const width of [320, 390, 1024]) {
  test.describe(`touch at ${width}px`, () => {
    test.use({ hasTouch: true, isMobile: true, viewport: { width, height: 900 } });
    test("switches both lists without leaving the menu", async ({ page }) => {
      await page.goto("/platforms/indicators");
      const header = page.locator("[data-products-header]:visible");
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      const trigger = header.getByRole("link", { name: "แท่นชั่ง", exact: true });
      await expect(trigger).toHaveAttribute("aria-current", "location");
      await expect(trigger).toHaveCSS("text-decoration-line", "none");
      await header.getByRole("button", { name: "เปิดเมนูย่อยแท่นชั่ง", exact: true }).tap();
      const menu = header.locator('[data-nav-menu="/platforms"]');
      const products = menu.locator('[data-nav-column="primary"]');
      const features = menu.locator('[data-nav-column="uses"]');
      const indicators = features.getByRole("group", { name: "คุณสมบัติ / อินดิเคเตอร์" });
      const structures = features.getByRole("group", { name: "คุณสมบัติ / โครงสร้างแท่นชั่ง" });
      const structureToggle = products.getByRole("button", { name: "คุณสมบัติ โครงสร้างแท่นชั่ง" });
      const indicatorToggle = products.getByRole("button", { name: "คุณสมบัติ อินดิเคเตอร์" });
      await expect(products.locator("svg")).toHaveCount(0);
      await expect(
        products.getByRole("link", { name: "อินดิเคเตอร์", exact: true }),
      ).toHaveAttribute("href", "/platforms/indicators");
      await expect(indicatorToggle).toHaveText("คุณสมบัติ");
      await expect(structures).toBeHidden();
      await expect(indicatorToggle).toHaveAttribute("aria-expanded", "true");
      await expect(indicators.getByRole("link")).toHaveText(indicatorFeatures);
      await structureToggle.tap();
      await expect(structureToggle).toHaveAttribute("aria-expanded", "true");
      await expect(structures.getByRole("link")).toHaveText(platformFeatures);
      await expect(indicators).toBeHidden();
      await indicatorToggle.tap();
      await expect(structureToggle).toHaveAttribute("aria-expanded", "false");
      await expect(structures).toBeHidden();
      await expect(indicators.getByRole("link")).toHaveText(indicatorFeatures);
      await indicatorToggle.tap();
      await expect(indicatorToggle).toHaveAttribute("aria-expanded", "false");
      await expect(indicators).toBeHidden();
      await menu.getByRole("button", { name: "เมนูหลัก", exact: true }).tap();
      await header.getByRole("button", { name: "เปิดเมนูย่อยแท่นชั่ง", exact: true }).tap();
      await expect(indicators.getByRole("link")).toHaveText(indicatorFeatures);
      await expect(page).toHaveURL("/platforms/indicators");
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  });
}

test("previous builder URLs send a permanent redirect straight to the new URL", async ({
  request,
}) => {
  for (const path of [
    "/platforms/spec-builder",
    "/spec-builder",
    "/guides/indicator-platform-compatibility",
  ]) {
    const old = await request.get(`${path}?ref=platform`, { maxRedirects: 0 });
    expect(old.status()).toBe(308);
    const target = new URL(old.headers().location, old.url());
    expect(`${target.pathname}${target.search}`).toBe(`${builder}?ref=platform`);
  }
  const current = await request.get(builder, { maxRedirects: 0 });
  expect(current.status()).toBe(200);
  expect(await current.text()).toContain(`https://sunford-web.vercel.app${builder}`);
});
