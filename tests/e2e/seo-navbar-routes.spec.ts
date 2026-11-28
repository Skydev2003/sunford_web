import { expect, test } from "@playwright/test";
import { load } from "cheerio";

const menus = [
  "/products",
  "/scales",
  "/platforms",
  "/software",
  "/accessories",
  "/pos",
  "/mes",
  "/solutions",
  "/service",
];

test("all nine Mega Menus expose clean, reachable URLs", async ({ page }) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/service?section=contact");
  const header = page.locator("[data-products-header]:visible");
  await expect(header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล" })).toBeEnabled();
  const mainLinks = header.locator(".desktop-nav a");
  await expect(mainLinks).toHaveCount(menus.length);
  expect(
    await mainLinks.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(menus);

  const destinations = new Set<string>(menus);
  const onlineShops = new Set<string>();
  for (const href of menus) {
    await mainLinks
      .filter({ visible: true })
      .and(header.locator(`.desktop-nav a[href="${href}"]`))
      .press("ArrowDown");
    const panel = header.locator(`[data-nav-menu="${href}"]`);
    await expect(panel).toBeVisible();
    const readLinks = () =>
      panel.locator("a[href]:visible").evaluateAll((anchors) =>
        anchors.map((link) => ({
          href: link.getAttribute("href")!,
          target: link.getAttribute("target"),
          rel: link.getAttribute("rel"),
        })),
      );
    const links = await readLinks();
    if (href === "/platforms") {
      for (const product of await panel
        .locator('[data-nav-column="primary"] a[aria-keyshortcuts]')
        .all()) {
        await product.focus();
        await expect(panel.locator('[data-nav-column="uses"] a:visible')).toHaveCount(5);
        links.push(...(await readLinks()));
      }
    }
    expect(links.length, href).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.href).not.toMatch(/#|\/products\/warehouse-/i);
      if (link.href.startsWith("/")) destinations.add(link.href);
      if (new URL(link.href, page.url()).hostname === "sunfordshop.com") {
        expect(link.target).toBe("_blank");
        expect(link.rel?.split(/\s+/)).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
        onlineShops.add(href);
      }
    }
  }
  expect([...onlineShops]).toEqual([
    "/products",
    "/scales",
    "/platforms",
    "/accessories",
    "/pos",
    "/mes",
  ]);

  for (const href of destinations) {
    const response = await page.request.get(href, { maxRedirects: 0 });
    expect(response.status(), href).toBe(200);
    const $ = load(await response.text());
    expect($('a[href^="/products/warehouse-"]').length, href).toBe(0);
    if (/^\/(?:scales|platforms|software|mes|solutions)\//.test(href)) {
      expect($("main h1").text().trim(), href).not.toBe("");
      expect(new URL($('link[rel="canonical"]').attr("href")!, response.url()).pathname).toBe(
        new URL(href, response.url()).pathname,
      );
    }
  }
});

for (const [root, query, section, label] of [
  ["/scales", "feature=waterproof", "#catalog-feature-results", "กันน้ำกันฝุ่น"],
  ["/platforms/indicators", "feature=waterproof", "#product-lineup-indicators", "กันน้ำกันฝุ่น"],
  ["/platforms/structures", "type=bench-top", "#product-listing-platforms", "Bench-top"],
]) {
  test(`${root}?${query} renders and scrolls to the filtered catalog`, async ({ page }) => {
    const href = `${root}?${query}`;
    const response = await page.request.get(href);
    expect(response.status()).toBe(200);
    const $ = load(await response.text());
    expect($(`${section} [data-active-catalog-feature]`).text()).toContain(label);
    expect(new URL($('link[rel="canonical"]').attr("href")!, response.url()).pathname).toBe(root);
    await page.goto(href);
    const filter = page.locator(`${section} [data-active-catalog-feature]`);
    await expect(filter).toContainText(label);
    await expect(filter).toBeInViewport();
    await filter.getByRole("link", { name: "ล้างตัวกรอง" }).click();
    await expect(page).toHaveURL(root);
    await expect(page.locator("[data-active-catalog-feature]")).toHaveCount(0);
  });
}

for (const width of [390, 834]) {
  test(`the four updated menus show all requested links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/service");
    const header = page.locator("[data-products-header]:visible");
    const help = [
      "ให้คำปรึกษาแนะนำ",
      "ทดลองใช้งานจริง",
      "เลือกซื้อที่ร้านออนไลน์",
      "ขอใบเสนอราคา",
      "ติดต่อเรา",
    ];
    const menus = [
      [
        "/accessories",
        "อุปกรณ์เสริม",
        [
          "เลือกเครื่องชั่งเพื่อประกอบ",
          "เลือกแท่นชั่งเพื่อประกอบ",
          "เลือกซื้อที่ร้านออนไลน์",
          "ติดต่อเรา",
        ],
      ],
      ["/pos", "POS", help],
      ["/service", "บริการช่วยเหลือ", ["ติดต่อเรา"]],
      ["/mes", "MES", help],
    ] as const;
    await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    for (const [path, label, helpLinks] of menus) {
      await header.getByRole("button", { name: `เปิดเมนูย่อย${label}`, exact: true }).click();
      const menu = header.locator(`[data-nav-menu="${path}"]`);
      const helpColumn = menu.locator("[data-nav-column]").filter({
        has: page.getByText("ช่วยเหลือ", { exact: true }),
      });
      await expect(helpColumn.getByRole("link")).toHaveText(helpLinks);
      if (path === "/service") {
        await expect(menu.locator('[data-nav-column="primary"]').getByRole("link")).toHaveText([
          "ลงทะเบียนรับประกัน",
          "บริการหลังการขาย",
        ]);
        await expect(menu.locator('[data-nav-column="uses"]').getByRole("link")).toHaveText([
          "บทความ",
          "เกี่ยวกับผลิตภัณฑ์",
          "เงื่อนไขการรับประกัน",
        ]);
      }
      if (path === "/mes") {
        await menu.getByRole("link", { name: "ทดลองใช้งานจริง", exact: true }).click();
        await expect(page).toHaveURL("/service?section=contact");
        await expect(
          page.getByRole("main").getByRole("heading", { name: "ติดต่อเรา", exact: true }),
        ).toBeVisible();
      } else {
        await menu.getByRole("button", { name: "เมนูหลัก", exact: true }).click();
      }
    }
  });
}
