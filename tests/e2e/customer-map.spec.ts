import { expect, test } from "@playwright/test";

async function openMap(page: import("@playwright/test").Page) {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "เปิดแผนที่ลูกค้า Sunford ทั่วประเทศ" });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "ครอบคลุมทั่วประเทศ" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".customer-map-area")).toHaveCount(77);
  return { dialog, trigger };
}

test("real workbook counts across province, district, and subdistrict with zoom, pan, and focus restoration", async ({
  page,
}) => {
  test.slow(); // Full desktop navigation, gestures, and focus restoration in one session.
  await page.setViewportSize({ width: 1440, height: 1000 });
  const { dialog, trigger } = await openMap(page);
  await expect(dialog.getByLabel("เลือกจังหวัด", { exact: true }).locator("option")).toHaveCount(
    78,
  );
  await expect(dialog.locator(".customer-map-summary")).toContainText("125,804 รายชื่อ");
  await dialog.getByLabel("ค้นหาจังหวัด", { exact: true }).fill("ระยอง");
  await dialog.getByRole("button", { name: "เลือกจังหวัดระยอง", exact: true }).click();
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(8);
  await expect(
    dialog.getByRole("button", { name: "เลือกอำเภอเมืองระยอง", exact: true }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "เลือกอำเภอบ้านค่าย", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary h3")).toHaveText("บ้านค่าย");
  await expect(dialog.locator(".customer-map-summary")).toContainText("122 รายชื่อ");
  await dialog.getByRole("button", { name: "เลือกตำบลบ้านค่าย", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary")).toContainText("21 รายชื่อ");
  await page.waitForTimeout(700);
  const geography = dialog.locator(".customer-map-geography");
  const initial = await geography.getAttribute("style");
  await dialog.getByRole("button", { name: "ซูมเข้า", exact: true }).click();
  await expect(geography).not.toHaveAttribute("style", initial!);
  await dialog.getByRole("button", { name: "จัดแผนที่ให้พอดี" }).click();
  await expect(geography).toHaveAttribute("style", initial!);
  await page.waitForTimeout(700); // Finish the fit animation before testing pointer drag.
  const svg = dialog.locator(".customer-map-svg");
  const box = (await svg.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 70, box.y + box.height / 2 + 30, { steps: 5 });
  await page.mouse.up();
  await expect(geography).not.toHaveAttribute("style", initial!);
  await expect(dialog.locator(".customer-map-summary h3")).toHaveText("บ้านค่าย");
  await dialog.getByRole("button", { name: "ประเทศไทย", exact: true }).click();
  await expect(dialog.locator(".customer-map-area")).toHaveCount(77);
  await dialog.getByLabel("เลือกจังหวัด", { exact: true }).selectOption("73");
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(7);
  await dialog.getByRole("button", { name: "เลือกอำเภอบางเลน", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary h3")).toHaveText("บางเลน");
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(15);
  await expect(dialog.locator(".customer-map-summary")).toContainText("285 รายชื่อ");
  await dialog.getByRole("button", { name: "เลือกตำบลบางระกำ", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary")).toContainText("40 รายชื่อ");
  await page.waitForTimeout(700);
  await page.screenshot({
    path: test.info().outputPath("customer-map-desktop.png"),
    animations: "disabled",
  });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
});

test("map loads lazily, supports geometry clicks and Bangkok khet on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const requests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/maps/thailand/")) requests.push(request.url());
  });
  await page.goto("/");
  await expect(page.getByRole("contentinfo")).toBeAttached();
  expect(requests).toHaveLength(0);
  await page.getByRole("button", { name: "เปิดแผนที่ลูกค้า Sunford ทั่วประเทศ" }).click();
  const dialog = page.getByRole("dialog", { name: "ครอบคลุมทั่วประเทศ" });
  await expect(dialog.locator(".customer-map-area")).toHaveCount(77);
  const beforePinch = await dialog.locator(".customer-map-geography").getAttribute("style");
  const mapBox = (await dialog.locator(".customer-map-svg").boundingBox())!;
  const x = mapBox.x + mapBox.width / 2,
    y = mapBox.y + mapBox.height / 2;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { id: 1, x: x - 30, y },
      { id: 2, x: x + 30, y },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { id: 1, x: x - 70, y },
      { id: 2, x: x + 70, y },
    ],
  });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(dialog.locator(".customer-map-geography")).not.toHaveAttribute(
    "style",
    beforePinch!,
  );
  await dialog.getByRole("button", { name: "จัดแผนที่ให้พอดี" }).click();
  await page.waitForTimeout(700);
  await dialog.locator('[data-area-id="21"]').click();
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(8);
  await dialog.getByLabel("เลือกจังหวัด", { exact: true }).selectOption("10");
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(50);
  await dialog.getByLabel("ค้นหาเขต", { exact: true }).fill("พระนคร");
  await dialog.getByRole("button", { name: "เลือกเขตพระนคร", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary h3")).toHaveText("พระนคร");
  await dialog.getByRole("button", { name: "เลือกแขวงพระบรมมหาราชวัง", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary")).toContainText("23 รายชื่อ");
  expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  await dialog.locator(".customer-map-layout").evaluate((element) => {
    element.scrollTop = 0;
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: test.info().outputPath("customer-map-mobile.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "ปิดแผนที่" }).click();
  await expect(dialog).toHaveCount(0);
});

test("source counts remain visible when a modern subdistrict has no reference polygon", async ({
  page,
}) => {
  const { dialog } = await openMap(page);
  await dialog.getByLabel("เลือกจังหวัด", { exact: true }).selectOption("10");
  await dialog.getByLabel("เลือกเขต", { exact: true }).selectOption("1047");
  await dialog.getByRole("button", { name: "เลือกแขวงบางนาเหนือ", exact: true }).click();
  await expect(dialog.locator(".customer-map-summary")).toContainText("95 รายชื่อ");
  await expect(dialog.locator(".customer-map-boundary-notice")).toContainText(
    "ยังไม่มีขอบเขตพื้นที่นี้",
  );
  await expect(dialog.locator('.customer-map-area[data-area-id="104702"]')).toHaveAttribute(
    "d",
    "",
  );
  await expect(dialog.locator('.customer-map-label[data-label-id="104702"]')).toHaveCount(0);
});

test("a failed district request can be retried, and rapid province switching never shows stale districts", async ({
  page,
}) => {
  let failures = 1;
  await page.route("**/maps/thailand/districts/73.json", async (route) => {
    if (failures-- > 0) await route.fulfill({ status: 503, body: "Unavailable" });
    else await route.continue();
  });
  const { dialog } = await openMap(page);
  await dialog.getByLabel("เลือกจังหวัด", { exact: true }).selectOption("73");
  await expect(dialog.getByRole("alert")).toContainText("โหลดรายการพื้นที่ไม่สำเร็จ");
  await dialog.getByRole("button", { name: "ลองอีกครั้ง" }).click();
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(7);
  await dialog.getByLabel("เลือกจังหวัด", { exact: true }).selectOption("21");
  await dialog.getByLabel("เลือกจังหวัด", { exact: true }).selectOption("10");
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(50);
  await expect(dialog.getByRole("button", { name: "เลือกเขตพระนคร", exact: true })).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "เลือกอำเภอเมืองระยอง", exact: true }),
  ).toHaveCount(0);
});

test("wheel zoom stops at districts and reveals subdistricts only after a district click", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  const { dialog } = await openMap(page);
  const subdistrictRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/maps/thailand/subdistricts/"))
      subdistrictRequests.push(request.url());
  });
  const canvas = dialog.locator(".customer-map-canvas");
  await expect(canvas).toHaveAttribute("data-detail-level", "province");
  const response = await page.request.get("/maps/thailand/provinces.json");
  const province = (await response.json()).areas.find((area: { id: string }) => area.id === "73");
  const point = await dialog.locator(".customer-map-svg").evaluate((element, center) => {
    const matrix = (element as SVGSVGElement).getScreenCTM()!;
    const p = new DOMPoint(center[0], center[1]).matrixTransform(matrix);
    return { x: p.x, y: p.y };
  }, province.center);
  await page.mouse.move(point.x, point.y);
  for (let i = 0; i < 4; i++) await page.mouse.wheel(0, -100);
  await expect(canvas).toHaveAttribute("data-detail-level", "district");
  const cameraAtDistrict = await dialog.locator(".customer-map-geography").getAttribute("style");
  await expect(dialog.locator('[data-area-level="district"]').first()).toBeVisible();
  await expect(dialog.locator('[data-label-level="district"]').first()).toBeVisible();
  await expect(dialog.locator(".customer-map-geography")).toHaveAttribute(
    "style",
    cameraAtDistrict!,
  );
  await expect(dialog.locator(".customer-map-context")).toHaveCount(77);
  for (let i = 0; i < 3; i++) await page.mouse.wheel(0, -100);
  await expect(canvas).toHaveAttribute("data-detail-level", "district");
  await expect(dialog.locator('[data-area-level="subdistrict"]')).toHaveCount(0);
  expect(subdistrictRequests).toHaveLength(0);
  await page.screenshot({
    path: test.info().outputPath("customer-map-district-zoom.png"),
    animations: "disabled",
  });
  await dialog.locator('[data-area-id="7305"]').click();
  await expect(canvas).toHaveAttribute("data-detail-level", "subdistrict");
  await expect(dialog.locator('[data-area-level="subdistrict"]').first()).toBeVisible();
  await expect(dialog.locator('[data-label-level="subdistrict"]').first()).toBeVisible();
  await expect(dialog.locator(".customer-map-area-list > button")).toHaveCount(15);
  const parents = await dialog
    .locator('[data-area-level="subdistrict"]')
    .evaluateAll((paths) => paths.map((path) => path.getAttribute("data-area-id")));
  expect(parents.every((id) => id?.startsWith("7305"))).toBe(true);
  await page.screenshot({
    path: test.info().outputPath("customer-map-selected-district.png"),
    animations: "disabled",
  });
  await dialog.getByRole("button", { name: "กลับไปดูทุกอำเภอ" }).click();
  await expect(canvas).toHaveAttribute("data-detail-level", "district");
  await dialog.getByRole("button", { name: "ประเทศไทย", exact: true }).click();
  await expect(canvas).toHaveAttribute("data-detail-level", "province");
});
