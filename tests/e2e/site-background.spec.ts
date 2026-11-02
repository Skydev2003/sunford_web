import { expect, test } from "@playwright/test";

test("the branded particle background moves on every page without intercepting controls", async ({
  page,
}) => {
  for (const route of ["/products", "/contact-us", "/service", "/"]) {
    await page.goto(route);
    if (route === "/") await page.locator("#solutions").scrollIntoViewIfNeeded();
    const background = page.locator("[data-site-background]");
    await expect(background).toHaveAttribute("data-running", "true");
    await expect(background).toHaveAttribute("aria-hidden", "true");
    await expect(background).toHaveCSS("pointer-events", "none");
    const first = await background.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
    await expect
      .poll(() => background.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()))
      .not.toBe(first);
  }
  await page.goto("/products");
  await page.locator(".header-compare").click();
  await expect(
    page.getByRole("button", { name: "เพิ่มเพื่อเปรียบเทียบ ACS-30-JC21", exact: true }),
  ).toBeVisible();
});

test("the homepage background starts at the business solutions section", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const background = page.locator("[data-site-background]");
  await expect(background).toHaveAttribute("data-running", "false");
  expect(
    await background.evaluate((canvas: HTMLCanvasElement) => {
      const pixels = canvas.getContext("2d")!.getImageData(0, 0, canvas.width, canvas.height).data;
      return pixels.some((value, index) => index % 4 === 3 && value > 0);
    }),
  ).toBe(false);
  await page.locator("#solutions").scrollIntoViewIfNeeded();
  await expect(background).toHaveAttribute("data-running", "true");
  await expect(background).toHaveCSS("z-index", "-1");
});

test("opaque product and contact cards completely cover the background", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["/products", "/contact-us"]) {
    await page.goto(route);
    await page.getByRole("button", { name: "หยุดพื้นหลังเคลื่อนไหว", exact: true }).click();
    const card =
      route === "/products"
        ? page.locator("main article").first()
        : page.locator('main a[href="tel:034276999"]').first();
    await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts.ready);
    await card
      .locator("img")
      .evaluateAll((images) =>
        Promise.allSettled(images.map((img) => (img as HTMLImageElement).decode())),
      );
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const box = (await card.boundingBox())!;
    await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
    // Isolated contact text can change glyph antialiasing between compositor layers.
    // A flat card area tests translucency; the product comparison covers its full image.
    const clip =
      route === "/products"
        ? { x: box.x + 20, y: box.y + 20, width: box.width - 40, height: box.height - 40 }
        : { x: box.x + box.width - 42, y: box.y + box.height - 30, width: 10, height: 10 };
    await page.locator("[data-site-background]").evaluate((canvas: HTMLCanvasElement) => {
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "red";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
    const behind = await page.screenshot({ clip, animations: "disabled" });
    await page.locator("[data-site-background]").evaluate((canvas: HTMLCanvasElement) => {
      canvas.style.visibility = "hidden";
    });
    const hidden = await page.screenshot({ clip, animations: "disabled" });
    if (!behind.equals(hidden)) {
      await test
        .info()
        .attach(`background-behind-${route.slice(1)}`, { body: behind, contentType: "image/png" });
      await test
        .info()
        .attach(`background-hidden-${route.slice(1)}`, { body: hidden, contentType: "image/png" });
    }
    expect(behind.equals(hidden), route).toBe(true);
  }
});

test("the background supports pause, reduced motion, navigation and mobile screens", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const background = page.locator("[data-site-background]");
  await expect(background).toHaveAttribute("data-motion", "gentle");
  await expect(background).toHaveAttribute("data-running", "true");
  const pause = page.getByRole("button", { name: "หยุดพื้นหลังเคลื่อนไหว", exact: true });
  await pause.click();
  await expect(background).toHaveAttribute("data-running", "false");
  const still = await background.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL());
  await expect
    .poll(() => background.evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL()))
    .toBe(still);
  await page.locator(".site-header .brand").click();
  await expect(page).toHaveURL(/\/$/);
  await expect(background).toHaveAttribute("data-running", "false");
  await page.getByRole("button", { name: "เล่นพื้นหลังเคลื่อนไหว", exact: true }).click();
  await expect(background).toHaveAttribute("data-running", "true");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
