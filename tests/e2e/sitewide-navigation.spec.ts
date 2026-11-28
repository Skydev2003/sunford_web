import { catalogPageTitle } from "../../src/features/site/data/site-menu-labels";
import { expect, test, type Locator } from "@playwright/test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { getProductSubcategoryPageByHref } from "../../src/features/catalog/data/product-subcategory-pages";
import { catalogSubmenuDestination } from "../../src/features/catalog/data/catalog-submenu-destinations";

const navigation = getPrimaryNavigationItems(defaultNavigation);
const categories = navigation.slice(1, 6);
async function openCategoryMenu(header: Locator, label: string, width: number) {
  if (width < 1024)
    await header.getByRole("button", { name: `เปิดเมนูย่อย${label}`, exact: true }).click();
  else await header.getByRole("link", { name: label, exact: true }).hover();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 1440]) {
  test(`primary product labels navigate directly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/service?section=contact");
    for (const category of categories) {
      const header = page.locator("[data-products-header]:visible");
      await expect(
        header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
      ).toBeEnabled();
      if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      const link = header.getByRole("link", { name: category.label, exact: true });
      await expect(link).toHaveAttribute("href", category.href);
      await link.click();
      await expect(page).toHaveURL(new URL(category.href, page.url()).href);
      await expect(page.locator("main:visible").getByRole("heading", { level: 1 })).toHaveText(
        category.label,
      );
      if (width >= 1024) await page.mouse.move(width - 20, page.viewportSize()!.height - 10);
      await expect(page.locator("#products-navigation-panel:visible")).toHaveCount(0);
      await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    }
    await page.screenshot({ path: test.info().outputPath(`direct-nav-${width}.png`) });
  });

  test(`shared navigation across public pages at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    for (const path of ["/", "/service?section=contact", "/products/acs30-jc21", "/products"]) {
      await page.goto(path);
      await expect(page.locator("[data-products-header]:visible")).toHaveCount(
        path === "/" ? 0 : 1,
      );
      await expect(page.locator(".site-header:visible")).toHaveCount(path === "/" ? 1 : 0);
      if (path === "/") {
        await expect(page.locator(".site-header:visible")).toHaveAttribute("data-nav-tone", "dark");
        await expect(page.locator(".site-header:visible")).toHaveCSS("position", "fixed");
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto("/service?section=contact");
    const header = page.locator("[data-products-header]:visible");
    await expect(
      header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
    ).toBeEnabled();
    if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    for (const category of categories) {
      await openCategoryMenu(header, category.label, width);
      const panel = header.locator("#products-navigation-panel");
      const sections = panel.locator("[data-nav-column]");
      await expect(sections).toHaveCount(1 + category.groups!.length);
      await expect(sections.locator(":scope > p")).toHaveText([
        category.submenuLabel!,
        ...category.groups!.map((group) => group.label),
      ]);
      const expected = [category.links, ...category.groups!.map((group) => group.links)];
      const featureGroup = category.groups![0];
      for (let column = 0; column < expected.length; column++) {
        if (column === 1 && featureGroup.label === "คุณสมบัติ" && featureGroup.links.length === 0) {
          const features = sections.nth(column).getByRole("link");
          await expect(features.first()).toBeVisible();
          expect(await features.count()).toBeLessThanOrEqual(6);
          continue;
        }
        await expect(sections.nth(column).getByRole("link")).toHaveText(
          expected[column].map((link) => link.label),
        );
        expect(
          await sections
            .nth(column)
            .locator("a")
            .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href"))),
        ).toEqual(
          expected[column]
            .filter((link) => !link.disabled)
            .map((link) => catalogSubmenuDestination(link.href)),
        );
        await expect(sections.nth(column).locator('[aria-disabled="true"]')).toHaveCount(
          expected[column].filter((link) => link.disabled).length,
        );
      }
      const boxes = await sections.evaluateAll((nodes) =>
        nodes.map((node) => {
          const { x, y, width } = node.getBoundingClientRect();
          return { x, y, width };
        }),
      );
      if (width >= 1024) {
        expect(boxes[1].x).toBeGreaterThan(boxes[0].x + boxes[0].width);
        if (boxes[2]) expect(boxes[2].x).toBeGreaterThan(boxes[1].x + boxes[1].width);
      } else {
        expect(boxes[1].y).toBeGreaterThan(boxes[0].y);
        if (boxes[2]) expect(boxes[2].y).toBeGreaterThan(boxes[1].y);
        await expect(page.locator("main:visible")).toHaveAttribute("inert", "");
      }
      await page.screenshot({
        path: test.info().outputPath(`menu-${category.href.split("/").at(-1)}-${width}.png`),
      });
      if (width < 1024) {
        const last = sections.last().getByRole("link").last();
        await last.scrollIntoViewIfNeeded();
        await expect(last).toBeInViewport();
        await header.getByRole("button", { name: "เมนูหลัก", exact: true }).click();
      }
    }
    await openCategoryMenu(header, "บริการช่วยเหลือ", width);
    const panel = header.locator("#products-navigation-panel");
    await expect(
      panel.getByRole("link", { name: "เกี่ยวกับผลิตภัณฑ์", exact: true }),
    ).toHaveAttribute("href", "/service/technical-assistance");
    await expect(panel.getByRole("link", { name: "ติดต่อเรา", exact: true })).toHaveAttribute(
      "href",
      "/service?section=contact",
    );
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
    expect(errors).toEqual([]);
  });

  test(`ready product and support links retain their navigation at ${width}px`, async ({
    page,
  }) => {
    test.slow();
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/service?section=contact");
    for (const category of categories) {
      const header = page.locator("[data-products-header]:visible");
      await expect(
        header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
      ).toBeEnabled();
      if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
      await openCategoryMenu(header, category.label, width);
      const choices = [...category.links, ...category.groups![0].links];
      const target =
        choices.find((link) => !link.disabled && getProductSubcategoryPageByHref(link.href)) ??
        category.links.find((link) => !link.disabled)!;
      await header
        .locator("#products-navigation-panel")
        .getByRole("link", { name: target.label, exact: true })
        .click();
      await expect(page).toHaveURL(
        new URL(catalogSubmenuDestination(target.href), page.url()).href,
      );
      const subcategory = getProductSubcategoryPageByHref(target.href);
      if (subcategory) {
        await expect(
          page.locator(`[data-product-subcategory-page="${subcategory.id}"]`),
        ).toBeVisible();
      } else {
        await expect(page.locator("main:visible h1")).toHaveText(
          catalogPageTitle(category.href, category.label),
        );
      }
      await expect(
        page.getByRole("dialog", { name: "ดูสินค้าทั้งหมด", exact: true }),
      ).not.toBeVisible();
    }
    const header = page.locator("[data-products-header]:visible");
    if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await openCategoryMenu(header, "บริการช่วยเหลือ", width);
    await header
      .locator("#products-navigation-panel")
      .getByRole("link", { name: "บทความ", exact: true })
      .click();
    await expect(page).toHaveURL("/service/articles");
    await expect(header.locator("#products-navigation-panel")).toHaveCount(0);
    if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    await openCategoryMenu(header, "บริการช่วยเหลือ", width);
    await header
      .locator("#products-navigation-panel")
      .getByRole("link", { name: "ลงทะเบียนรับประกัน", exact: true })
      .click();
    await expect(page).toHaveURL(/\/warranty\/register$/);
    await expect(header.locator("#products-navigation-panel")).toHaveCount(0);
  });
}

for (const width of [320, 768, 834, 844, 1024, 1920]) {
  test(`product mega menu remains reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 768 || width === 844 ? 390 : 900 });
    await page.goto("/service?section=contact");
    const header = page.locator("[data-products-header]:visible");
    await expect(
      header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
    ).toBeEnabled();
    if (width < 1024) await header.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
    const trigger = header.getByRole(width < 1024 ? "button" : "link", {
      name: width < 1024 ? "เปิดเมนูย่อยเครื่องชั่ง" : "เครื่องชั่ง",
      exact: true,
    });
    await trigger.focus();
    await page.keyboard.press(width < 1024 ? "Enter" : "ArrowDown");
    const panel = header.locator("#products-navigation-panel");
    if (width >= 1024) await expect(panel.locator("a").first()).toBeFocused();
    await expect(panel.locator("[data-nav-column] > p")).toHaveText([
      "สินค้า",
      "คุณสมบัติ",
      "ช่วยเหลือ",
    ]);
    const last = panel.getByRole("link", { name: "ติดต่อเรา", exact: true });
    await last.focus();
    await expect(last).toBeInViewport();
    await expect(last).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);
    await expect(page.locator("main:visible")).not.toHaveAttribute("inert", "");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  });
}
