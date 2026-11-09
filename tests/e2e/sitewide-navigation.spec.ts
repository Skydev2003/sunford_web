import { expect, test, type Locator } from "@playwright/test";
import { defaultNavigation } from "../../src/features/cms/data/navigation";
async function openCategoryMenu(header: Locator, label: string, width: number) {
  if (width < 834)
    await header.getByRole("button", { name: `เปิดเมนูย่อย${label}`, exact: true }).click();
  else await header.getByRole("link", { name: label, exact: true }).hover();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`primary product labels navigate directly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/contact-us");
    for (const [id, label] of [
      ["scales", "เครื่องชั่ง"],
      ["indicators", "อินดิเคเตอร์แท่นชั่ง"],
      ["platforms", "โครงสร้างแท่นชั่ง"],
      ["pos", "ระบบ POS"],
      ["accessories", "อุปกรณ์เสริม"],
    ]) {
      const header = page.locator("[data-products-header]:visible");
      if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const link = header.getByRole("link", { name: label, exact: true });
      await expect(link).toHaveAttribute("href", `/products/category/${id}`);
      await link.click();
      await expect(page).toHaveURL(new URL(`/products/category/${id}`, page.url()).href);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(label);
      if (width >= 834) await page.mouse.move(width - 20, 600);
      await expect(page.locator("#products-navigation-panel:visible")).toHaveCount(0);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    }
    await page.screenshot({ path: test.info().outputPath(`direct-nav-${width}.png`) });
  });
}

for (const width of [390, 1440]) {
  test(`shared navigation across public pages at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/contact-us", "/products/acs30-jc21", "/products"]) {
      await page.goto(path);
      await expect(page.locator("[data-products-header]")).toHaveCount(path === "/" ? 0 : 1);
      await expect(page.locator(".site-header")).toHaveCount(path === "/" ? 1 : 0);
      if (path === "/") {
        await expect(page.locator(".site-header")).toHaveAttribute("data-nav-tone", "dark");
        await expect(page.locator(".site-header")).toHaveCSS("position", "fixed");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto("/contact-us");
    const header = page.locator("[data-products-header]");
    if (width === 390) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    for (const [label, id, count, relatedHrefs] of [
      [
        "เครื่องชั่ง",
        "scales",
        9,
        [
          "/products/category/scales?subcategory=scale-price",
          "/products/category/scales?subcategory=scale-kitchen",
          "/products/category/scales?subcategory=scale-industrial",
          "/products/category/scales?subcategory=scale-analytical",
        ],
      ],
      [
        "อินดิเคเตอร์แท่นชั่ง",
        "indicators",
        4,
        [
          "/solutions/checkweighing",
          "/solutions/rs232",
          "/solutions/wireless",
          "/solutions/external-display",
        ],
      ],
      [
        "โครงสร้างแท่นชั่ง",
        "platforms",
        5,
        [
          "/products/category/scales?subcategory=scale-industrial",
          "/solutions/checkweighing",
          "/solutions/wet-environments",
        ],
      ],
      [
        "ระบบ POS",
        "pos",
        4,
        [
          "/solutions/pos",
          "/solutions/label-printing",
          "/solutions/pos-label-printing",
          "/software/download#retail-software",
        ],
      ],
      [
        "อุปกรณ์เสริม",
        "accessories",
        6,
        [
          "/solutions/external-display",
          "/solutions/rs232",
          "/solutions/pos",
          "/solutions/label-printing",
        ],
      ],
    ] as const) {
      await openCategoryMenu(header, label, width);
      const panel = header.locator("#products-navigation-panel");
      const sections = panel.locator(":scope > div > div");
      await expect(sections).toHaveCount(3);
      await expect(sections.locator(":scope > p")).toHaveText([
        `สำรวจ${label}`,
        "การใช้งานและโซลูชัน",
        "ข้อมูลและความช่วยเหลือ",
      ]);
      const primary = sections.first();
      await expect(primary.locator("a")).toHaveCount(count - 1);
      await expect(
        primary.getByRole("link", { name: `ดู${label}ทั้งหมด`, exact: true }),
      ).toHaveCount(0);
      const originalChildren = defaultNavigation[0]
        .groups!.flatMap((group) => group.links)
        .filter(
          (link) => new URL(link.href, "http://localhost").searchParams.get("category") === id,
        );
      await expect(primary.locator("a")).toHaveText([
        ...originalChildren.map((link) => link.label),
      ]);
      expect(
        await primary
          .locator("a")
          .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual([
        ...originalChildren.map(
          (link) =>
            `/products/category/${id}?subcategory=${new URL(link.href, "http://localhost").searchParams.get("subcategory")}`,
        ),
      ]);
      expect(
        await primary
          .locator("a")
          .evaluateAll(
            (links, category) =>
              links.every(
                (link) =>
                  new URL((link as HTMLAnchorElement).href).pathname ===
                  `/products/category/${category}`,
              ),
            id,
          ),
      ).toBe(true);
      expect(
        await sections
          .nth(1)
          .locator("a")
          .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual([...relatedHrefs]);
      expect(
        await sections
          .nth(2)
          .locator("a")
          .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
      ).toEqual([
        "/technical-specification",
        "/service",
        "/warranty/register",
        "/warranty/policy",
        "/contact-us",
      ]);
      const boxes = await sections.evaluateAll((elements) =>
        elements.map((element) => {
          const { x, y, width } = element.getBoundingClientRect();
          return { x, y, width };
        }),
      );
      if (width === 1440) {
        expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width);
        expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].width);
        expect(boxes[1].y).toBe(boxes[0].y);
      } else {
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
        expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
      }
      await page.screenshot({ path: test.info().outputPath(`product-menu-${id}-${width}.png`) });
      if (width === 390) {
        await expect(page.locator("main")).toHaveAttribute("inert", "");
        const contact = sections
          .nth(2)
          .getByRole("link", { name: "ติดต่อฝ่ายบริการ", exact: true });
        await contact.scrollIntoViewIfNeeded();
        await expect(contact).toBeInViewport();
        await header.getByRole("button", { name: "เมนูหลัก", exact: true }).click();
      }
    }
    await header.getByRole("button", { name: "บริการ", exact: true }).click();
    const panel = header.locator("#products-navigation-panel");
    await expect(panel.getByRole("link", { name: "รู้จักซันฟอร์ด", exact: true })).toHaveAttribute(
      "href",
      "/about-us",
    );
    await expect(panel.getByRole("link", { name: "ติดต่อเรา", exact: true })).toHaveAttribute(
      "href",
      "/contact-us",
    );
    await page.screenshot({ path: test.info().outputPath(`sitewide-menu-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    await page.screenshot({ path: test.info().outputPath(`sitewide-home-${width}.png`) });
    expect(errors).toEqual([]);
  });
}

for (const width of [320, 768, 834, 844, 1024, 1920]) {
  test(`product mega menu remains reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 || width === 844 ? 390 : 900 });
    await page.goto("/contact-us");
    const header = page.locator("[data-products-header]");
    if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    const trigger =
      width < 834
        ? header.getByRole("button", { name: "เปิดเมนูย่อยเครื่องชั่ง", exact: true })
        : header.getByRole("link", { name: "เครื่องชั่ง", exact: true });
    if (width < 834) await expect(trigger).toBeEnabled();
    await trigger.focus();
    await page.keyboard.press(width < 834 ? "Enter" : "ArrowDown");
    const panel = header.locator("#products-navigation-panel");
    if (width >= 834) await expect(panel.locator("a").first()).toBeFocused();
    await expect(panel.locator(":scope > div > div > p")).toHaveText([
      "สำรวจเครื่องชั่ง",
      "การใช้งานและโซลูชัน",
      "ข้อมูลและความช่วยเหลือ",
    ]);
    const last = panel.getByRole("link", { name: "ติดต่อฝ่ายบริการ", exact: true });
    await last.focus();
    await expect(last).toBeInViewport();
    await expect(last).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath(`product-menu-responsive-${width}.png`) });
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(page.locator("main")).not.toHaveAttribute("inert", "");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
}

