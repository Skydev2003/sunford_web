import { expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { PDFDocument } from "pdf-lib";

export async function downloadQuotation(page: Page, path: string) {
  // Browser regressions must not issue real quotation numbers on the test server.
  await page.route("**/api/quotations/issue", async (route) => {
    expect(route.request().headers()["idempotency-key"]).toMatch(/^[0-9a-f]{32}$/);
    await route.fulfill({ json: { number: "00000001", createdAt: "2026-12-31T18:00:00Z" } });
  });
  const [file] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "พิมพ์ / บันทึก PDF" }).click(),
  ]);
  await file.saveAs(path);
  const doc = await PDFDocument.load(await readFile(path));
  expect(doc.getSubject()).toMatch(/^SUNFORD quotation \/ buyer v[23]$/);
  expect(doc.getTitle()).toMatch(/^\d{8}$/);
  expect(file.suggestedFilename()).toBe("SUNFORD.pdf");
  for (const p of doc.getPages()) expect(p.getSize()).toEqual({ width: 595.28, height: 841.89 });
  return doc;
}
