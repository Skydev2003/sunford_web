import { expect, test, type Page } from "@playwright/test";

// Historical Hero 3D interaction contract, explicitly replaced by the image studio.
test.skip(
  true,
  "Retired homepage 3D/bubbles/ribbon; replacement coverage: hero-scene.spec.ts and hero-header-scroll.spec.ts. Product-page 3D remains covered by product-model.spec.ts.",
);

test.use({ launchOptions: { args: ["--enable-unsafe-swiftshader"] } });

async function prepare(page: Page) {
  await page.goto("/");
  await expect(page.locator("[data-hero-ribbon]")).toHaveAttribute("data-running", "true");
  await page.getByRole("button", { name: "แสดง ACS-30-JC21", exact: true }).click();
  await page.keyboard.press("Tab");
  const card = page.locator('[data-ribbon-card="1"]');
  await card.focus();
  await card.evaluate((element) =>
    element.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  const box = (await card.boundingBox())!;
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

async function phase(page: Page) {
  return page
    .locator("[data-ribbon-card]")
    .first()
    .evaluate((card) => {
      const animation = card.getAnimations()[0];
      return Number(animation.currentTime) / Number(animation.effect!.getTiming().duration);
    });
}

test("mouse drag rotates both ways, crosses the seam and preserves explicit pause and selection", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await prepare(page);
  await page.getByRole("button", { name: "หยุดการเคลื่อนไหวทั้งหมด", exact: true }).click();
  await page.keyboard.press("Tab");
  await page.locator('[data-ribbon-card="1"]').focus();
  await page.locator("[data-hero-ribbon]").evaluate((root) => {
    root.querySelectorAll("[data-ribbon-card]").forEach((card) =>
      card.getAnimations().forEach((a) => {
        a.currentTime = 0;
      }),
    );
  });
  // The first card is at the centre after putting every animation at the seam.
  const first = (await page.locator('[data-ribbon-card="0"]').boundingBox())!;
  await page.mouse.move(first.x + first.width / 2, first.y + first.height / 2);
  await page.mouse.down();
  const origin = { x: first.x + first.width / 2, y: first.y + first.height / 2 };
  await page.mouse.move(origin.x + 120, origin.y, { steps: 8 });
  const ribbon = page.locator("[data-hero-ribbon]");
  await expect(ribbon).toHaveAttribute("data-rotating", "true");
  await expect(ribbon).toHaveCSS("cursor", "grabbing");
  await expect.poll(() => phase(page)).toBeGreaterThan(0.9);
  await expect(page.locator(".hero-showroom")).not.toHaveAttribute("data-product-drag", "true");
  await page.mouse.move(origin.x - 120, origin.y, { steps: 8 });
  await expect.poll(() => phase(page)).toBeLessThan(0.1);
  await page.mouse.up();
  const released = await phase(page);
  await expect(ribbon).not.toHaveAttribute("data-rotating", "true");
  await expect(ribbon).toHaveAttribute("data-running", "false");
  await page.waitForTimeout(150);
  expect(await phase(page)).toBe(released);
  await expect(page.locator(".hero-showroom")).toHaveAttribute(
    "data-active-product",
    "ACS-30-JC21",
  );
  await page.screenshot({ path: test.info().outputPath("ribbon-drag-desktop.png") });
});

test("release and Escape resume automatic motion without choosing the dragged card", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const point = await prepare(page);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x - 100, point.y, { steps: 8 });
  const ribbon = page.locator("[data-hero-ribbon]");
  await expect(ribbon).toHaveAttribute("data-running", "false");
  const held = await phase(page);
  await page.waitForTimeout(100);
  expect(await phase(page)).toBe(held);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(ribbon).toHaveAttribute("data-running", "true");
  await expect.poll(() => phase(page)).not.toBe(held);
  await expect(page.locator(".hero-showroom")).toHaveAttribute(
    "data-active-product",
    "ACS-30-JC21",
  );
  await page.getByRole("button", { name: "เลือกชม FEH5KS", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".hero-showroom")).toHaveAttribute("data-active-product", "FEH5KS");
});

test("resize and live reduced motion cancel rotation and leave accessible static cards", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const point = await prepare(page);
  await page.mouse.move(point.x, point.y);
  await page.mouse.down();
  await page.mouse.move(point.x - 80, point.y, { steps: 6 });
  const ribbon = page.locator("[data-hero-ribbon]");
  await expect(ribbon).toHaveAttribute("data-rotating", "true");
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(ribbon).not.toHaveAttribute("data-rotating", "true");
  await page.mouse.up();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(ribbon).toHaveAttribute("data-static", "true");
  await expect(ribbon).toHaveAttribute("data-running", "false");
  const card = page.getByRole("button", { name: "เลือกชม WPS10KS", exact: true });
  await card.focus();
  await card.press("Enter");
  await expect(page.locator(".hero-showroom")).toHaveAttribute("data-active-product", "WPS10KS");
  await expect(card).toHaveAttribute("aria-pressed", "true");
  expect(
    await page
      .locator("[data-ribbon-card]")
      .first()
      .evaluate((e) => e.getAnimations().length),
  ).toBe(0);
});

test.describe("touch rotation", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  for (const finish of ["touchEnd", "touchCancel"] as const) {
    test(`horizontal swipe rotates without scrolling or model drop and handles ${finish}`, async ({
      page,
    }) => {
      const point = await prepare(page);
      const before = await phase(page);
      const scroll = await page.evaluate(() => scrollY);
      const client = await page.context().newCDPSession(page);
      await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [point] });
      for (let step = 1; step <= 6; step++) {
        await client.send("Input.dispatchTouchEvent", {
          type: "touchMove",
          touchPoints: [{ x: point.x - step * 15, y: point.y }],
        });
      }
      const ribbon = page.locator("[data-hero-ribbon]");
      await expect(ribbon).toHaveAttribute("data-rotating", "true");
      await expect.poll(() => phase(page)).not.toBe(before);
      await expect(page.locator(".hero-showroom")).not.toHaveAttribute("data-product-drag", "true");
      await client.send("Input.dispatchTouchEvent", { type: finish, touchPoints: [] });
      await expect(ribbon).not.toHaveAttribute("data-rotating", "true");
      await expect(ribbon).toHaveAttribute("data-running", "true");
      await expect(page.locator(".hero-showroom")).toHaveAttribute(
        "data-active-product",
        "ACS-30-JC21",
      );
      expect(await page.evaluate(() => scrollY)).toBe(scroll);
      await page.screenshot({ path: test.info().outputPath(`ribbon-${finish}-mobile.png`) });
      await client.detach();
    });
  }
});
