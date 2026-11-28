import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import type { Product } from "../../src/features/catalog/types";

const mainMenu = [
  "ร้าน",
  "เครื่องชั่ง",
  "แท่นชั่ง",
  "ซอฟต์แวร์",
  "อุปกรณ์เสริม",
  "POS",
  "MES",
  "โซลูชัน",
  "บริการช่วยเหลือ",
];

test("the hub has three server-rendered links and each dedicated page owns its product lineup", async ({
  request,
}) => {
  const response = await request.get("/platforms");
  expect(response.status()).toBe(200);
  const $ = load(await response.text());
  expect($("main h1").text()).toBe("แท่นชั่ง");
  expect($("main header").text()).toContain("โหลดเซลล์");
  expect(
    $("main nav a")
      .map((_, link) => $(link).attr("href"))
      .get(),
  ).toEqual(["/platforms/indicators", "/platforms/structures", "/platforms/custom-spec"]);
  expect($('main a[href^="/products/"]').length).toBe(0);
  expect(new URL($('link[rel="canonical"]').attr("href")!).pathname).toBe("/platforms");
  expect($('meta[name="description"]').attr("content")).toContain("ชุดแท่นชั่งอุตสาหกรรม");

  const { products }: { products: Product[] } = await (await request.get("/api/products")).json();
  for (const [category, path, section, title] of [
    ["platforms", "/platforms/structures", "#product-listing-platforms", "โครงสร้างแท่นชั่ง"],
    ["indicators", "/platforms/indicators", "#product-lineup-indicators", "อินดิเคเตอร์"],
  ]) {
    const catalogue = await request.get(path, { maxRedirects: 0 });
    expect(catalogue.status(), path).toBe(200);
    const $catalogue = load(await catalogue.text());
    expect($catalogue("main h1").text()).toBe(title);
    expect($catalogue("title").text()).toContain(title);
    expect($catalogue('meta[name="description"]').attr("content")).toContain(title);
    expect(new URL($catalogue('link[rel="canonical"]').attr("href")!).pathname).toBe(path);
    expect($catalogue('header [aria-current="location"]').attr("href")).toBe("/platforms");
    const slugs = new Set(
      products
        .filter(({ warehouseCategoryId }) => warehouseCategoryId === category)
        .map(({ slug }) => `/products/${slug}`),
    );
    const links = $catalogue(section).find('a[href^="/products/"]').toArray();
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(slugs.has($catalogue(link).attr("href")!)).toBe(true);
    if (category === "platforms") {
      const types = $catalogue('nav[aria-label="รูปแบบโครงสร้างแท่นชั่ง"] a');
      expect(types.map((_, link) => $catalogue(link).find("strong").text()).get()).toEqual([
        "Bench-top",
        "Mini-floor",
        "Standard-floor",
        "High-Leg",
        "Weighing desk",
      ]);
      expect(types.toArray().every((link) => $catalogue(link).find("span").text().trim())).toBe(
        true,
      );
    }
  }
});

test("legacy platform filter URLs redirect to the matching dedicated filter", async ({
  request,
}) => {
  for (const [source, path, parameter, value] of [
    ["device-connection", "/platforms/indicators", "feature", "connectivity"],
    ["waterproof", "/platforms/indicators", "feature", "waterproof"],
    ["benchtop", "/platforms/structures", "type", "bench-top"],
    ["weighing-desk", "/platforms/structures", "type", "weighing-desk"],
  ]) {
    const response = await request.get(`/platforms?feature=${source}&ref=menu`, {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(308);
    const target = new URL(response.headers().location, response.url());
    expect(target.pathname).toBe(path);
    expect(target.searchParams.get(parameter)).toBe(value);
    expect(target.searchParams.get("ref")).toBe("menu");
    expect(target.searchParams.has(parameter === "type" ? "feature" : "type")).toBe(false);
  }
});

for (const width of [390, 834, 1440]) {
  test(`the hub cards stay readable and link directly to each category at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 960 });
    await page.goto("/platforms");
    const cards = page.getByRole("navigation", { name: "เลือกส่วนประกอบและจัดสเปคแท่นชั่ง" });
    await expect(cards.getByRole("link")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const [name, path] of [
      ["อินดิเคเตอร์", "/platforms/indicators"],
      ["โครงสร้างแท่นชั่ง", "/platforms/structures"],
      ["จัดสเปคแท่นชั่ง", "/platforms/custom-spec"],
    ]) {
      const card = cards.getByRole("link", { name, exact: true });
      await expect(card).toHaveAttribute("href", path);
      await card.click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveText(name);
      await page.goBack();
      await expect(page).toHaveURL("/platforms");
    }
  });
}

test("desktop menu opens both dedicated Platform routes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/service?section=contact");
  const header = page.locator("[data-products-header]:visible");
  const desktopMenu = header.locator(".desktop-nav");
  await expect(desktopMenu.getByRole("link")).toHaveText(mainMenu);
  for (const [name, id] of [
    ["อินดิเคเตอร์", "indicators"],
    ["โครงสร้างแท่นชั่ง", "structures"],
  ]) {
    await desktopMenu.getByRole("link", { name: "แท่นชั่ง", exact: true }).press("ArrowDown");
    await header
      .locator('[data-nav-menu="/platforms"]')
      .getByRole("link", { name, exact: true })
      .click();
    await expect(page).toHaveURL(`/platforms/${id}`);
    await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toContainText(name);
  }
});

test("mobile Navbar retains one builder entry in each owning submenu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service?section=contact");
  const header = page.locator("[data-products-header]:visible");
  const menu = header.locator("#products-navigation-panel");
  await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await expect(menu.locator("[data-nav-category-row] > a")).toHaveText(mainMenu);
  for (const [label, path] of [
    ["เครื่องชั่ง", "/scales"],
    ["แท่นชั่ง", "/platforms"],
  ]) {
    await menu.getByRole("button", { name: `เปิดเมนูย่อย${label}`, exact: true }).click();
    await expect(menu.getByRole("link", { name: "จัดสเปค", exact: true })).toHaveAttribute(
      "href",
      `${path}/custom-spec`,
    );
    await menu.getByRole("button", { name: "เมนูหลัก", exact: true }).click();
  }
});