for (const width of [390, 1440]) {
  test(`product and support links retain their navigation at ${width}px`, async ({ page }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/contact-us");
    for (const label of [
      "เครื่องชั่ง",
      "อินดิเคเตอร์แท่นชั่ง",
      "โครงสร้างแท่นชั่ง",
      "ระบบ POS",
      "อุปกรณ์เสริม",
    ]) {
      const header = page.locator("[data-products-header]:visible");
      if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await openCategoryMenu(header, label, width);
      const links = header.locator("#products-navigation-panel > div > div").first().locator("a");
      const last = links.last();
      const href = (await last.getAttribute("href"))!;
      await last.click();
      await expect(page).toHaveURL(new URL(href, page.url()).href);
      const finder = page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true });
      await expect(finder).not.toBeVisible();
      const catalog = page
        .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" })
        .filter({ visible: true });
      await expect(
        catalog.getByRole("heading", {
          name: label,
          level: [
            "เครื่องชั่ง",
            "อินดิเคเตอร์แท่นชั่ง",
            "โครงสร้างแท่นชั่ง",
            "ระบบ POS",
            "อุปกรณ์เสริม",
          ].includes(label)
            ? 2
            : 1,
          exact: true,
        }),
      ).toBeVisible();
      const child = new URL(href, page.url()).searchParams.get("subcategory")!;
      const expectedLabel = defaultNavigation[0]
        .groups!.flatMap((group) => group.links)
        .find(
          (link) => new URL(link.href, page.url()).searchParams.get("subcategory") === child,
        )!.label;
      await expect(
        catalog
          .getByRole("group", { name: "หมวดหมู่ย่อยสินค้า" })
          .getByRole("button", { name: expectedLabel, exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      if (
        [
          "เครื่องชั่ง",
          "อินดิเคเตอร์แท่นชั่ง",
          "โครงสร้างแท่นชั่ง",
          "ระบบ POS",
          "อุปกรณ์เสริม",
        ].includes(label)
      )
        await page
          .getByRole("dialog", { name: `ดู${label}ทั้งหมด`, exact: true })
          .getByRole("button", { name: "ปิดแคตตาล็อกสินค้า" })
          .click();
    }
    const header = page.locator("[data-products-header]:visible");
    if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await openCategoryMenu(header, "ระบบ POS", width);
    await header
      .locator("#products-navigation-panel")
      .getByRole("link", { name: "ซอฟต์แวร์สำหรับค้าปลีก", exact: true })
      .click();
    await expect(page).toHaveURL(/\/software\/download#retail-software$/);
    await expect(header.locator("#products-navigation-panel")).toHaveCount(0);
    if (width < 834) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await openCategoryMenu(header, "เครื่องชั่ง", width);
    await header
      .locator("#products-navigation-panel")
      .getByRole("link", { name: "ลงทะเบียนรับประกัน", exact: true })
      .click();
    await expect(page).toHaveURL(/\/warranty\/register$/);
    await expect(header).toHaveCount(1);
    await expect(header.locator("#products-navigation-panel")).toHaveCount(0);
  });
}
