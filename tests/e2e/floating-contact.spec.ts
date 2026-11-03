import { expect, test } from "@playwright/test";

test("the global child mascot preserves working phone, LINE, Messenger and shop destinations", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const widget = page.locator("[data-shop-mascot]");
  const launcher = page.locator("[data-mascot-launcher]");
  await expect(widget).toHaveCount(1);
  await expect(page.locator(".contact-launcher")).toHaveCount(0);
  await launcher.click();
  const panel = widget.getByRole("region", { name: "ช่องทางติดต่อ" });
  await expect(panel.getByRole("link")).toHaveCount(4);
  await expect(panel.getByRole("link", { name: /^โทรศัพท์/ })).toHaveAttribute(
    "href",
    "tel:034276999",
  );
  for (const [name, url] of [
    [/ผ่าน LINE/, "https://line.me/R/ti/p/@sunford"],
    [/แชทผ่าน Facebook/, "https://m.me/sunfordthai"],
    [
      /เยี่ยมชม Sunford Shop/,
      "https://sunfordshop.com/%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%81",
    ],
  ] as const) {
    await context.route(url, (route) =>
      route.fulfill({ contentType: "text/html", body: "Destination verified" }),
    );
    const popup = page.waitForEvent("popup");
    await panel.getByRole("link", { name }).click();
    const tab = await popup;
    await expect(tab).toHaveURL(url);
    await tab.close();
  }
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
});

test("contact menu stays open with readable labels and closes on an outside click", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/rls1100");
  const widget = page.locator("[data-shop-mascot]");
  await page.locator("[data-mascot-launcher]").click();
  const panel = widget.getByRole("region", { name: "ช่องทางติดต่อ" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("heading", { name: "ให้เราช่วยดูแลคุณ" })).toHaveCount(0);
  await expect(panel.getByText("แนะนำ", { exact: true })).toBeVisible();
  await expect(panel.getByRole("link")).toHaveCount(4);
  const bounds = (await panel.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.y).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  expect(bounds.width).toBeLessThanOrEqual(248);
  for (const row of await panel.getByRole("link").all()) {
    expect((await row.boundingBox())!.height).toBeLessThanOrEqual(60);
  }
  await page.getByRole("heading", { name: "RLS1100", exact: true }).click();
  await expect(panel).toBeHidden();
  await expect(widget).toBeVisible();
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 640, height: 360 },
  ]) {
    await page.setViewportSize(viewport);
    await page.locator("[data-mascot-launcher]").click();
    await expect(panel).toBeVisible();
    await expect
      .poll(async () => {
        const bounds = (await panel.boundingBox())!;
        const contentWidth = await page.evaluate(() => document.documentElement.clientWidth);
        return (
          bounds.x >= 0 &&
          bounds.y >= 0 &&
          bounds.x + bounds.width <= contentWidth &&
          bounds.y + bounds.height <= viewport.height
        );
      })
      .toBe(true);
    await page.locator("[data-mascot-launcher]").click();
    await expect(panel).toBeHidden();
  }
});

test("mouse can cross the pet-panel gap and the menu closes immediately outside their region", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/service");
  const mascot = page.locator("[data-shop-mascot]");
  const launcher = page.locator("[data-mascot-launcher]");
  const panel = mascot.locator("[data-mascot-contact]");
  await launcher.click();
  await expect(panel).toBeVisible();
  const pet = (await launcher.boundingBox())!;
  const menu = (await panel.boundingBox())!;
  const crossingX = Math.max(pet.x, menu.x) + Math.min(pet.width, menu.width) / 2;
  const gapY =
    menu.y < pet.y ? (menu.y + menu.height + pet.y) / 2 : (pet.y + pet.height + menu.y) / 2;
  await page.mouse.move(crossingX, gapY);
  await expect(panel).toBeVisible();
  await panel.getByRole("link", { name: /ผ่าน LINE/ }).hover();
  await expect(panel).toBeVisible();
  await page.mouse.move(Math.max(0, Math.min(pet.x, menu.x) - 30), pet.y);
  await expect(panel).toBeHidden();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  await launcher.focus();
  await launcher.press("Enter");
  await expect(panel).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
});

test.describe("touch contact menu", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("lifting a finger keeps contact links open until dismissed", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/service");
    const launcher = page.locator("[data-mascot-launcher]");
    await launcher.tap();
    const panel = page.locator("[data-mascot-contact]");
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("link")).toHaveCount(4);
    await launcher.tap();
    await expect(panel).toBeHidden();
  });
});

test("the invitation opens the compact contact menu without navigating to the shop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/service");
  const invitation = page.locator("[data-mascot-invitation]");
  await expect(invitation).toHaveJSProperty("tagName", "BUTTON");
  await expect(invitation).not.toHaveAttribute("href");
  await invitation.evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.pause();
    animation.currentTime = 15500;
  });
  await invitation.click();
  const panel = page.locator("[data-mascot-contact]");
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link")).toHaveCount(4);
  await expect(panel.getByRole("heading")).toHaveCount(0);
  await expect(panel.getByRole("link", { name: "เยี่ยมชม Sunford Shop" })).toHaveAttribute(
    "href",
    /sunfordshop\.com/,
  );
  await expect(page).toHaveURL(/\/service$/);
  expect(page.context().pages()).toHaveLength(1);
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    if (!(await panel.isVisible())) await page.locator("[data-mascot-launcher]").click();
    await page.screenshot({
      path: test.info().outputPath(`compact-contact-${viewport.width}.png`),
    });
  }
});
