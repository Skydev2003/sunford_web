import { test, expect } from "@playwright/test";

test("after-sales links open the service page and preserve service-specific instructions", async ({
  page,
}) => {
  await page.goto("/");
  const supportMenu = page
    .getByRole("navigation", { name: "เมนูหลัก", exact: true })
    .getByRole("link", { name: "บริการและการสนับสนุน", exact: true });
  await supportMenu.hover();
  await page
    .locator("#desktop-submenu")
    .getByRole("link", { name: "บริการหลังการขาย", exact: true })
    .click();
  await expect(page).toHaveURL(/\/service$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("เลือกบริการที่คุณต้องการ");
  await expect(
    page.locator("footer").getByRole("link", { name: "บริการหลังการขาย", exact: true }),
  ).toHaveAttribute("href", "/service");

  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("ไม่ส่งสายชั่งและปลั๊ก");
  await expect(panel.locator("ol > li")).toHaveCount(6);
  await expect(
    panel.getByRole("link", { name: "034-276999", exact: true }).first(),
  ).toHaveAttribute("href", "tel:034276999");
  await expect(
    panel.getByRole("link", { name: "089-8152652", exact: true }).first(),
  ).toHaveAttribute("href", "tel:0898152652");
  await expect(panel.getByRole("link", { name: "LINE @sunford", exact: true })).toHaveAttribute(
    "href",
    "https://line.me/R/ti/p/@sunford",
  );

  await page.getByRole("tab", { name: "2. เปลี่ยนสินค้า", exact: true }).click();
  await expect(panel).toContainText("“ขอเปลี่ยนสินค้า”");
  await expect(panel).toContainText("อาจมีค่าใช้จ่ายตามจริง");
  await page.getByRole("tab", { name: "3. เคลมสินค้า", exact: true }).click();
  await expect(panel).toContainText("ส่งคืนพร้อมใบรับรอง");
  await expect(panel).toContainText("แจ้งสลิปค่าส่งทางไลน์ @sunford");
  await page.getByRole("tab", { name: "4. คืนสินค้า", exact: true }).click();
  await expect(panel).toContainText("“คืนสินค้า”");
  await expect(panel).toContainText("อาจมีค่าใช้จ่ายตามจริง");
  await page.getByRole("tab", { name: "5. รับสินค้าที่โรงงาน", exact: true }).click();
  await expect(panel).toContainText("หากต้องการออกใบกำกับภาษี");
  await expect(panel).toContainText("ข้อมูลคนขับรถ");
  await expect(panel).toContainText("โดยมิได้นัดหมาย");
  await expect(panel).toContainText("12.00–13.00 น.");
  await expect(panel).toContainText("โรงงาน/ศูนย์กระจายสินค้า/คลังสินค้า ซันฟอร์ด");
  await expect(panel.locator("ol > li")).toHaveCount(4);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await page
    .getByRole("navigation", { name: "เมนูมือถือ", exact: true })
    .getByRole("link", { name: "บริการหลังการขาย", exact: true })
    .click();
  await expect(page).toHaveURL(/\/service$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("เลือกบริการที่คุณต้องการ");
});

test("service tabs support keyboard navigation and show the shipping address without a copy control", async ({
  page,
}) => {
  await page.goto("/service");
  const repair = page.getByRole("tab", { name: "1. ซ่อมบำรุง", exact: true });
  await repair.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "2. เปลี่ยนสินค้า", exact: true })).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "5. รับสินค้าที่โรงงาน", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(repair).toBeFocused();
  await expect(repair).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: /คัดลอกที่อยู่/ })).toHaveCount(0);
  await expect(page.getByRole("tabpanel").locator("address")).toContainText(
    "อำเภอบางเลน จังหวัดนครปฐม 73130",
  );
});

test("all service panels fit mobile screens and the page renders without client errors", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) errors.push(message.text());
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/service");
  await expect(page.getByRole("tabpanel")).toBeVisible();
  let relatedLinksTop: number | undefined;
  for (const tab of await page.getByRole("tab").all()) {
    await tab.click();
    await expect(page.getByRole("tabpanel")).toBeVisible();
    const bottom = await page.locator("main").evaluate((element) => {
      return element.getBoundingClientRect().bottom + window.scrollY;
    });
    expect(
      bottom,
      `Content extends below the screen on ${await tab.textContent()}`,
    ).toBeLessThanOrEqual(720);
    const relatedLink = page
      .locator("main")
      .getByRole("link", { name: "นโยบายการรับประกัน", exact: true });
    const top = await relatedLink.evaluate((element) => element.getBoundingClientRect().top);
    relatedLinksTop ??= top;
    expect(
      Math.abs(top - relatedLinksTop),
      `Related links moved when selecting ${await tab.textContent()}`,
    ).toBeLessThan(1);
  }
  await page.getByRole("tab", { name: "1. ซ่อมบำรุง", exact: true }).click();
  await page.screenshot({
    path: "output/after-sales-desktop.png",
    fullPage: true,
    animations: "disabled",
    caret: "initial",
  });
  for (const width of [390, 320, 768]) {
    await page.setViewportSize({ width, height: 844 });
    for (const tab of await page.getByRole("tab").all()) {
      await tab.click();
      await expect(page.getByRole("tabpanel")).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `Overflow at ${width}px on ${await tab.textContent()}`,
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("tab", { name: "1. ซ่อมบำรุง", exact: true }).click();
  await page.screenshot({
    path: "output/after-sales-mobile.png",
    fullPage: true,
    animations: "disabled",
    caret: "initial",
  });
  expect(errors).toEqual([]);
});
