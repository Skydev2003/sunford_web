import { expect, test } from "@playwright/test";

const menus = [
  {
    label: "เครื่องชั่ง",
    links: ["ห้องปฏิบัติการ", "อุตสาหกรรม", "พาณิชยกรรมและบริการ", "ไลฟ์สไตล์"],
  },
  {
    label: "อินดิเคเตอร์แท่นชั่ง",
    links: ["ห้องปฏิบัติการ", "อุตสาหกรรม", "พาณิชยกรรมและบริการ"],
  },
  { label: "โครงสร้างแท่นชั่ง", links: ["แท่นชั่งตั้งโต๊ะ", "แท่นชั่งตั้งพื้น"] },
  { label: "ระบบ POS", links: ["POS ระบบ Android", "POS ระบบ Windows"] },
  {
    label: "อุปกรณ์เสริม",
    links: [
      "อุปกรณ์ส่งข้อมูล",
      "อุปกรณ์ต่อพ่วง",
      "Thermal Printer",
      "ชิ้นส่วนเสริม",
      "วัสดุสิ้นเปลือง",
    ],
  },
];

test("desktop navigation exposes the requested categories with working destinations", async ({
  page,
  request,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  for (const menu of menus) {
    await page.locator(".desktop-nav").getByRole("link", { name: menu.label, exact: true }).hover();
    const panel = page.locator(".desktop-submenu.is-open .submenu-panel.is-active");
    await expect(panel.locator(".submenu-links a")).toHaveText(menu.links);
    await expect(panel.locator(".submenu-group")).toHaveCount(1);
    await expect(panel.getByText("สำรวจเพิ่มเติม", { exact: true })).toHaveCount(0);
    await expect(panel.getByText("ให้เราช่วยคุณ", { exact: true })).toHaveCount(0);
    await expect(panel.locator(".submenu-group-primary > p")).toHaveCSS("font-size", "12px");
    await expect(panel.locator(".submenu-links a").first()).toHaveCSS("font-size", "24px");
    await expect(panel.locator(".submenu-links a").first()).toHaveCSS("font-weight", "600");
    await expect(panel.locator(".submenu-group-primary svg")).toHaveCount(0);
    await expect(panel.locator(".submenu-group-primary > p a")).toHaveCount(0);
    for (const link of await panel.locator(".submenu-links a").all()) {
      const href = await link.getAttribute("href");
      expect(href).toBeTruthy();
      expect((await request.get(href!)).status(), href!).toBe(200);
    }
  }
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "บริการและการสนับสนุน", exact: true })
    .hover();
  const supportPanel = page.locator(".desktop-submenu.is-open .submenu-panel.is-active");
  const extraGroups = supportPanel.locator(".submenu-group:not(.submenu-group-primary)");
  await expect(extraGroups).toHaveCount(2);
  await expect(extraGroups.locator("p")).toHaveText(["สำรวจเพิ่มเติม", "ให้เราช่วยคุณ"]);
  await expect(extraGroups.locator("a")).toHaveText([
    "ทุกเรื่องของ Sunford",
    "รู้จักซันฟอร์ด",
    "ข่าวสารและกิจกรรม",
    "ติดต่อเรา",
    "ลงทะเบียนรับประกัน",
    "ข้อมูลทางเทคนิค",
  ]);
  await page.keyboard.press("Escape");
  await expect(page.locator("#desktop-submenu")).toHaveAttribute("aria-hidden", "true");
});

test("mobile navigation keeps the original list and closes after following an indicator link", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const mobileNavigation = page.locator("#mobile-navigation");
  await expect(mobileNavigation.locator(":scope > a")).toHaveText([
    ...menus.map((menu) => menu.label),
    "บริการและการสนับสนุน",
    "สำรวจข้อมูลทั้งหมด",
    "ติดต่อเรา",
  ]);
  await expect(mobileNavigation.locator("ul")).toHaveCount(0);
  await expect(mobileNavigation.locator(":scope > a").first()).toHaveCSS("font-size", "17px");
  await mobileNavigation.getByRole("link", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true }).click();
  await expect.poll(() => decodeURIComponent(new URL(page.url()).pathname)).toBe("/Indicator");
  await expect(page.locator("#mobile-navigation")).toHaveCount(0);
  for (const width of [320, 390, 768, 1100, 1126, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test("submenus follow their parent centers and zoom on hover without shifting the layout", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  for (const width of [1126, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const label of [...menus.map((menu) => menu.label), "บริการและการสนับสนุน"]) {
      const trigger = page.locator(".desktop-nav").getByRole("link", { name: label, exact: true });
      await trigger.hover();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      const panel = page.locator(".desktop-submenu.is-open .submenu-panel.is-active");
      await expect
        .poll(async () => {
          const triggerBounds = await trigger.boundingBox();
          const panelBounds = await panel.boundingBox();
          if (!triggerBounds || !panelBounds) return Infinity;
          const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
          const expectedCenter = Math.min(
            viewportWidth - panelBounds.width / 2 - 24,
            Math.max(panelBounds.width / 2 + 24, triggerBounds.x + triggerBounds.width / 2),
          );
          return Math.abs(panelBounds.x + panelBounds.width / 2 - expectedCenter);
        })
        .toBeLessThan(1);
      const bounds = (await panel.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(23);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 23);
      await expect(panel.locator(".submenu-links")).toHaveCSS("align-items", "center");
      const link = panel.locator(".submenu-links a").first();
      const linkBeforeHover = (await link.boundingBox())!;
      await link.hover();
      await expect(link.locator("span")).toHaveCSS("transform", "matrix(1.06, 0, 0, 1.06, 0, 0)");
      expect((await link.boundingBox())!.width).toBeCloseTo(linkBeforeHover.width, 1);
    }
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(
    page.locator(".submenu-panel.is-active .submenu-links a").first().locator("span"),
  ).toHaveCSS("transform", "none");
});
