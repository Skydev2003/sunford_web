import { expect, test } from "@playwright/test";
import type { ModelViewerElement } from "@google/model-viewer";

async function ready(page: import("@playwright/test").Page) {
  await page.goto("/products/acs30-jc21");
  await expect(page.locator(".product-model")).toHaveAttribute("data-status", "ready", {
    timeout: 30000,
  });
  await page.locator("model-viewer").scrollIntoViewIfNeeded();
  return page.locator("model-viewer");
}

test("JC21 model rotates, zooms and resets while the original gallery remains usable", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1050 });
  const viewer = await ready(page);
  const orbit = () =>
    viewer.evaluate((element: ModelViewerElement) => ({
      ...element.getCameraOrbit(),
      fov: element.getFieldOfView(),
    }));
  const initial = await orbit();
  const box = (await viewer.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, box.y + box.height * 0.5, { steps: 15 });
  await page.mouse.up();
  await expect
    .poll(async () => Math.abs((await orbit()).theta - initial.theta))
    .toBeGreaterThan(0.2);
  const beforeZoom = await orbit();
  await page.getByRole("button", { name: "ซูมเข้า", exact: true }).click();
  await expect
    .poll(async () => {
      const current = await orbit();
      return current.radius < beforeZoom.radius || current.fov < beforeZoom.fov;
    })
    .toBe(true);
  await page.getByRole("button", { name: "กลับมุมเริ่มต้น", exact: true }).click();
  await expect.poll(async () => Math.abs((await orbit()).theta - initial.theta)).toBeLessThan(0.02);
  await expect
    .poll(async () => Math.abs((await orbit()).radius - initial.radius))
    .toBeLessThan(0.005);
  await page.screenshot({ path: "C:/tmp/sunford-jc21-model-desktop.png", animations: "disabled" });
  await page.getByRole("button", { name: "ดูรูป ACS-30-JC21 มุมที่ 2", exact: true }).click();
  await expect(page.locator("model-viewer")).toHaveCount(0);
  await expect(page.locator(".detail-image img")).toBeVisible();
  await page.getByRole("button", { name: "ดูโมเดล 3 มิติ ACS-30-JC21", exact: true }).click();
  await expect(page.locator(".product-model")).toHaveAttribute("data-status", "ready");
  await expect(page.locator('video[src*="sunford-homepage"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test.describe("mobile model interaction", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  test("a finger drag rotates the model without widening the page", async ({ page, context }) => {
    const viewer = await ready(page);
    const angle = () =>
      viewer.evaluate((element: ModelViewerElement) => element.getCameraOrbit().theta);
    const initial = await angle();
    const box = (await viewer.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const x = box.x + box.width * 0.35;
    const y = box.y + box.height * 0.45;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    for (let step = 1; step <= 10; step++) {
      await cdp.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: x + step * 10, y }],
      });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(async () => Math.abs((await angle()) - initial)).toBeGreaterThan(0.2);
    await page.getByRole("button", { name: "กลับมุมเริ่มต้น", exact: true }).click();
    await expect.poll(async () => Math.abs((await angle()) - initial)).toBeLessThan(0.02);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await page.screenshot({ path: "C:/tmp/sunford-jc21-model-mobile.png", animations: "disabled" });
    await cdp.detach();
  });
});

test("a failed model download keeps the photos accessible and other products use their original gallery", async ({
  page,
}) => {
  await page.route("**/models/acs30-jc21.glb", (route) => route.abort());
  await page.goto("/products/acs30-jc21");
  await expect(page.locator(".product-model")).toHaveAttribute("data-status", "error", {
    timeout: 30000,
  });
  await expect(page.getByText("ไม่สามารถแสดงโมเดลได้ กรุณาเลือกดูรูปสินค้าด้านล่าง")).toBeVisible();
  await page.getByRole("button", { name: "ดูรูป ACS-30-JC21 มุมที่ 1", exact: true }).click();
  await expect(page.locator(".detail-image img")).toBeVisible();
  await page.goto("/products/wps10ks");
  await expect(page.locator(".product-model")).toHaveCount(0);
  await expect(page.locator(".detail-image img")).toBeVisible();
});
