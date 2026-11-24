import { test, expect } from "@playwright/test";

test("desktop menu expands over a uniform curtain and closes with Escape", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/service?section=contact");
  const links = page.locator(".desktop-nav > a");
  const backdrop = page.locator(".nav-backdrop");
  const menu = page.locator("#products-navigation-panel");
  for (const index of [0, 1, 0]) {
    const link = links.nth(index);
    await link.hover();
    await expect(link).toHaveAttribute("aria-expanded", "true");
    await expect(backdrop).toHaveCSS("backdrop-filter", "blur(20px)");
    await expect(backdrop).toHaveCSS("background-color", "rgba(0, 0, 0, 0.2)");
    await expect(menu).toHaveCSS("background-color", "rgb(250, 250, 252)");
    await expect(menu).toHaveCSS("box-shadow", "none");
    await expect
      .poll(() => menu.evaluate((element) => element.scrollHeight - element.clientHeight))
      .toBeLessThanOrEqual(1);
  }
  await links.first().press("ArrowDown");
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(backdrop).toBeHidden();
});

test("imported company, collection, software and warranty pages are available", async ({
  page,
}) => {
  await page.goto("/about-us");
  await expect(page.locator("main")).toContainText("จุดเริ่มต้นของเรา");
  await page.goto("/collections/Smart weighing");
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.goto("/software/download");
  await expect(
    page.getByRole("main").getByRole("heading", { name: "SUNFORD RLS1100" }),
  ).toBeVisible();
  await page.goto("/software/download/sunford-pos-android");
  await expect(page.getByRole("heading", { level: 1, name: "SUNFORD POS ANDROID" })).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("link", { name: "ติดต่อฝ่ายบริการ" }),
  ).toHaveAttribute("href", "/service?section=contact");
  await page.goto("/warranty/register");
  await expect(page.getByRole("link", { name: "เปิดแบบฟอร์ม Sunford" })).toHaveAttribute(
    "href",
    "https://www.sunford.co/warranty/register",
  );
});

test("full product details keep original specifications and gallery images", async ({ page }) => {
  await page.goto("/products/wps10ks");
  await expect(page.locator(".spec-list")).toContainText("10 กิโลกรัม");
  await expect(page.locator(".product-information")).toContainText("IP67");
  const thumbnails = page.getByRole("button", { name: /ดูรูป WPS10KS มุมที่/ });
  expect(await thumbnails.count()).toBeGreaterThan(1);
  await thumbnails.first().click();
  await expect(thumbnails.first()).toHaveAttribute("aria-pressed", "true");
});

test("directory searches public content and mobile content pages do not overflow", async ({
  page,
}) => {
  await page.goto("/explore");
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("รับประกัน");
  await expect(page.locator(".directory-card").first()).toContainText("รับประกัน");
  for (const path of [
    "/about-us",
    "/software/download",
    "/products/10639",
    "/service?section=contact",
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Mobile overflow on ${path}`,
    ).toBe(true);
  }
});
