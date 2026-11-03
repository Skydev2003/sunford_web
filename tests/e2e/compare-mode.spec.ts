import { expect, test } from "@playwright/test";

for (const width of [1440, 390]) {
  test(`comparison controls appear only during an explicit session (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/products");
    const toggle = page.locator(".header-compare");
    const controls = page.getByRole("button", {
      name: /^(เพิ่มเพื่อ|นำออกจาก)เปรียบเทียบ /,
    });
    const bar = page.locator(".compare-bar");
    const view = bar.getByRole("button", { name: "ดูการเปรียบเทียบ" });
    const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" });

    await expect(page.getByRole("article").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /^ดูรายละเอียด / })).toHaveCount(0);
    await expect(controls).toHaveCount(0);
    await expect(bar).toHaveCount(0);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    await expect(controls.first()).toBeVisible();
    await expect(dialog).not.toBeVisible();
    await expect(view).toBeDisabled();

    for (const name of ["ACS-30-JC21", "RLS1100", "WPS10KS"]) {
      await page
        .getByRole("button", { name: `เพิ่มเพื่อเปรียบเทียบ ${name}`, exact: true })
        .click();
    }
    await expect(bar).toContainText("3/3");
    await expect(
      page.getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ FEH5KS", exact: true }),
    ).toBeDisabled();
    await view.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("table")).toContainText("ACS-30-JC21");
    await expect(dialog.getByRole("table")).toContainText("WPS10KS");
    await dialog.getByRole("button", { name: "ปิด", exact: true }).click();
    await expect(controls).toHaveCount(0);
    await expect(bar).toHaveCount(0);
    await expect(toggle).toHaveAttribute("aria-pressed", "false");

    await toggle.click();
    await expect(controls.first()).toBeVisible();
    await expect(bar).toContainText("0/3");
    await expect(view).toBeDisabled();
    await page.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
    await expect(controls).toHaveCount(0);
    await expect(bar).toHaveCount(0);
  });
}

test("Escape finishes comparison and the sidebar can start a new session", async ({ page }) => {
  await page.goto("/products");
  await page
    .getByRole("complementary")
    .getByRole("button", { name: "เปรียบเทียบสินค้า", exact: true })
    .click();
  const add = page.getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ ACS-30-JC21", exact: true });
  await add.click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
  await expect(page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(add).toHaveCount(0);
  await expect(page.locator(".compare-bar")).toHaveCount(0);
  await page
    .getByRole("complementary")
    .getByRole("button", { name: "เปรียบเทียบสินค้า", exact: true })
    .click();
  await expect(add).toBeVisible();
  await expect(page.locator(".compare-bar")).toContainText("0/3");
});

test("removing the last product in the comparison finishes the session", async ({ page }) => {
  await page.goto("/products");
  await page.locator(".header-compare").click();
  await page
    .getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ ACS-30-JC21", exact: true })
    .click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
  const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" });
  await dialog
    .getByRole("button", { name: "นำ ACS-30-JC21 ออกจากการเปรียบเทียบ", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /เพิ่มเพื่อเปรียบเทียบ/ })).toHaveCount(0);
});
