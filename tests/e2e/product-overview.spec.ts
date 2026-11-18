import { expect, test } from "@playwright/test";

for (const width of [320, 390, 768, 1440]) {
  test(`product overview matches the reading and gallery order at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/products/10643");
    const main = page.locator("main.product-detail");
    const title = await main.locator("h1").boundingBox();
    const photo = await main.locator(".detail-image").boundingBox();
    const copy = await main.locator(".detail-copy").boundingBox();
    expect(title!.y + title!.height).toBeLessThanOrEqual(photo!.y);
    if (width < 768) expect(photo!.y + photo!.height).toBeLessThanOrEqual(copy!.y + 1);
    else expect(photo!.x + photo!.width).toBeLessThan(copy!.x);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const zoom = main.getByRole("button", { name: /^ขยายรูป/ });
    await zoom.press("Enter");
    await expect(main.getByRole("dialog", { name: /^ภาพขยาย/ }).getByRole("img")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(zoom).toBeFocused();
    const help = main.getByRole("button", { name: "ค่าละเอียดคืออะไร" });
    await help.click();
    await expect(main.getByRole("dialog", { name: "ค่าอ่านละเอียด" })).toContainText(
      "หน่วยย่อยที่สุด",
    );
    await page.keyboard.press("Escape");
    await expect(help).toBeFocused();
  });
}
