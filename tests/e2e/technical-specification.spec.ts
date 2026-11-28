import { expect, test } from "@playwright/test";

test("the guidebook opens its first chapter and accepts direct chapter links", async ({ page }) => {
  await page.goto("/service/technical-specification");
  const main = page.getByRole("main");
  await expect(main.getByRole("searchbox")).toHaveCount(0);
  await expect(main.locator("#guide-title")).toHaveText("การใช้งานและการดูแลรักษาเครื่องชั่ง");
  const sidebar = main.getByRole("navigation", { name: "บทและคู่มือ" });
  const openGroups = sidebar.locator("details[open] > summary");
  await expect(openGroups).toHaveText(["คู่มือการใช้งาน"]);
  const accessories = sidebar.locator("summary").filter({ hasText: "ก่อนเลือกอุปกรณ์เสริม" });
  await accessories.press("Enter");
  await expect(sidebar.getByRole("link", { name: "เลือกเครื่องพิมพ์", exact: true })).toBeVisible();
  await accessories.press("Enter");
  await expect(openGroups).toHaveText(["คู่มือการใช้งาน"]);
  await page.goto("/service/technical-specification?guide=lp50");
  await expect(main.locator("#guide-title")).toHaveText("ตั้งค่าและออกแบบฉลากด้วย SUNFORD LP50");
  await expect(openGroups).toHaveText(["คู่มือติดตั้งและไฟล์ประกอบ"]);
});

test("manuals keep one download link and omit duplicate navigation links", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const chapter = page.locator("#guide-content");
  await page.goto("/service/technical-specification?guide=industry");
  await expect(chapter.locator('a[href="/software"]')).toHaveCount(1);
  for (const label of ["SUNFORD POS", "SUNFORD INDUS", "SUNFORD WeWeigh", "SUNFORD LP50"])
    await expect(
      chapter.getByText(label, { exact: true }).and(chapter.locator("strong")),
    ).toBeVisible();

  for (const slug of ["lifestyle", "retail"]) {
    await page.goto(`/service/technical-specification?guide=${slug}`);
    await expect(chapter.locator('a[href="/software"]')).toHaveCount(1);
    await expect(chapter.locator('a[href="/applications-and-softwares"]')).toHaveCount(0);
    await expect(
      chapter.locator('a[href="/"], a[href="/service/technical-specification"]'),
    ).toHaveCount(0);
    await expect(chapter.locator('a[href="/service/warranty/policy"]')).toHaveCount(1);
  }

  await page.goto("/service/technical-specification?guide=rls1100");
  await expect(chapter.locator('a[href="/service?section=contact"]')).toHaveCount(1);
  await expect(chapter.locator('a[href^="/downloads/manuals/"]')).toHaveCount(2);

  await page.goto("/service/technical-specification?guide=scales");
  await expect(chapter.locator('a[href="/scales"]')).toHaveCount(1);
  await expect(chapter.locator('a[href="/scales/industrial"]')).toHaveCount(1);
  await expect(chapter.locator('a[href="/service?section=contact"]')).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "ในหน้านี้" })).toHaveCount(0);
  const sidebar = page.getByRole("navigation", { name: "บทและคู่มือ" });
  await expect(sidebar.getByRole("link")).toHaveText([
    "วิธีเลือกพิกัดน้ำหนัก",
    "ความละเอียดที่ต้องการ",
    "เปรียบเทียบรุ่นเครื่องชั่ง",
  ]);
});

