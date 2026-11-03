import { expect, test } from "@playwright/test";

test("product readability help explains display increments without changing the specification", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/products/10639");
  const help = page.getByRole("button", { name: "ค่าละเอียดคืออะไร", exact: true });
  const value = page.locator(".detail-weighing tbody td").nth(1);
  const original = await value.textContent();
  await help.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toContainText("หน่วยย่อยที่สุดที่หน้าจอเครื่องชั่งแสดงได้");
  await expect(tooltip).toContainText("เพิ่มหรือลดทีละ 1 กรัม");
  await expect(help).toHaveAttribute("aria-describedby", (await tooltip.getAttribute("id"))!);
  await expect(value).toHaveText(original!);
  await page.screenshot({ path: test.info().outputPath("readability-tooltip.png") });
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await page.mouse.move(0, 0);
  await help.focus();
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(tooltip).toHaveCount(0);
  await page.keyboard.press("Tab");
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await help.hover();
    await expect(tooltip).toBeVisible();
    const bounds = (await tooltip.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(7);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 7);
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("product help remains available after client navigation and reload", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await dialog.getByRole("textbox").fill("FEH5KS");
  await dialog.locator(".search-results a").first().click();
  await expect(page).toHaveURL(/\/products\/feh5ks$/);

  for (const reload of [false, true]) {
    if (reload) await page.reload();
    const help = page.getByRole("button", { name: "ค่าละเอียดคืออะไร", exact: true });
    await help.hover();
    await expect(page.getByRole("tooltip")).toContainText("หน่วยย่อยที่สุด");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  }
  expect(errors).toEqual([]);
});

test("tooltip explains a header icon, remains hoverable and does not move the button", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("button", { name: "ค้นหาสินค้า", exact: true });
  const before = (await search.boundingBox())!;
  await search.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toHaveText("ค้นหาสินค้า");
  await expect(search).toHaveAttribute("aria-describedby", (await tooltip.getAttribute("id"))!);
  expect(await search.boundingBox()).toEqual(before);
  const bounds = (await tooltip.boundingBox())!;
  expect(bounds.y).toBeGreaterThanOrEqual(before.y + before.height);
  await tooltip.hover();
  await page.waitForTimeout(400);
  await expect(tooltip).toBeVisible();
  await page.mouse.move(5, 500);
  await expect(tooltip).toHaveCount(0);
});

test("keyboard tooltip dismisses with Escape and remains visible above a modal", async ({
  page,
}) => {
  await page.goto("/");
  const search = page.getByRole("button", { name: "ค้นหาสินค้า", exact: true });
  await search.focus();
  await expect(page.getByRole("tooltip")).toHaveText("ค้นหาสินค้า");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(search).toBeFocused();
  await search.press("Enter");
  const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await expect(dialog).toBeVisible();
  const close = dialog.getByRole("button", { name: "ปิด", exact: true });
  await close.focus();
  const tooltip = dialog.getByRole("tooltip");
  await expect(tooltip).toHaveText("ปิด");
  expect(
    await tooltip.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return (
        document.elementFromPoint(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2) ===
        element
      );
    }),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("tooltip descriptions follow comparison state while the original action still works", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator(".header-compare").click();
  const add = page.getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ WPS10KS", exact: true });
  await add.hover();
  await expect(page.getByRole("tooltip")).toHaveText("เพิ่มเพื่อเปรียบเทียบ WPS10KS");
  await add.click();
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await expect(page.locator(".compare-bar")).toBeVisible();
  const remove = page.getByRole("button", { name: "นำออกจากเปรียบเทียบ WPS10KS", exact: true });
  await expect(remove).toHaveAttribute("aria-pressed", "true");
  await page.mouse.move(5, 5);
  await remove.hover();
  await expect(page.getByRole("tooltip")).toHaveText("นำออกจากเปรียบเทียบ WPS10KS");
  await remove.click();
  await expect(page.locator(".compare-bar")).toContainText("0/3");
  await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
});

test("tooltip at the bottom edge stays within narrow and wide viewports", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 1440]) {
    await page.mouse.move(0, 0);
    await page.setViewportSize({ width, height: 844 });
    const launcher = page.locator("[data-mascot-launcher]");
    const position = (await launcher.boundingBox())!;
    await page.mouse.move(position.x + position.width / 2, position.y + position.height / 2);
    await launcher.hover();
    const tooltip = page.getByRole("tooltip");
    await expect(tooltip).toHaveText((await launcher.getAttribute("aria-label"))!);
    const bounds = (await tooltip.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(7);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width - 7);
    expect(bounds.y).toBeGreaterThanOrEqual(7);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(837);
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
  }
});

test.describe("touch tooltip behavior", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("tapping an icon performs its action without leaving a tooltip open", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).tap();
    const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(400);
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await dialog.getByRole("button", { name: "ปิด", exact: true }).tap();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("tooltip")).toHaveCount(0);
  });
});
