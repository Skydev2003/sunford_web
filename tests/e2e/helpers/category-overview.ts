import { catalogPageTitle } from "../../../src/features/site/data/site-menu-labels";
import { expect, type Page } from "@playwright/test";
import { productCategoryDefinitions } from "../../../src/features/catalog/data/mock-categories";
import { buyingGuideHref, buyingGuides } from "../../../src/features/content/data/buying-guides";

export async function verifyCategoryOverview(
  page: Page,
  id: (typeof productCategoryDefinitions)[number]["id"],
  width: number,
) {
  await page.setViewportSize({ width, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(id === "platforms" ? "/platforms/structures" : `/${id}`);
  const main = page.locator(`[data-overview-category="${id}"]:visible main`);
  const category = productCategoryDefinitions.find((item) => item.id === id)!;
  const hasSpecLink = id === "indicators" || id === "platforms";
  const pos = id === "pos";
  const usesEditorialLayout = id === "scales" || hasSpecLink || pos;
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(
    id === "platforms" ? category.label : catalogPageTitle(`/${category.id}`, category.label),
  );
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  await expect(page.locator("footer:visible")).toHaveCount(1);
  const sections = main.locator("[data-overview-section]");
  expect(
    await sections.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-overview-section")),
    ),
  ).toEqual([
    "chapters",
    ...(id === "scales" ? ["hero"] : []),
    "lineup",
    ...(usesEditorialLayout ? ["accordion"] : []),
    "services",
    ...(usesEditorialLayout ? [] : ["features"]),
    "essentials",
    ...(usesEditorialLayout ? [] : ["accordion"]),
    "index",
  ]);
  const lineup = main.locator('[data-overview-section="lineup"]');
  const products = lineup.locator("#products-lineup > li > a");
  const destinations = () =>
    products.evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  const all = await destinations();
  expect(all.length).toBeGreaterThan(0);
  for (const href of all) expect(href).toMatch(/^\/products\/[^/?#]+$/);
  expect(new Set(all).size).toBe(all.length);
  const filters = lineup.getByRole("group", { name: "กรองผลิตภัณฑ์" });
  const allFilter = filters.getByRole("button", { name: "ทุกผลิตภัณฑ์" });
  if (id === "platforms") {
    await expect(filters).toHaveCount(0);
  } else if (id === "indicators") {
    const features = lineup.getByRole("navigation", { name: "คุณสมบัติอินดิเคเตอร์" });
    await expect(features.getByRole("link", { name: "ทุกผลิตภัณฑ์" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  } else {
    await expect(allFilter).toBeEnabled();
    await expect(allFilter).toHaveAttribute("aria-pressed", "true");
    const chapters = main.locator("#products-chapters > li > :is(a, button)");
    const groupFilters = (await filters.getByRole("button").all()).slice(1);
    await expect(chapters).toHaveCount(groupFilters.length);
    let hasNarrowerGroup = false;
    for (const [i, filter] of groupFilters.entries()) {
      await expect(filter).toHaveText(
        await chapters.nth(i).locator(":scope > span:last-child").innerText(),
      );
      if (await chapters.nth(i).isDisabled()) {
        await expect(filter).toBeDisabled();
        continue;
      }
      await filter.press("Enter");
      await expect(filter).toHaveAttribute("aria-pressed", "true");
      const subset = await destinations();
      expect(subset).toEqual(all.filter((href) => subset.includes(href)));
      if (width === 1440) {
        const listing = await page.context().newPage();
        try {
          const href = await chapters.nth(i).getAttribute("href");
          await listing.goto(new URL(href!, page.url()).href);
          const catalog = listing.locator("[data-product-subcategory-page]");
          await expect(catalog).toBeVisible();
          const more = catalog.getByRole("button", { name: /^ดูเพิ่มเติม \(/ });
          while (await more.isVisible()) await more.click();
          const listed = await catalog
            .locator("article[data-model-only] > a")
            .evaluateAll((links) =>
              links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
            );
          expect(new Set(subset), href!).toEqual(new Set(listed));
        } finally {
          await listing.close();
        }
      }
      if (subset.length < all.length) hasNarrowerGroup = true;
      await expect(lineup.getByRole("status")).toHaveText(
        subset.length ? `${subset.length} รุ่น` : "ยังไม่มีรุ่นสินค้าในกลุ่มนี้",
      );
    }
    expect(hasNarrowerGroup).toBe(true);
    await allFilter.click();
    expect(await destinations()).toEqual(all);
  }
  const rail = main.locator("#products-lineup");
  if (await rail.evaluate((el) => el.scrollWidth > el.clientWidth + 1)) {
    await lineup.getByRole("button", { name: "เลื่อนผลิตภัณฑ์ถัดไป" }).press("Enter");
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  }
  const guide = buyingGuides.find((g) => g.slug === id)!;
  const features = main.locator("#products-features > li");
  if (usesEditorialLayout)
    await expect(main.locator('[data-overview-section="features"]')).toHaveCount(0);
  else await expect(features.locator("h3")).toHaveText(guide.sections.map((s) => s.title));
  const detailTracks = usesEditorialLayout ? [] : ["products-services", "products-features"];
  for (const trackId of detailTracks) {
    const track = main.locator(`#${trackId}`);
    const trigger = track.getByRole("button").first();
    await trigger.press("Enter");
    const dialog = page.getByRole("dialog", {
      name: await track.locator("h3").first().innerText(),
      exact: true,
    });
    await expect(dialog).toBeVisible();
    const detail = dialog.getByRole("link", { name: "ดูเพิ่มเติม", exact: true });
    if (trackId === "products-features") {
      await expect(detail).toHaveAttribute("href", buyingGuideHref(id, guide.sections[0].id));
      for (const { href } of guide.sections[0].links.filter(
        ({ href }) => href !== guide.productHref,
      )) {
        await expect(dialog.locator(`a[href="${href}"]`).first()).toBeVisible();
      }
    } else {
      await expect(detail).toHaveAttribute("href", /^\//);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await expect(filters.getByRole("link")).toHaveCount(0);
  await expect(lineup.getByRole("button", { name: /^ดู.*ทั้งหมด$/ })).toHaveCount(0);
  await expect(
    main.locator('[data-overview-section="services"]').getByRole("link", {
      name: "ปรึกษาผู้เชี่ยวชาญ",
      exact: true,
    }),
  ).toHaveCount(usesEditorialLayout ? 0 : 1);
  await expect(
    main.locator('[data-overview-section="essentials"]').getByRole("link", {
      name: id === "accessories" ? "ดูเครื่องชั่งทั้งหมด" : "ดูอุปกรณ์เสริมทั้งหมด",
      exact: true,
    }),
  ).toHaveCount(usesEditorialLayout ? 0 : 1);
  if (usesEditorialLayout) {
    const cards = main.locator("#products-services > li");
    await expect(cards).toHaveCount(4);
    await expect(cards.locator("img")).toHaveCount(0);
    await expect(cards.locator(":scope > svg")).toHaveCount(4);
    await expect(cards.locator("button, a")).toHaveCount(0);
    await expect(cards.locator(":scope > p")).toHaveText(
      id === "scales"
        ? [
            /ACS-30-JC21.*ACS-30-JE81.*OIML/,
            /บางเลน.*อะไหล่/,
            /ภาษาไทย.*IP67.*SUS304/,
            /พิมพ์ฉลาก.*Cloud POS/,
          ]
        : id === "indicators"
          ? [
              /รุ่นแท่น.*หัวอ่านเดิม/,
              /รุ่นและจำนวน.*ฝ่ายขาย/,
              /ชื่อรุ่น.*ซ่อม.*เคลม/,
              /หลักฐานการซื้อ.*ลงทะเบียน/,
            ]
          : pos
            ? [
                /ซอฟต์แวร์.*เครื่องชั่ง.*เครื่องพิมพ์/,
                /รุ่นและจำนวน.*ฝ่ายขาย/,
                /ชื่อรุ่น.*ซ่อม.*เคลม/,
                /หลักฐานการซื้อ.*ลงทะเบียน/,
              ]
            : [
                /ขนาดภาชนะ.*น้ำหนักรวม.*สภาพพื้น/,
                /ขนาดแท่น.*วัสดุ.*ฝ่ายขาย/,
                /รุ่นแท่น.*ซ่อม.*เคลม/,
                /หลักฐานการซื้อ.*ลงทะเบียน/,
              ],
    );
    await cards.first().getByRole("heading").click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect
      .poll(() =>
        cards.evaluateAll((items) => {
          const product = document.querySelector("#products-lineup > li")!.getBoundingClientRect();
          return Math.max(
            ...items.flatMap((item) => {
              const card = item.getBoundingClientRect();
              return [Math.abs(card.width - product.width), Math.abs(card.height - product.height)];
            }),
          );
        }),
      )
      .toBeLessThan(1);
  }
  if (hasSpecLink) {
    await expect(main.locator("#products-services h3")).toHaveText([
      id === "indicators" ? "จัดชุดให้เข้ากับแท่นชั่ง" : "เลือกแท่นให้ตรงกับหน้างาน",
      "ขอใบเสนอราคา",
      "บริการหลังการขาย",
      "ลงทะเบียนรับประกัน",
    ]);
    const companion =
      id === "indicators"
        ? { title: "โครงสร้างแท่นชั่ง", href: "/platforms/structures" }
        : { title: "อินดิเคเตอร์แท่นชั่ง", href: "/platforms/indicators" };
    const card = main.locator("#products-essentials > li").first();
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(companion.title);
    await expect(card.getByRole("link", { name: `ดู${companion.title}` })).toHaveAttribute(
      "href",
      companion.href,
    );
    await expect(card.getByRole("img", { name: companion.title })).toBeVisible();
  }
  if (pos) {
    await expect(main.locator("#products-services h3")).toHaveText([
      "เลือกชุด POS สำหรับร้าน",
      "ขอใบเสนอราคา",
      "บริการหลังการขาย",
      "ลงทะเบียนรับประกัน",
    ]);
    const essentials = main.locator("#products-essentials");
    await expect(essentials.locator(":scope > li")).toHaveCount(2);
    await expect(essentials.getByRole("link", { name: "ดูอุปกรณ์เสริม" })).toHaveAttribute(
      "href",
      "/accessories",
    );
    await expect(essentials.getByRole("link", { name: "ดาวน์โหลดซอฟต์แวร์" })).toHaveAttribute(
      "href",
      "/software",
    );
  }
  const accordion = main.locator('[data-overview-section="accordion"]');
  if (usesEditorialLayout) {
    await expect(accordion.getByRole("heading", { level: 2 })).toHaveText(
      pos
        ? "เลือกระบบ POS ให้เหมาะกับร้าน"
        : `เลือก${id === "indicators" ? "อินดิเคเตอร์" : category.label}ให้เหมาะกับงาน`,
    );
    if (!hasSpecLink) await expect(accordion.locator("a[href]")).toHaveCount(0);
  }
  const disclosures = accordion.locator("details");
  const specLinkName = "ไปหน้าจัดสเปคแท่นชั่ง";
  const specPath = "/platforms/custom-spec";
  await expect(disclosures.locator("summary")).toHaveText(guide.sections.map((s) => s.title));
  const keyPoints =
    id === "scales"
      ? [/น้ำหนักสูงสุด.*รวมภาชนะ/, /1 กรัม.*ความคลาดเคลื่อน/, /ขนาดจานชั่ง.*คำนวณราคา.*พิมพ์ฉลาก/]
      : id === "indicators"
        ? [/พิกัด.*โหลดเซลล์/, /พอร์ต.*รูปแบบข้อมูล/, /LCD.*LED.*ระดับการป้องกัน/]
        : pos
          ? [
              /P1.*Android.*P1W.*Windows/,
              /รับน้ำหนัก.*คำนวณราคา.*พิมพ์/,
              /สาย.*พอร์ต.*หน่วยน้ำหนัก/,
            ]
          : [
              /ป้องกันน้ำ.*โหลดเซลล์/,
              /ภาชนะ.*พื้นที่.*รถเข็น/,
              /น้ำหนักสูงสุด.*พิกัด/,
              /โหลดเซลล์.*ความละเอียด/,
            ];
  for (const [i, section] of guide.sections.entries()) {
    const entry = disclosures.nth(i);
    if ((await entry.getAttribute("open")) === null) await entry.locator("summary").press("Enter");
    await expect(entry).toHaveJSProperty("open", true);
    if (usesEditorialLayout) {
      await expect(accordion.locator("details[open]")).toHaveCount(1);
      await expect(entry.locator("p")).toHaveText(keyPoints[i]);
      await expect(entry.locator("img")).toBeVisible();
      if (hasSpecLink) {
        const specLink = entry.getByRole("link", { name: specLinkName, exact: true });
        await expect(entry.getByRole("link")).toHaveCount(1);
        await expect(specLink).toHaveAttribute("href", specPath);
        await expect(specLink).toBeVisible();
      }
    } else {
      await expect(entry.getByRole("link", { name: /อ่านคู่มือ/ })).toHaveAttribute(
        "href",
        buyingGuideHref(id, section.id),
      );
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  if (hasSpecLink) {
    await accordion.getByRole("link", { name: specLinkName, exact: true }).click();
    await expect(page).toHaveURL(specPath, { timeout: 15_000 });
    await expect(page.getByRole("heading", { level: 1, name: "จัดสเปค" })).toBeVisible();
  }
  expect(errors).toEqual([]);
}
