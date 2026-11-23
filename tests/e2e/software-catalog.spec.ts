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
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/software/download");
    const main = page.getByRole("main");
    const heading = main.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("ดาวน์โหลดซอฟต์แวร์");
    await expect(heading).toHaveCSS("text-align", "center");
    await expect(main.locator("header p")).toHaveCSS("text-align", "center");
    await expect(main.getByRole("navigation")).toHaveCount(0);
    for (const [id, models] of [
      ["retail-software", ["SUNFORD RLS1100", "SUNFORD RLS1800", "SUNFORD SmartRetail POS"]],
      [
        "industrial-software",
        ["SUNFORD Connect INDUS 1.10", "LP Label Editor สำหรับ LP50", "WeWeigh"],
      ],
      ["household-software", ["Fitdays"]],
    ] as const) {
      await page.goto(`/software/download#${id}`);
      await expect(page).toHaveURL(`/software/download#${id}`);
      await expect(main.locator(`#${id}`).getByRole("heading", { level: 2 })).toBeInViewport();
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

for (const width of [390, 1440]) {
  test(`software cards lead to the download directory through POS at ${width}px`, async ({
    page,
    request,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const redirect = await request.get("/applications-and-softwares", { maxRedirects: 0 });
    expect(redirect.status()).toBe(307);
    expect(redirect.headers().location).toBe("/software/download");
    await page.goto("/applications-and-softwares#industrial-software");
    await expect(page).toHaveURL("/software/download#industrial-software");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("ดาวน์โหลดซอฟต์แวร์");
    await expect(page.locator(".software-catalog")).toHaveCount(0);
    const posPath = "/products/category/pos";
    const card = page.locator("main:visible #products-essentials > li").filter({
      has: page.getByRole("heading", { name: "แอปพลิเคชันและซอฟต์แวร์", exact: true }),
    });
    const posLink = card.getByRole("link", { name: "ดูระบบ POS", exact: true });
    const downloadLink = card.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์", exact: true });
    for (const id of ["indicators", "platforms", "accessories", "scales"]) {
      await page.goto(`/products/category/${id}`);
      await expect(posLink).toHaveAttribute("href", posPath);
      await expect(downloadLink).toHaveCount(0);
    }
    for (const [category, link, path] of [
      ["scales", posLink, posPath],
      ["pos", downloadLink, "/software/download"],
    ] as const) {
      await expect(page.locator(`[data-overview-category="${category}"]:visible`)).toHaveAttribute(
        "data-controls-ready",
        "true",
      );
      await expect(link).toHaveAttribute("href", path);
      if (width === 390) {
        await page.getByRole("button", { name: "เลื่อนอุปกรณ์และซอฟต์แวร์ถัดไป" }).click();
        await expect(link).toBeInViewport({ ratio: 1 });
      }
      await link.click();
      await expect(page).toHaveURL(path);
    }
    await expect(page.getByRole("main").locator("#retail-software")).toBeVisible();
  });

  test(`POS Android and both RLS editions have usable support pages at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/software/download/sunford-pos-android");
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText("SUNFORD POS ANDROID");
    await expect(
      main.getByText(/ยังไม่มีคู่มือ วิดีโอแนะนำ หรือไฟล์ดาวน์โหลดที่ยืนยัน/),
    ).toBeVisible();
    await expect(main.getByRole("link", { name: "ติดต่อฝ่ายบริการ" })).toHaveAttribute(
      "href",
      "/contact-us",
    );
    await expect(main.locator(".video-card, iframe")).toHaveCount(0);
    await page.goto("/software/download/sunford-rls1100");
    await expect(main.getByRole("heading", { level: 1 })).toContainText("RLS1100");
    await expect(main.getByRole("link", { name: "ดาวน์โหลดโปรแกรม" })).toHaveAttribute(
      "href",
      verifiedDownloads[0],
    );
    await expect(main.getByRole("link", { name: "คู่มือติดตั้ง RLS1100" })).toHaveAttribute(
      "href",
      "/technical-specification/guides/rls1100",
    );
    const models = main.getByRole("navigation", { name: "เลือกซอฟต์แวร์ตามรุ่นเครื่องชั่ง RLS" });
    await models.getByRole("link", { name: "SUNFORD RLS1800", exact: true }).click();
    await expect(main.getByRole("heading", { level: 1 })).toContainText("RLS1800");
    await expect(main.getByRole("link", { name: "ดาวน์โหลดโปรแกรม" })).toHaveAttribute(
      "href",
      verifiedDownloads[1],
    );
    await expect(
      models.getByRole("link", { name: "SUNFORD RLS1800", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  });

  test(`POS Android and RLS navigation work without JavaScript at ${width}px`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width, height: 900 },
    });
    try {
      const page = await context.newPage();
      const main = page.getByRole("main");
      await page.goto("/software/download/sunford-pos-android");
      await expect(
        main.getByRole("heading", { level: 1, name: "SUNFORD POS ANDROID" }),
      ).toBeVisible();
      await expect(
        main.getByText(/ยังไม่มีคู่มือ วิดีโอแนะนำ หรือไฟล์ดาวน์โหลดที่ยืนยัน/),
      ).toBeVisible();
      await expect(main.getByRole("link", { name: "ติดต่อฝ่ายบริการ" })).toBeVisible();
      await page.goto("/software/download/sunford-rls1100");
      await expect(main.getByRole("heading", { level: 1 })).toContainText("RLS1100");
      const download = main.getByRole("link", { name: "ดาวน์โหลดโปรแกรม" });
      await expect(download).toBeVisible();
      await expect(download).toHaveAttribute("href", verifiedDownloads[0]);
      await main.getByRole("link", { name: "SUNFORD RLS1800", exact: true }).click();
      await expect(page).toHaveURL("/software/download/sunford-rls1800");
      await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(main.getByRole("heading", { level: 1 })).toContainText("RLS1800");
      await expect(download).toBeVisible();
      await expect(download).toHaveAttribute("href", verifiedDownloads[1]);
    } finally {
      await context.close();
    }
  });
}

test("software detail routes expose only verified downloads or current support options", async ({
  request,
}) => {
  test.setTimeout(120000);
  const approved: Record<string, number[]> = {
    "sunford-pos-android": [],
    "sunford-pos-basic": [],
    "sunford-drv": [],
    "sunford-rls1100": [0],
    "sunford-rls1800": [1],
    "sunford-pos-smart-retail": [2, 3],
    "sunford-indus": [4],
    "sunford-lp50-label-printer": [5],
    "sunford-we-weight": [6],
    fitdays: [7, 8],
  };
  const guides: Record<string, string> = {
    "sunford-rls1100": "rls1100",
    "sunford-lp50-label-printer": "lp50",
    "sunford-pos-smart-retail": "sql-server",
  };
  for (const [slug, indexes] of Object.entries(approved)) {
    const path = "/software/download/" + slug;
    const source = sourcePages.find((page) => page.path === path)!;
    const response = await request.get(path);
    expect(response.ok(), path).toBe(true);
    const $ = load(await response.text());
    expect($("main.source-content-page h1").text(), path).toBe(source.title);
    const links = $("main.source-content-page a[href]")
      .map((_, link) => $(link).attr("href"))
      .get();
    expect(
      links.filter((link) => /^https?:/i.test(link)),
      path,
    ).toEqual(indexes.map((index) => verifiedDownloads[index]));
    expect(links, path).toContain("/software/download");
    if (guides[slug])
      expect(links, path).toContain("/technical-specification/guides/" + guides[slug]);
    if (!indexes.length) expect(links, path).toContain("/contact-us");
    expect(
      $("main.source-content-page .video-card, main.source-content-page iframe").length,
      path,
    ).toBe(0);
  }
});

test("retired manual paths redirect to readable local guides and unknown software is not indexed", async ({
  page,
  request,
}) => {
  for (const [path, slug] of [
    ["/software/download/sunford-pos-smart-retail/sql-server-settings", "sql-server"],
    ["/software/download/sunford-lp50-label-printer/settings", "lp50"],
  ]) {
    const target = "/technical-specification/guides/" + slug;
    const redirect = await request.get(path, { maxRedirects: 0 });
    expect(redirect.status()).toBe(308);
    expect(redirect.headers().location).toBe(target);
    await page.goto(path);
    await expect(page).toHaveURL(target);
    await expect(page.getByRole("main").getByRole("article")).toBeVisible();
  }
  await page.goto("/software/download/not-a-verified-program");
  await expect(
    page.getByRole("heading", { level: 1, name: "ยังไม่พบหน้าที่คุณกำลังมองหา" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
});
