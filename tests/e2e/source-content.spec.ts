import { test, expect } from "@playwright/test";

test("desktop menu expands over a uniform curtain and closes with Escape", async ({ page }) => {
  await page.goto("/");
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  const links = page.getByRole("navigation", { name: "เมนูหลัก", exact: true }).getByRole("link");
  const firstLabel = (await links.nth(0).innerText()).trim();
  const secondLabel = (await links.nth(1).innerText()).trim();
  await links.nth(0).hover();
  await expect(
    page.getByRole("navigation", { name: `สำรวจ${firstLabel}`, exact: true }),
  ).toBeVisible();
  const backdrop = page.locator(".nav-backdrop");
  await expect(backdrop).toHaveCSS("opacity", "1");
  await expect(backdrop).toHaveCSS("backdrop-filter", "blur(20px)");
  await expect(backdrop).toHaveCSS("background-color", "rgba(232, 232, 237, 0.4)");
  const menu = page.locator("#desktop-submenu");
  await expect(menu).toHaveCSS("background-color", "rgb(250, 250, 252)");
  await expect(menu).toHaveCSS("box-shadow", "none");
  const menuFitsContent = () =>
    menu.evaluate((element) => {
      const panel = element.querySelector(".submenu-panel.is-active")!;
      return (
        Math.abs(element.getBoundingClientRect().height - panel.getBoundingClientRect().height) <
          1 && element.scrollHeight <= element.clientHeight + 1
      );
    });
  await expect.poll(menuFitsContent).toBe(true);
  await links.nth(1).hover();
  await expect(
    page.getByRole("navigation", { name: `สำรวจ${secondLabel}`, exact: true }),
  ).toBeVisible();
  await expect(backdrop).toHaveCSS("opacity", "1");
  await expect.poll(menuFitsContent).toBe(true);
  // A brief excursion beyond the menu should not flash the backdrop off and on.
  await page.mouse.move(20, 450);
  await links.nth(0).hover();
  await expect(
    page.getByRole("navigation", { name: `สำรวจ${firstLabel}`, exact: true }),
  ).toBeVisible();
  await expect(backdrop).toHaveCSS("opacity", "1");
  await page.screenshot({ path: "C:/tmp/sunford-menu-blur.png", animations: "disabled" });
  await page.keyboard.press("Escape");
  // Escape closes keyboard-opened menus as well as pointer-opened menus.
  await links.nth(0).focus();
  await page.keyboard.press("Escape");
  await expect(page.locator("#desktop-submenu")).toBeHidden();
  await expect(backdrop).toHaveCSS("opacity", "0");
});

test("imported company, collection, software and warranty pages are available", async ({
  page,
}) => {
  await page.goto("/about-us");
  await expect(page.locator("main")).toContainText("จุดเริ่มต้นของเรา");
  await page.goto("/collections/Smart weighing");
  await expect(page.locator(".product-card").first()).toBeVisible();
  await page.goto("/software/download");
  await expect(page.locator(".software-card").first()).toBeVisible();
  await page.goto("/software/download/sunford-pos-android");
  await expect(page.locator("main")).toContainText("Android");
  await expect(page.locator(".video-card").first()).toBeVisible();
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
  for (const path of ["/about-us", "/software/download", "/products/10639", "/contact-us"]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      `Mobile overflow on ${path}`,
    ).toBe(true);
  }
});
