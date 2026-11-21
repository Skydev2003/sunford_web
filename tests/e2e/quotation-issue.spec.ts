import { expect, test } from "@playwright/test";
import { PDFDocument } from "pdf-lib";

test("number an old draft and reuse its allocation key after a failed response", async ({
  page,
}) => {
  const legacy = await PDFDocument.create();
  legacy.addPage([595.28, 841.89]);
  legacy.setSubject("SUNFORD quotation / buyer v1");
  const keys: string[] = [];
  await page.route("**/api/quotations/issue", async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    if (keys.length === 1)
      await route.fulfill({
        status: 200,
        contentType: "text/html",
        body: "<!DOCTYPE html><title>Sign in</title>",
      });
    else if (keys.length === 2)
      await route.fulfill({ contentType: "application/json", body: "{invalid JSON" });
    else if (keys.length === 3) await route.fulfill({ json: { number: "00000002" } });
    else if (keys.length === 4) await route.fulfill({ status: 503 });
    else await route.fulfill({ json: { number: "00000002", createdAt: "2028-02-15T16:59:59Z" } });
  });
  await page.goto("/service/quotation");
  await page.getByText("ออกเลขให้ PDF รุ่นเดิมที่ยังไม่มีเลขเอกสาร", { exact: true }).click();
  await page.getByLabel("ไฟล์ใบเสนอราคาเดิม").setInputFiles({
    name: "legacy.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from(await legacy.save()),
  });
  const button = page.getByRole("button", { name: "ออกเลขและดาวน์โหลด" });
  for (let attempt = 1; attempt <= 4; attempt++) {
    await button.click();
    await expect.poll(() => keys.length).toBe(attempt);
    await expect(page.getByRole("alert").filter({ hasText: "ออกเลขเอกสารไม่ได้" })).toBeVisible();
  }
  const [file] = await Promise.all([page.waitForEvent("download"), button.click()]);
  expect(file.suggestedFilename()).toBe("SUNFORD.pdf");
  expect(keys).toHaveLength(5);
  expect(keys[0]).toMatch(/^[a-f0-9]{32}$/);
  expect(new Set(keys).size).toBe(1);
});
