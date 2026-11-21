import { expect, test } from "@playwright/test";
import { load } from "cheerio";
import sourcePages from "../../src/features/content/data/pages.json";

const verifiedDownloads = [
  "https://drive.google.com/file/d/1ISol4SrRrs5PqUhQVpgoUtEZmz3CVlSe/view",
  "https://drive.google.com/file/d/1F5d8ou7_pKoi9WWbMJDN0IEdW2r-ZjaM/view",
  "https://drive.google.com/file/d/1jy6LilI-KZR4a4OPTB-C34s0ZWqk2ta5/view",
  "https://drive.google.com/file/d/1RKNriODmduC0w3aOcZhmj0f52Rbvacln/view",
  "https://drive.google.com/file/d/10V84MFRieSg8HwQG1-4I_0WTT7oe4WEo/view",
  "https://drive.google.com/file/d/1PqrmTuq5CpOlncTFg9rJHUVCjGIZXkw5/view",
  "https://play.google.com/store/apps/details?id=com.weweighApp",
  "https://play.google.com/store/apps/details?id=cn.fitdays.fitdays",
  "https://apps.apple.com/th/app/fitdays/id1434527961",
];

for (const width of [390, 1440]) {
  test(`download directory preserves category anchors and verified files at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/software/download");
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("ดาวน์โหลดซอฟต์แวร์");
    const nav = main.getByRole("navigation", { name: "ไปยังหมวดซอฟต์แวร์" });
    for (const [id, models] of [
      ["retail-software", ["SUNFORD RLS1100", "SUNFORD RLS1800", "SUNFORD SmartRetail POS"]],
      [
        "industrial-software",
        ["SUNFORD Connect INDUS 1.10", "LP Label Editor สำหรับ LP50", "WeWeigh"],
      ],
      ["household-software", ["Fitdays"]],
    ] as const) {
      await nav.locator(`a[href="#${id}"]`).click();
      await expect(page).toHaveURL(`/software/download#${id}`);
      await expect(main.locator(`#${id}`).getByRole("heading", { level: 4 })).toHaveText([
        ...models,
      ]);
    }
    await expect(
      main.locator("#industrial-software").getByRole("heading", { level: 3 }),
    ).toHaveText(["Windows", "Android"]);
    const links = main.locator('a[href^="https://"]');
    await expect(links).toHaveCount(verifiedDownloads.length);
    expect(
      await links.evaluateAll((items) => items.map((item) => item.getAttribute("href"))),
    ).toEqual(verifiedDownloads);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

test("download deep links work without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/software/download#industrial-software");
    const main = page.getByRole("main");
    await expect(main.locator("#industrial-software")).toBeInViewport();
    await expect(main.getByRole("link", { name: /เปิดไฟล์ ZIP.*Windows/ })).toHaveAttribute(
      "href",
      verifiedDownloads[4],
    );
  } finally {
    await context.close();
  }
});

test("applications and software keeps its legacy industry filter", async ({ page }) => {
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