test("the indicator guide opens each sidebar topic in the guidebook", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/service/technical-specification?guide=indicators");
  const chapter = page.locator("article#guide-content");
  const sidebar = page.getByRole("navigation", { name: "บทและคู่มือ" });
  await expect(chapter.getByRole("heading", { level: 1 })).toHaveText("ก่อนเลือกอินดิเคเตอร์");
  const topics = [
    ["platforms", "การจับคู่กับแท่นชั่ง", "/platforms"],
    ["connections", "รูปแบบการเชื่อมต่อ", "/accessories/cables"],
    ["compare", "เปรียบเทียบรุ่นอินดิเคเตอร์", null],
  ] as const;
  for (const [id, label, href] of topics) {
    const topic = sidebar.getByRole("link", { name: label, exact: true });
    await topic.click();
    await expect(page).toHaveURL(
      `/service/technical-specification?guide=indicators-${id}#guide-content`,
    );
    await expect(topic).toHaveAttribute("aria-current", "page");
    await expect(chapter.getByRole("heading", { level: 1 })).toHaveText(label);
    const section = chapter.locator(`section#${id}`);
    if (href) await expect(section.locator(`a[href="${href}"]`)).toBeVisible();
    else await expect(section.getByRole("link")).toHaveCount(0);
    await expect(chapter.locator("section")).toHaveCount(1);
  }
  await page.goBack();
  await expect(chapter.getByRole("heading", { level: 1 })).toHaveText("รูปแบบการเชื่อมต่อ");
});

