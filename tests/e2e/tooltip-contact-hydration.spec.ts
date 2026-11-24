import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`readability help keeps a stable hitbox and opens on its first hover at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto("/products/10639");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('[data-stagger-bounce-root="enabled"]')).toHaveCount(1);
    const help = page.getByRole("button", { name: "ค่าละเอียดคืออะไร", exact: true });
    const positions = help.evaluate(async (element) => {
      const rows: number[] = [];
      for (let frame = 0; frame < 75; frame++) {
        rows.push(element.getBoundingClientRect().y);
        await new Promise(requestAnimationFrame);
      }
      return rows;
    });
    await help.hover();
    await expect(page.getByRole("tooltip")).toContainText("หน่วยย่อยที่สุด");
    const y = await positions;
    expect(Math.max(...y) - Math.min(...y)).toBeLessThan(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toHaveCount(0);
    await help.focus();
    await expect(page.getByRole("tooltip")).toBeVisible();
  });
}

for (const width of [320, 390]) {
  test(`Contact mobile menu survives delayed child hydration without warnings at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    let held = 0;
    let bundledBootstrap = false;
    await page.route("**/_next/static/chunks/**", async (route) => {
      if (route.request().resourceType() !== "script") return route.continue();
      const response = await route.fetch();
      const body = await response.text();
      // Delay only the location-image leaf, keeping navigation's own script available.
      if (body.includes("65vw") && body.includes("280px") && !body.includes("data-products-nav")) {
        held++;
        bundledBootstrap ||= response.headers()["cache-control"]?.includes("immutable") ?? false;
        await gate;
      }
      await route.fulfill({ response, body });
    });
    try {
      await page.goto("/service?section=contact", { waitUntil: "commit" });
      const header = page.locator("[data-products-header]:visible");
      const open = header.getByRole("button", { name: "เปิดเมนู", exact: true });
      await expect(open).toBeVisible({ timeout: 15_000 });
      await expect.poll(() => held).toBeGreaterThan(0);
      // Production may make navigation depend on the delayed leaf's bundle.
      if (bundledBootstrap && (await open.isDisabled())) {
        await expect(open).toBeDisabled();
        release();
      }
      await expect(open).toBeEnabled({ timeout: 15_000 });
      await open.click();
      await expect(header).toHaveAttribute("aria-modal", "true");
      for (let tab = 0; tab < 3; tab++) {
        await page.keyboard.press("Tab");
        expect(await header.evaluate((element) => element.contains(document.activeElement))).toBe(
          true,
        );
      }
      release();
      await page.waitForLoadState("load");
      await expect(page.locator("main:visible")).toHaveAttribute("inert", "");
      await expect(page.locator("footer:visible")).toHaveAttribute("inert", "");
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      expect(errors).toEqual([]);
      await page.keyboard.press("Escape");
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      await expect(page.locator("footer:visible")).not.toHaveAttribute("inert", "");
      await expect(open).toBeFocused();
      await open.click();
      await header.getByRole("link", { name: "เครื่องชั่ง", exact: true }).click();
      await expect(page).toHaveURL(/\/products\/category\/scales$/);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      await page.goBack();
      await expect(page).toHaveURL(/\/service\?section=contact$/);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
      expect(errors).toEqual([]);
    } finally {
      release();
    }
  });
}
