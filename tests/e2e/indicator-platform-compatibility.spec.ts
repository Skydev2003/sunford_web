import { test, expect } from "@playwright/test";

const path = "/guides/indicator-platform-compatibility";
test.use({ reducedMotion: "reduce" });
for (const width of [390, 1440]) {
  test(`platform-first matching and accessory gating at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const summary = page.locator("main aside");
    const tab = (name: string) => summary.getByRole("button", { name, exact: true });
    const select = (code: string) =>
      page.getByRole("button", { name: `เลือก ${code}`, exact: true });
    await tab("แท่นชั่ง").click();
    await expect(page.locator("main article")).toHaveCount(26);
    await expect(tab("อุปกรณ์เสริม")).toBeDisabled();
    await page.getByRole("combobox").selectOption("พื้นที่เปียกชื้น");
    await select("TSS-60-WP31E").click();
    await expect(page.locator("main article h3")).toHaveText(["Indicator-WP31E"]);
    await expect(tab("อุปกรณ์เสริม")).toBeDisabled();
    await select("Indicator-WP31E").click();
    await select("LoadcellCable").click();
    await expect(summary).toContainText("LoadcellCable");
    await tab("แท่นชั่ง").click();
    await select("TMS-60-AW31").click();
    await expect(page.locator("main article h3")).toHaveText(["Indicator-AW31"]);
    await expect(summary).not.toContainText("WP31E");
    await expect(summary).not.toContainText("LoadcellCable");
    await expect(tab("อุปกรณ์เสริม")).toBeDisabled();
    await select("Indicator-AW31").click();
    await select("LED-R1").click();
    await summary.getByRole("button", { name: "นำ TMS-60-AW31 ออกจากชุด" }).click();
    await expect(summary).toContainText("Indicator-AW31");
    await expect(summary).not.toContainText("LED-R1");
    await expect(page.locator("main article")).toHaveCount(7);
    await expect(tab("อุปกรณ์เสริม")).toBeDisabled();
  });
}
for (const width of [390, 1440]) {
  test(`open platform and accessory photos and names without changing the set at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const select = (code: string) =>
      page.getByRole("button", { name: `เลือก ${code}`, exact: true });
    await select("Indicator-AW31").click();
    for (const [code, expected] of [
      ["TMS-60-AW31", "TMS-60-AW31"],
      ["NY30M12", "ล้อ NY30M12"],
    ]) {
      const card = page.locator("main article").filter({ has: select(code) });
      const link = card.getByRole("link", {
        name: `ดูรายละเอียด ${code} (เปิดแท็บใหม่)`,
        exact: true,
      });
      for (const surface of ["img", "h3"]) {
        const target = card.locator(surface);
        await target.scrollIntoViewIfNeeded();
        const box = (await target.boundingBox())!;
        const popup = page.waitForEvent("popup");
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        const product = await popup;
        await expect(product.getByRole("heading", { level: 1 })).toHaveText(expected);
        expect(new URL(product.url()).pathname).toBe(await link.getAttribute("href"));
        await product.close();
      }
      await expect(page.locator("main aside")).not.toContainText(code);
      const missing = code === "TMS-60-AW31" ? "TIS-150-AW31" : "LoadcellCable";
      const fallback = page
        .locator("main article")
        .filter({ has: select(missing) })
        .getByRole("link", { name: `ดูรายละเอียด ${missing}`, exact: true });
      await fallback.click();
      await expect(page.locator(":target")).toHaveText(missing);
      await expect(page.locator(":target")).toBeInViewport();
      await select(code).click();
      await expect(page.locator("main aside")).toContainText(code);
    }
  });
}
test("each head opens its own published product or its exact model card", async ({ page }) => {
  for (const code of [
    "Indicator-AW31",
    "Indicator-SW31",
    "Indicator-SW31F",
    "Indicator-WP31E",
    "Indicator-AC31P",
    "Indicator-WP31C",
    "Indicator-WP31EUSB",
    "JC62Z",
    "JE62ZR",
  ]) {
    await page.goto(path);
    const card = page
      .locator("main article")
      .filter({ has: page.locator("h3").getByText(code, { exact: true }) });
    const link = card.getByRole("link");
    if (["Indicator-WP31EUSB", "JC62Z", "JE62ZR"].includes(code)) {
      await link.click();
      await expect(page.locator(":target")).toBeInViewport();
      await expect(page.locator(":target h3")).toHaveText(code);
    } else {
      const popup = page.waitForEvent("popup");
      await link.click();
      const product = await popup;
      await expect(product.getByRole("heading", { level: 1 })).toHaveText(
        code.replace("Indicator-", "Indicator "),
      );
      await product.close();
    }
  }
});
test("a platform opens the selected head product", async ({ page }) => {
  await page.goto(path);
  await page.getByRole("combobox", { name: "ลักษณะงาน" }).selectOption("พื้นที่เปียกชื้น");
  await page.getByRole("button", { name: "เลือก Indicator-WP31E", exact: true }).click();
  const popup = page.waitForEvent("popup");
  await page
    .getByRole("link", { name: "ดูรายละเอียด Indicator-WP31E (เปิดแท็บใหม่)", exact: true })
    .first()
    .click();
  const product = await popup;
  await expect(product.getByRole("heading", { level: 1 })).toHaveText("Indicator WP31E");
  await product.close();
  await expect(page.locator("main aside")).toContainText("Indicator-WP31E");
});
for (const width of [390, 1440])
  test(`select head, compatible platform, accessories and revise the set at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const summary = page.locator("main aside");
    const steps = summary.getByRole("button");
    await expect(page.locator("main article")).toHaveCount(9);
    await expect(page.getByText("ดูรายละเอียดรุ่น", { exact: false })).toHaveCount(0);
    await expect(page.locator("main article button:enabled")).toHaveCount(6);
    for (const code of ["AC31P", "WP31C", "WP31EUSB"]) {
      const button = page.getByRole("button", {
        name: `Indicator-${code} รอยืนยันรุ่นแท่นชั่ง`,
        exact: true,
      });
      await expect(button).toBeVisible();
      await expect(button).toBeDisabled();
    }
    await expect(steps.nth(1)).toBeEnabled();
    await expect(steps.nth(2)).toBeDisabled();
    await page.getByRole("combobox", { name: "ลักษณะงาน" }).selectOption("พื้นที่เปียกชื้น");
    await page.getByRole("button", { name: "เลือก Indicator-WP31E", exact: true }).click();
    await expect(page.locator("main article")).toHaveCount(4);
    await page.screenshot({ path: test.info().outputPath(`compatible-platforms-${width}.png`) });
    await expect(steps.nth(2)).toBeDisabled();
    await page.getByRole("searchbox").fill("TSS-60");
    await page.getByRole("button", { name: "เลือก TSS-60-WP31E", exact: true }).click();
    await page.getByRole("button", { name: "เลือก LoadcellCable", exact: true }).click();
    await steps.nth(1).click();
    await page.getByRole("searchbox").fill("TSS-150");
    await page.getByRole("button", { name: "เลือก TSS-150-WP31E", exact: true }).click();
    await expect(summary).not.toContainText("LoadcellCable");
    await expect(summary).not.toContainText("TSS-60-WP31E");
    await expect(summary).toContainText("TSS-150-WP31E");
    await page.getByRole("button", { name: "เลือก LoadcellCable", exact: true }).click();
    await summary.getByRole("button", { name: "นำ LoadcellCable ออกจากชุด" }).click();
    await expect(summary).not.toContainText("LoadcellCable");
    await expect(summary).toContainText("TSS-150-WP31E");
    await steps.nth(0).click();
    await page.getByRole("searchbox").fill("WP31EUSB");
    await expect(page.locator("main article")).toHaveCount(1);
    await expect(page.locator("main article button")).toBeDisabled();
    await expect(summary).toContainText("TSS-150-WP31E");
    await page.getByRole("searchbox").fill("");
    await page.getByRole("combobox", { name: "ลักษณะงาน" }).selectOption("");
    await page.getByRole("button", { name: "เลือก Indicator-AW31", exact: true }).click();
    await expect(summary).not.toContainText("TSS-150-WP31E");
    await expect(page.locator("main article")).toHaveCount(7);
    await expect(steps.nth(2)).toBeDisabled();
  });
for (const [width, entry] of [
  [390, "/"],
  [1440, "/contact-us"],
] as const) {
  test(`Services links to both hubs at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [label, href] of [
      ["โซลูชันตามธุรกิจ", "/solutions"],
      ["ซอฟต์แวร์", "/applications-and-softwares"],
    ]) {
      await page.goto(entry);
      if (entry === "/") {
        await expect(page.locator("[data-brand-opening]")).toHaveAttribute(
          "data-phase",
          "complete",
        );
        await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
        await page.locator("#mobile-navigation summary").filter({ hasText: "บริการ" }).click();
      } else
        await page
          .locator("[data-products-header]:visible")
          .getByRole("button", { name: "บริการ", exact: true })
          .click();
      const menu = page.locator("#mobile-navigation:visible, #products-navigation-panel:visible");
      await menu.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(href + "$"));
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });
}
for (const width of [320, 390, 600, 768, 834, 1024, 1440, 1920]) {
  test(`guide discloses models on demand at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("จัดสเปคเครื่องชั่ง");
    await expect(main.locator(":scope > header")).toHaveCount(0);
    const nav = await page.locator("[data-products-header]:visible").boundingBox();
    const builder = await main.getByRole("region", { name: "เลือกอุปกรณ์จัดชุด" }).boundingBox();
    expect(builder!.y - nav!.y - nav!.height).toBeCloseTo(24, 0);
    await expect(main.locator("details")).toHaveCount(5);
    await expect(main.locator("details[open]")).toHaveCount(0);
    if ([390, 834, 1440].includes(width))
      await page.screenshot({ path: test.info().outputPath(`guide-${width}.png`) });
    for (const summary of await main.locator("summary").all()) {
      await summary.focus();
      await summary.press("Enter");
    }
    await expect(main.locator("details[open]")).toHaveCount(5);
    await expect(main.locator("details").getByText(/TIS-150-AW31/)).toBeVisible();
    await expect(main.getByText("LoadcellCable")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
for (const route of ["/", "/contact-us"]) {
  test(`mobile main menu opens the guide directly from ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(
      route === "/" ? ".site-header:visible" : "[data-products-header]:visible",
    );
    await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await nav.getByRole("link", { name: "จัดสเปค", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  });
  test(`open guide directly from ${route}`, async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 900 });
    await page.goto(route);
    if (route === "/")
      await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
    const nav = page.locator(
      route === "/" ? ".site-header:visible" : "[data-products-header]:visible",
    );
    await nav.getByRole("link", { name: "จัดสเปค", exact: true }).click();
    await expect(page).toHaveURL(new RegExp(path + "$"));
  });
}