test("legacy indicator guide URLs keep their section anchors", async ({ page, request }) => {
  const response = await request.get("/guides/indicators", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/service/technical-specification?guide=indicators");
  for (const section of ["platforms", "connections", "compare"]) {
    await page.goto(`/guides/indicators#${section}`);
    await expect(page).toHaveURL(`/service/technical-specification?guide=indicators#${section}`);
    await expect(page.locator(`#guide-content section#${section}`)).toBeInViewport();
  }
});

const platformTopics = [
  ["environment", "เลือกแท่นชั่งสำหรับพื้นที่เปียก", "/platforms/sus304"],
  ["size", "เลือกขนาดแท่น", null],
  ["capacity", "เลือกพิกัดน้ำหนัก", null],
  ["indicators", "การเลือกหัวอ่านที่ใช้ร่วมกัน", "/indicators"],
] as const;

test("legacy platform guide links redirect and keep all four anchors", async ({
  page,
  request,
}) => {
  const response = await request.get("/guides/platforms", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers().location).toBe("/service/technical-specification?guide=platforms");
  for (const [id] of platformTopics) {
    await page.goto(`/guides/platforms#${id}`);
    await expect(page).toHaveURL(`/service/technical-specification?guide=platforms#${id}`);
    await expect(page.locator(`#guide-content section#${id}`)).toBeInViewport();
  }
});

test("platform catalogue links open the overview and each topic in the guidebook", async ({
  page,
}) => {
  await page.setViewportSize({ width: 834, height: 1000 });
  const overview = "/service/technical-specification?guide=platforms";
  const path = (id: string) => `${overview}-${id}#guide-content`;
  await page.goto("/platforms/sus304");
  const related = page.getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" });
  await expect(related.locator(`a[href="${overview}"]`)).toBeVisible();

  await page.goto("/platforms");
  const index = page.locator('[data-overview-section="index"]');
  for (const [id, label] of platformTopics)
    await expect(index.getByRole("link", { name: label, exact: true })).toHaveAttribute(
      "href",
      path(id),
    );
  await index.getByRole("link", { name: platformTopics[0][1], exact: true }).click();
  const chapter = page.locator("article#guide-content");
  const sidebar = page.getByRole("navigation", { name: "บทและคู่มือ" });
  await expect(chapter.getByRole("heading", { level: 1 })).toHaveText(platformTopics[0][1]);
  for (const [id, label, href] of platformTopics) {
    const topic = sidebar.getByRole("link", { name: label, exact: true });
    await topic.click();
    await expect(page).toHaveURL(path(id));
    await expect(topic).toHaveAttribute("aria-current", "page");
    await expect(chapter.getByRole("heading", { level: 1 })).toHaveText(label);
    const section = chapter.locator(`section#${id}`);
    if (href) await expect(section.locator(`a[href="${href}"]`)).toBeVisible();
    else await expect(section.getByRole("link")).toHaveCount(0);
    await expect(chapter.locator("section")).toHaveCount(1);
  }
});

test("catalogue links open the migrated indicator guide directly", async ({ page }) => {
  const overview = "/service/technical-specification?guide=indicators";
  const topicPath = (topic: string) =>
    `/service/technical-specification?guide=indicators-${topic}#guide-content`;
  await page.setViewportSize({ width: 834, height: 1000 });
  await page.goto("/indicators/led");
  const related = page.getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" });
  const guideLink = related.getByRole("link", { name: /คู่มือเลือกอินดิเคเตอร์/ });
  await expect(guideLink).toHaveAttribute("href", overview);
  await guideLink.click();
  await expect(page).toHaveURL(overview);
  const chapter = page.locator("#guide-title");
  await expect(chapter).toHaveText("ก่อนเลือกอินดิเคเตอร์");
  await expect(page.getByRole("navigation", { name: "บทและคู่มือ" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(834);

  await page.goto("/indicators");
  const index = page.locator('[data-overview-section="index"]');
  for (const topic of ["platforms", "connections", "compare"])
    await expect(index.locator(`a[href="${topicPath(topic)}"]`)).toBeVisible();
  await index.getByRole("link", { name: "การจับคู่กับแท่นชั่ง" }).click();
  await expect(page).toHaveURL(topicPath("platforms"));
  await expect(chapter).toHaveText("การจับคู่กับแท่นชั่ง");
});

const migratedGuides = [
  {
    id: "scales",
    listing: "counting",
    title: "เลือกเครื่องชั่งให้เหมาะกับงาน",
    topics: [
      ["capacity", "วิธีเลือกพิกัดน้ำหนัก", "/scales/industrial"],
      ["resolution", "ความละเอียดที่ต้องการ", "/scales/analytical"],
      ["compare", "เปรียบเทียบรุ่นเครื่องชั่ง", null],
    ],
  },
  {
    id: "pos",
    listing: "android",
    title: "รู้จักระบบ POS เชื่อมต่อเครื่องชั่ง",
    topics: [
      ["systems", "เปรียบเทียบ Android / Windows", "/pos/windows"],
      ["workflows", "ตัวอย่างการใช้งาน", "/software"],
      ["scales", "การเชื่อมต่อเครื่องชั่ง", "/scales"],
    ],
  },
  {
    id: "accessories",
    listing: "pos",
    title: "ก่อนเลือกอุปกรณ์เสริม",
    topics: [
      ["compatibility", "ตรวจสอบรุ่นที่รองรับ", null],
      ["printers", "เลือกเครื่องพิมพ์", "/accessories/printers"],
      ["consumables", "เลือกวัสดุสิ้นเปลือง", "/accessories/consumables"],
    ],
  },
] as const;

for (const { id, listing, title, topics } of migratedGuides) {
  const overview = `/service/technical-specification?guide=${id}`;
  const topicPath = (topic: string) => `${overview}-${topic}#guide-content`;

  test(`${id} bookmarks reach the guidebook overview and preserve their topic`, async ({
    page,
    request,
  }) => {
    const response = await request.get(`/guides/${id}`, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(overview);
    for (const [topic] of topics) {
      await page.goto(`/guides/${id}#${topic}`);
      await expect(page).toHaveURL(`${overview}#${topic}`);
      await expect(page.locator(`#guide-content section#${topic}`)).toBeInViewport();
    }
  });

  test(`${id} catalogue and sidebar open all buying guide topics directly`, async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1000 });
    const category = `/${id}`;
    await page.goto(`/${id}/${listing}`);
    const related = page.getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" });
    const overviewLink = related.locator(`a[href="${overview}"]`);
    await expect(overviewLink).toHaveCount(1);
    await overviewLink.click();
    await expect(page).toHaveURL(overview);
    const chapter = page.locator("#guide-content");
    await expect(chapter.getByRole("heading", { level: 1 })).toHaveText(title);

    await page.goto(category);
    const index = page.locator('[data-overview-section="index"]');
    for (const [topic, label] of topics)
      await expect(index.getByRole("link", { name: label, exact: true })).toHaveAttribute(
        "href",
        topicPath(topic),
      );
    await index.getByRole("link", { name: topics[0][1], exact: true }).click();
    await expect(page).toHaveURL(topicPath(topics[0][0]));
    const sidebar = page.getByRole("navigation", { name: "บทและคู่มือ" });
    for (const [topic, label, href] of topics) {
      const link = sidebar.getByRole("link", { name: label, exact: true });
      await link.click();
      await expect(page).toHaveURL(topicPath(topic));
      await expect(link).toHaveAttribute("aria-current", "page");
      await expect(chapter.getByRole("heading", { level: 1 })).toHaveText(label);
      await expect(chapter.locator("section")).toHaveCount(1);
      const section = chapter.locator(`section#${topic}`);
      if (href) await expect(section.locator(`a[href="${href}"]`)).toBeVisible();
      else await expect(section.getByRole("link")).toHaveCount(0);
    }
  });
}

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the mobile guidebook can open chapters and buying guide topics through native links", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto("/service/technical-specification");
    await page.getByText("สารบัญคู่มือ", { exact: true }).click();
    await page
      .getByRole("navigation", { name: "บทและคู่มือ" })
      .getByRole("link", { name: "งานวิเคราะห์", exact: true })
      .click();
    await expect(page).toHaveURL("/service/technical-specification?guide=laboratory#guide-content");
    await expect(page.locator("#guide-title")).toHaveText("เครื่องชั่งห้องปฏิบัติการ");
    const sidebar = page.getByRole("navigation", { name: "บทและคู่มือ" });
    const openGroup = async (label: string) => {
      if (!(await sidebar.isVisible()))
        await page.getByText("สารบัญคู่มือ", { exact: true }).click();
      await sidebar.getByText(label, { exact: true }).click();
    };
    await openGroup("ก่อนเลือกอินดิเคเตอร์");
    await sidebar.getByRole("link", { name: "รูปแบบการเชื่อมต่อ", exact: true }).click();
    await expect(page).toHaveURL(
      "/service/technical-specification?guide=indicators-connections#guide-content",
    );
    await expect(page.locator("#guide-title")).toHaveText("รูปแบบการเชื่อมต่อ");

    await openGroup("ก่อนเลือกแท่นชั่ง");
    await sidebar.getByRole("link", { name: "เลือกขนาดแท่น", exact: true }).click();
    await expect(page).toHaveURL(
      "/service/technical-specification?guide=platforms-size#guide-content",
    );
    await expect(page.locator("#guide-title")).toHaveText("เลือกขนาดแท่น");

    await openGroup("ก่อนเลือกอุปกรณ์เสริม");
    await sidebar.getByRole("link", { name: "เลือกเครื่องพิมพ์", exact: true }).click();
    await expect(page).toHaveURL(
      "/service/technical-specification?guide=accessories-printers#guide-content",
    );
    await expect(page.locator("#guide-title")).toHaveText("เลือกเครื่องพิมพ์");
  });
});

test("the home and catalogue Navbar expose both support destinations", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  await page
    .locator(".desktop-nav")
    .getByRole("link", { name: "บริการ", exact: true })
    .press("ArrowDown");
  const home = page.locator("[data-nav-menu]");
  await expect(home.getByRole("link", { name: "คู่มือและสเปก" })).toHaveAttribute(
    "href",
    "/service/technical-specification",
  );
  await expect(home.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
    "href",
    "/software",
  );
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/service/technical-specification");
  const header = page.locator("[data-products-header]:visible");
  await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  await header.getByRole("button", { name: "เปิดเมนูย่อยบริการ", exact: true }).click();
  const catalog = header.locator("#products-navigation-panel");
  await expect(catalog.getByRole("link", { name: "คู่มือและสเปก" })).toHaveAttribute(
    "href",
    "/service/technical-specification",
  );
  await expect(catalog.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
    "href",
    "/software",
  );
});
