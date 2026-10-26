import { expect, test } from "@playwright/test";

test("homepage contact banner moves into a fixed contact launcher with real destinations", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(page.locator(".contact-banner")).toHaveCount(0);
  const widget = page.locator(".floating-contact");
  const launcher = widget.getByRole("button", { name: "คุยกับผู้เชี่ยวชาญ", exact: true });
  await expect(launcher).toBeVisible();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
  await expect(widget.locator(".contact-launcher-label")).toHaveCount(0);
  await expect(widget.getByRole("link")).toHaveCount(0);
  const initial = await launcher.boundingBox();
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  const after = await launcher.boundingBox();
  expect(Math.abs(after!.y - initial!.y)).toBeLessThanOrEqual(8);
  expect(await widget.evaluate((element) => getComputedStyle(element).position)).toBe("fixed");
  await launcher.click();
  const panel = widget.getByRole("region", { name: "ช่องทางติดต่อ" });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole("link")).toHaveCount(3);
  await expect(panel.getByRole("link").first()).toHaveAccessibleName(/โทรศัพท์/);
  await expect(panel.getByRole("link").nth(1)).toHaveAccessibleName(/LINE/);
  await expect(panel.getByRole("link").last()).toHaveAccessibleName(/Facebook/);
  const line = panel.getByRole("link", { name: /คุยกับผู้เชี่ยวชาญ/ });
  await expect(line).toHaveAttribute("href", "https://line.me/R/ti/p/@sunford");
  await expect(panel.getByRole("link", { name: /โทรศัพท์/ })).toHaveAttribute(
    "href",
    "tel:034276999",
  );
  const facebook = panel.getByRole("link", { name: /แชทผ่าน Facebook/ });
  await expect(facebook).toHaveAttribute("href", "https://m.me/sunfordthai");
  const logo = panel.getByRole("img", { name: "LINE", exact: true });
  await expect(logo).toBeVisible();
  await expect
    .poll(() => logo.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await page.screenshot({
    path: test.info().outputPath("contact-desktop.png"),
    animations: "disabled",
  });
  // Intercept the destination to exercise new-tab clicks without contacting anyone.
  await context.route("https://line.me/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "LINE destination verified" }),
  );
  const linePopup = page.waitForEvent("popup");
  await line.click();
  const lineTab = await linePopup;
  await expect(lineTab).toHaveURL("https://line.me/R/ti/p/@sunford");
  await lineTab.close();
  await context.route("https://m.me/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Messenger destination verified" }),
  );
  const facebookPopup = page.waitForEvent("popup");
  await facebook.click();
  const facebookTab = await facebookPopup;
  await expect(facebookTab).toHaveURL("https://m.me/sunfordthai");
  await facebookTab.close();
  await page.keyboard.press("Escape");
  await expect(panel).toHaveCount(0);
  await expect(launcher).toBeFocused();
  await expect(launcher).toHaveAttribute("aria-expanded", "false");
});

test("contact launcher stays inside the mobile viewport on product pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products/rls1100");
  const widget = page.locator(".floating-contact");
  await expect(widget).toBeVisible();
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await widget.getByRole("button", { name: "คุยกับผู้เชี่ยวชาญ", exact: true }).click();
  const panel = widget.getByRole("region", { name: "ช่องทางติดต่อ" });
  await expect(panel).toBeVisible();
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.y).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("contact-mobile.png"),
    animations: "disabled",
  });
  await page.getByRole("heading", { name: "RLS1100", exact: true }).click();
  await expect(panel).toHaveCount(0);
  await expect(page.locator(".contact-banner")).toBeVisible();
});

test("public contact widget is absent from the admin login", async ({ page }) => {
  await page.goto("/admin/login");
  await expect(page.getByRole("heading", { name: "เข้าสู่พื้นที่แอดมิน" })).toBeVisible();
  await expect(page.locator(".floating-contact")).toHaveCount(0);
});

test("labels slide away after five seconds while the contact buttons stay usable", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const widget = page.locator(".floating-contact");
  await widget.getByRole("button", { name: "คุยกับผู้เชี่ยวชาญ", exact: true }).click();
  const started = Date.now();
  const labels = widget.locator(".contact-action-label");
  await expect(labels.first()).toBeVisible();
  await expect(labels.last()).toBeVisible();
  await expect(labels.first()).toBeHidden({ timeout: 7500 });
  expect(Date.now() - started).toBeGreaterThanOrEqual(4500);
  await expect(labels.last()).toBeHidden();
  const panel = widget.getByRole("region", { name: "ช่องทางติดต่อ" });
  await expect(panel.getByRole("link")).toHaveCount(3);
  await expect(
    widget.getByRole("button", { name: "ปิดช่องทางติดต่อ", exact: true }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.screenshot({
    path: test.info().outputPath("contact-icons-after-five-seconds.png"),
    animations: "disabled",
  });
  await context.route("https://line.me/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "LINE destination verified after labels disappeared",
    }),
  );
  const popup = page.waitForEvent("popup");
  await panel.getByRole("link", { name: /คุยกับผู้เชี่ยวชาญ/ }).click();
  const tab = await popup;
  await expect(tab).toHaveURL("https://line.me/R/ti/p/@sunford");
  await tab.close();
  await widget.getByRole("button", { name: "ปิดช่องทางติดต่อ", exact: true }).click();
  await widget.getByRole("button", { name: "คุยกับผู้เชี่ยวชาญ", exact: true }).click();
  await expect(labels.first()).toBeVisible();
});

test("pointer and scrolling give the contact launcher a small drift without evading clicks", async ({
  page,
}) => {
  await page.goto("/");
  const widget = page.locator(".floating-contact");
  const initial = (await widget.boundingBox())!;
  await page.mouse.move(35, 180);
  await expect
    .poll(async () => Math.abs((await widget.boundingBox())!.x - initial.x))
    .toBeGreaterThan(0.2);
  const samples = page.evaluate(async () => {
    const widget = document.querySelector(".floating-contact")!;
    const positions: number[] = [];
    for (let frame = 0; frame < 40; frame++) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      positions.push(widget.getBoundingClientRect().top);
    }
    return positions;
  });
  await page.mouse.wheel(0, 500);
  const positions = await samples;
  expect(Math.max(...positions) - Math.min(...positions)).toBeGreaterThan(0.2);
  const moved = (await widget.boundingBox())!;
  expect(Math.abs(moved.x - initial.x)).toBeLessThanOrEqual(4);
  expect(Math.abs(moved.y - initial.y)).toBeLessThanOrEqual(7);
  await widget.getByRole("button", { name: "คุยกับผู้เชี่ยวชาญ", exact: true }).click();
  await expect(widget.getByRole("region", { name: "ช่องทางติดต่อ" })).toBeVisible();
});

test("reduced motion keeps contact buttons still and fully functional", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const widget = page.locator(".floating-contact");
  const initial = (await widget.boundingBox())!;
  await page.mouse.move(35, 180);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  const moved = (await widget.boundingBox())!;
  expect(Math.abs(moved.x - initial.x)).toBeLessThan(0.1);
  expect(Math.abs(moved.y - initial.y)).toBeLessThan(0.1);
  await widget.getByRole("button", { name: "คุยกับผู้เชี่ยวชาญ", exact: true }).click();
  await expect(widget.getByRole("region", { name: "ช่องทางติดต่อ" }).getByRole("link")).toHaveCount(
    3,
  );
});
