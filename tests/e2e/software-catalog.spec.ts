import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import sourcePages from "../../src/features/content/data/pages.json";

test("software catalogue has all eight source cards and working category filters", async ({
  page,
}) => {
  await page.goto("/software/download");
  await expect(page.locator(".software-card")).toHaveCount(8);
  for (const [category, count] of [
    ["retail-software", 3],
    ["industrial-software", 4],
    ["household-software", 1],
  ] as const) {
    await page.locator(`.software-filters a[href="#${category}"]`).click();
    await expect(page.locator(".software-card")).toHaveCount(count);
    await expect(page.locator(`.software-filters a[href="#${category}"]`)).toHaveAttribute(
      "aria-current",
      "true",
    );
  }
  await page.goto("/software/download#retail-software");
  await expect(page.locator(".software-card h2")).toHaveText([
    "POSITIVE POS-Android",
    "BASIC POS-Windows",
    "RLS1000",
  ]);
  for (const card of await page.locator(".software-card").all()) {
    await card.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        card
          .locator("img")
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto("/applications-and-softwares#industrial-software");
  await expect(page.locator(".software-card")).toHaveCount(4);
  await expect(page.locator(".software-card h2")).toHaveText([
    "WEWEIGH",
    "INDUS",
    "DRV",
    "LP Label Editor",
  ]);
});

test("all software details, downloads, manuals and videos are rendered", async ({ request }) => {
  test.setTimeout(120000);
  for (const source of sourcePages.filter((page) => page.path.startsWith("/software/download/"))) {
    const response = await request.get(source.path);
    expect(response.status(), source.path).toBe(200);
    const $ = load(await response.text());
    expect($(".source-prose").length, source.path).toBeGreaterThan(0);
    expect($(".source-empty").length, source.path).toBe(0);
    const original = load(source.html);
    original("a[href]").each((_, anchor) => {
      const href = original(anchor).attr("href")!;
      expect(
        $("main a[href]")
          .toArray()
          .some((link) => $(link).attr("href") === href),
        `${source.path}: ${href}`,
      ).toBe(true);
    });
    expect($(".source-prose iframe").length, source.path).toBe(original("iframe").length);
    expect($(".video-card").length, source.path).toBe(source.videos?.length ?? 0);
  }
});

test("RLS download offers both supported model downloads", async ({ page }) => {
  await page.goto("/software/download/sunford-rls1100");
  const models = page.getByRole("navigation", { name: "เลือกซอฟต์แวร์ตามรุ่นเครื่องชั่ง RLS" });
  await models.getByRole("link", { name: "SUNFORD RLS1800", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("RLS1800");
  await expect(page.getByRole("link", { name: "ดาวน์โหลดโปรแกรม", exact: true })).toHaveAttribute(
    "href",
    "https://drive.google.com/file/d/1F5d8ou7_pKoi9WWbMJDN0IEdW2r-ZjaM/view",
  );
});
