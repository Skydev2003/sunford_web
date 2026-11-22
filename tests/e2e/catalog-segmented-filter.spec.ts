import { expect, test, type Locator } from "@playwright/test";

const scales = "/products/category/scales";

async function expectIndicatorAtSelection(tray: Locator) {
  const indicator = tray.locator("[data-segmented-indicator]");
  await expect(indicator).toBeVisible();
  await expect
    .poll(() =>
      tray.evaluate((element) => {
        const button = element.querySelector('button[aria-pressed="true"]');
        const pill = element.querySelector("[data-segmented-indicator]");
        if (!button || !pill) return false;
        const active = button.getBoundingClientRect();
        const moving = pill.getBoundingClientRect();
        return Math.abs(active.left - moving.left) < 1 && Math.abs(active.width - moving.width) < 1;
      }),
    )
    .toBe(true);
}

test.describe("server-rendered segmented filter", () => {
  test.use({ javaScriptEnabled: false });

  test("the selected control already has the dark pill and white text", async ({ page }) => {
    test.slow();
    await page.goto(scales);
    const tray = page.locator("[data-segmented-filter]").first();
    const selected = tray.locator('button[aria-pressed="true"]');
    await expect(selected).toHaveText("ทุกผลิตภัณฑ์");
    await expect(tray).toHaveCSS("background-color", "rgb(232, 232, 237)");
    await expect(selected).toHaveCSS("background-color", "rgb(29, 29, 31)");
    await expect(selected).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(tray.locator("[data-segmented-indicator]")).toHaveCSS("visibility", "hidden");
  });
});

test("lineup selection moves the dark pill, realigns on resize, and keeps keyboard and RTL behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(scales);
  const filters = page.getByRole("group", { name: "กรองผลิตภัณฑ์" });
  const tray = filters.locator("[data-segmented-filter]");
  const pill = tray.locator("[data-segmented-indicator]");
  const selected = tray.locator('button[aria-pressed="true"]');
  await expectIndicatorAtSelection(tray);
  await expect(pill).toHaveCSS("transition-duration", "0s");
  await expect(pill).toHaveCSS("background-color", "rgb(29, 29, 31)");
  await expect(pill).toHaveCSS("z-index", "0");
  await expect(selected).toHaveCSS("color", "rgb(255, 255, 255)");
  await expect(selected).toHaveCSS("z-index", "1");
  await expect(tray).toHaveCSS("background-color", "rgb(232, 232, 237)");
  const kitchen = filters.getByRole("button", { name: "ครัวเรือน" });
  const industrial = filters.getByRole("button", { name: "การผลิต" });
  await industrial.evaluate((button) => {
    const indicator = button.parentElement?.querySelector("[data-segmented-indicator]");
    if (!indicator || !(button instanceof HTMLButtonElement)) throw new Error("Missing filter UI");
    indicator.addEventListener("transitionstart", function retarget(event) {
      if (!(event instanceof TransitionEvent) || event.propertyName !== "transform") return;
      indicator.removeEventListener("transitionstart", retarget);
      button.focus();
      button.click();
    });
  });
  await kitchen.press("Enter");
  await expect(industrial).toHaveAttribute("aria-pressed", "true");
  await expect(pill).toHaveCSS("transition-duration", "0.48s, 0.48s");
  await expect(pill).toHaveCSS(
    "transition-timing-function",
    "cubic-bezier(0.33, 0, 0.2, 1), cubic-bezier(0.33, 0, 0.2, 1)",
  );
  await expect(industrial).toHaveCSS("outline-color", "rgb(0, 113, 227)");
  await expectIndicatorAtSelection(tray);
  await industrial.evaluate((button) => ((button as HTMLElement).style.fontSize = "21px"));
  await expectIndicatorAtSelection(tray);
  await expect(pill).toHaveCSS("transition-duration", "0s");

  await page.setViewportSize({ width: 390, height: 844 });
  await expectIndicatorAtSelection(tray);
  await expect(pill).toHaveCSS("transition-duration", "0s");
  await page.evaluate(() => (document.documentElement.dir = "rtl"));
  await kitchen.press("Enter");
  await expect(kitchen).toHaveAttribute("aria-pressed", "true");
  await expectIndicatorAtSelection(tray);
  const application = filters.getByRole("link", { name: "เลือกตามการใช้งาน" });
  await application.focus();
  await expect(application).toBeInViewport({ ratio: 1 });
  await expect(application).toHaveAttribute("href", `${scales}/applications`);
  await expect(application).not.toHaveAttribute("aria-pressed", /.+/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
});

test("catalog finder uses the same indicator with reduced motion and preserves its filter URL", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/products?catalog=all");
  const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด" });
  await finder.getByRole("button", { name: "อินดิเคเตอร์แท่นชั่ง", exact: true }).click();
  const filters = finder.getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" });
  const tray = filters.locator("[data-segmented-filter]");
  await expectIndicatorAtSelection(tray);
  await filters.getByRole("button", { name: "LCD", exact: true }).click();
  await expect(page).toHaveURL(/subcategory=indicator-lcd/);
  await expectIndicatorAtSelection(tray);
  await expect(tray.locator("[data-segmented-indicator]")).toHaveCSS("transition-duration", "0s");
});
