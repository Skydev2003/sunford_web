import { expect, test } from "@playwright/test";

test("the guidebook opens its first chapter and accepts direct chapter links", async ({ page }) => {
  await page.goto("/technical-specification");
  const main = page.getByRole("main");
  await expect(main.getByRole("searchbox")).toHaveCount(0);
  await expect(main.locator("#guide-title")).toHaveText("การใช้งานและการดูแลรักษาเครื่องชั่ง");
  await page.goto("/technical-specification?guide=lp50");
  await expect(main.locator("#guide-title")).toHaveText("ตั้งค่าและออกแบบฉลากด้วย SUNFORD LP50");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the mobile guidebook can open a chapter through a native link", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/technical-specification");
    await page.getByText("สารบัญคู่มือ", { exact: true }).click();
    await page
      .getByRole("navigation", { name: "บทและคู่มือ" })
      .getByRole("link", { name: "งานวิเคราะห์", exact: true })
      .click();
    await expect(page).toHaveURL("/technical-specification?guide=laboratory#guide-content");
    await expect(page.locator("#guide-title")).toHaveText("เครื่องชั่งห้องปฏิบัติการ");
  });
});

test("the home and catalogue Navbar expose both support destinations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "บริการ", exact: true })
    .press("ArrowDown");
  const home = page.locator(".submenu-panel.is-active");
  await expect(home.getByRole("link", { name: "คู่มือและสเปก" })).toHaveAttribute(
    "href",
    "/technical-specification",
  );
  await expect(home.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
    "href",
    "/software/download",
  );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/technical-specification");
  const header = page.locator("[data-products-header]:visible");
  await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await header.getByRole("button", { name: "เปิดเมนูย่อยบริการ", exact: true }).click();
  const catalog = header.locator("#products-navigation-panel");
  await expect(catalog.getByRole("link", { name: "คู่มือและสเปก" })).toHaveAttribute(
    "href",
    "/technical-specification",
  );
  await expect(catalog.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
    "href",
    "/software/download",
  );
});
