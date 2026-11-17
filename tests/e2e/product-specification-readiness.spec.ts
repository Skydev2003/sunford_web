import { expect, test } from "@playwright/test";

for (const width of [390, 834, 1440]) {
  test(`specification launcher waits for hydration and opens on its first action at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    let release: () => void = () => {};
    const chunks = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/_next/static/chunks/**", async (route) => {
      if (route.request().resourceType() === "script") await chunks;
      await route.continue();
    });
    try {
      await page.goto("/products/warehouse-G107404", { waitUntil: "commit" });
      const launcher = page.locator('.product-spec-groups button[aria-haspopup="dialog"]').first();
      await expect(launcher).toBeVisible();
      await expect(launcher).toBeDisabled();
      await expect(page.locator("dialog[open]")).toHaveCount(0);
      release();
      await expect(launcher).toBeEnabled();
      await launcher.click();
      const dialog = page.locator("dialog[open]");
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole("cell")).toContainText("Label20x60-2000");
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(launcher).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(dialog).toBeVisible();
      await dialog.getByRole("button", { name: "ปิด", exact: true }).click();
      await expect(dialog).toHaveCount(0);
      await expect(launcher).toBeFocused();
      expect(errors).toEqual([]);
    } finally {
      release();
    }
  });
}
