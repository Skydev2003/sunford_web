import { catalogPageTitle } from "../../src/features/site/data/site-menu-labels";
import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { getProductSubcategoryPageByHref } from "../../src/features/catalog/data/product-subcategory-pages";

const menus = getPrimaryNavigationItems(defaultNavigation);
const chapterCounts = { scales: 4, indicators: 2, platforms: 4, pos: 3, accessories: 7 };

function header(page: Page, route: string) {
  return page.locator(
    route === "/" ? "header.site-header:visible" : "[data-products-header]:visible",
  );
}

async function visit(page: Page, route: string) {
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  if (route === "/")
    await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  else
    await expect(
      header(page, route).getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
    ).toBeEnabled();
}

async function verifyChapterLayout(page: Page, width: number) {
  const chapters = page.locator("#products-chapters > li > :is(a, button)");
  const dimensions = await chapters.evaluateAll((buttons) =>
    buttons.map((button) => {
      const caption = button.lastElementChild as HTMLElement;
      const item = button.parentElement!.getBoundingClientRect();
      const label = caption.getBoundingClientRect();
      const art = button.firstElementChild!.getBoundingClientRect();
      return {
        name: caption.textContent,
        captionHeight: label.height,
        lineHeight: parseFloat(getComputedStyle(caption).lineHeight),
        fitsItem: label.left >= item.left - 1 && label.right <= item.right + 1,
        clipped: caption.scrollWidth > caption.clientWidth + 1,
        artWidth: art.width,
        artHeight: art.height,
      };
    }),
  );
  for (const item of dimensions) {
    expect(item.captionHeight, item.name ?? "").toBeLessThanOrEqual(item.lineHeight + 1);
    expect(item.fitsItem, item.name ?? "").toBe(true);
    expect(item.clipped, item.name ?? "").toBe(false);
    expect(item.artWidth).toBe(width < 735 ? 90 : 100);
    expect(item.artHeight).toBe(width < 735 ? 58 : 72);
  }
  const rail = page.locator("#products-chapters");
  const overflows = await rail.evaluate((element) => element.scrollWidth > element.clientWidth);
  await chapters.last().scrollIntoViewIfNeeded();
  await expect(chapters.last()).toBeInViewport();
  if (overflows) {
    await rail.evaluate((element) =>
      element.scrollTo({ left: element.scrollWidth, behavior: "instant" }),
    );
    await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  }
  await rail.evaluate((element) => {
    element.scrollLeft = 0;
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const width of [320, 390, 834, 1440]) {
  for (const route of ["/", "/service?section=contact"]) {
    test(`${route} every main name navigates directly and keeps separate submenu access at ${width}px`, async ({
      page,
    }) => {
      test.setTimeout(180_000);
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const [index, menu] of menus.entries()) {
        await visit(page, route);
        const nav = header(page, route);
        if (width < 1024) await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
        const mainLink = () =>
          nav
            .locator(width >= 1024 ? ".desktop-nav" : "#products-navigation-panel")
            .getByRole("link", { name: menu.label, exact: true });
        await expect(mainLink()).toHaveAttribute("href", menu.href);
        if (width >= 1024) {
          await page.mouse.move(width - 4, 996);
          await mainLink().hover();
        } else {
          await nav.getByRole("button", { name: `เปิดเมนูย่อย${menu.label}`, exact: true }).click();
        }
        const panel = nav.locator(`[data-nav-menu="${menu.href}"]:visible`);
        await expect(panel).toBeVisible();
        await expect(panel.locator("[data-nav-column]")).toHaveCount(3);
        await expect(panel.locator(`a[href="${menu.href}"]`)).toHaveCount(0);
        await expect(panel.locator('[data-nav-column="primary"]').getByRole("link")).toHaveText(
          menu.links.map((link) => link.label),
        );
        if (index === 1 || index === 7)
          await page.screenshot({ path: test.info().outputPath(`menu-${index}.png`) });
        if (width >= 1024) {
          await page.keyboard.press("Escape");
          await expect(mainLink()).toHaveAttribute("aria-expanded", "false");
          await mainLink().press("ArrowDown");
          await expect(mainLink()).toHaveAttribute("aria-expanded", "true");
          await expect(panel).toBeVisible();
          await page.keyboard.press("Escape");
        } else {
          await nav.getByRole("button", { name: "เมนูหลัก", exact: true }).click();
        }
        if (index % 2) await mainLink().press("Enter");
        else await mainLink().click();
        await expect(page).toHaveURL((url) => url.pathname === menu.href);
      }
      expect(errors).toEqual([]);
    });
  }

  test(`overview chapters and Navbar share product destinations at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    for (const category of productCategoryDefinitions) {
      const menu = menus.find((item) => item.href === `/${category.id}`)!;
      const chapterMenu = getPrimaryNavigationItems(
        defaultNavigation,
        [],
        "category-chapters",
      ).find((item) => item.href === menu.href)!;
      await visit(page, menu.href);
      const nav = header(page, menu.href);
      if (width < 1024) {
        await nav.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
        await nav.getByRole("button", { name: `เปิดเมนูย่อย${menu.label}`, exact: true }).click();
      } else {
        await nav
          .locator("[data-products-nav]")
          .getByRole("link", { name: menu.label, exact: true })
          .press("ArrowDown");
      }
      const productColumn = nav.locator(
        `[data-nav-menu="${menu.href}"]:visible [data-nav-column="primary"]`,
      );
      await expect(productColumn).toBeVisible();
      await expect(productColumn.locator("p").first()).toHaveText("สินค้า");
      const navbarLinks = productColumn.getByRole("link");
      await expect(navbarLinks).toHaveCount(
        chapterCounts[category.id as keyof typeof chapterCounts],
      );
      const expected = await navbarLinks.evaluateAll((links) =>
        links.map((link) => ({
          label: link.textContent!.trim(),
          href: link.getAttribute("href"),
          disabled: link.getAttribute("aria-disabled") === "true",
        })),
      );
      if (width < 1024) await nav.getByRole("button", { name: "ปิดเมนู", exact: true }).click();
      else await page.keyboard.press("Escape");
      await expect(productColumn).not.toBeVisible();

      const chapters = page.locator("#products-chapters > li > :is(a, button)");
      await expect(chapters.locator(":scope > span:last-child")).toHaveText(
        chapterMenu.links.map((link) => link.label),
      );
      expect(
        new Set(expected.map((item) => item.href && new URL(item.href, page.url()).pathname)),
      ).toEqual(new Set(chapterMenu.links.map((item) => (item.disabled ? null : item.href))));
      for (const [index, chapterLink] of chapterMenu.links.entries()) {
        const link =
          expected.find(
            (item) => item.href && new URL(item.href, page.url()).pathname === chapterLink.href,
          ) ?? expected[index];
        const button = chapters.nth(index);
        if (link.disabled) {
          expect(link.href).toBeNull();
          await expect(button).toBeDisabled();
          await expect(button).toHaveCSS("opacity", "1");
          const before = page.url();
          await button.evaluate((element: HTMLButtonElement) => element.click());
          expect(page.url()).toBe(before);
        } else {
          expect(link.href).toBeTruthy();
          await expect(button).toBeEnabled();
        }
        const configuredHref = chapterMenu.links[index]?.href;
        const artwork =
          configuredHref && `${configuredHref.replace(/^\//, "/images/category-chapters/")}.webp`;
        if (artwork && existsSync(`public${artwork}`)) {
          const image = button.locator("img");
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((element: HTMLImageElement) => element.decode());
          const optimizedSource = await image.evaluate((element: HTMLImageElement) =>
            new URL(element.currentSrc).searchParams.get("url"),
          );
          const slug = artwork.split("/").pop()!.replace(".webp", "");
          expect(optimizedSource).toMatch(
            new RegExp(`^/_next/static/media/${slug}\\.[\\w-]+\\.webp$`),
          );
          await expect(image).toHaveCSS("object-fit", "contain");
        }
        if (configuredHref && !getProductSubcategoryPageByHref(configuredHref)) {
          await expect(button.locator("[data-product-image-placeholder]")).toHaveCount(1);
          await expect(button.locator("img")).toHaveAttribute(
            "src",
            "/images/product-image-placeholder.svg",
          );
        }
      }
      await verifyChapterLayout(page, width);
      await expect(page.locator("h1").first()).toHaveText(
        catalogPageTitle(`/${category.id}`, category.label),
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (category.id === "scales") {
        await page.screenshot({ path: test.info().outputPath("scale-chapters.png") });
      }
      if (category.id === "accessories")
        await page.screenshot({ path: test.info().outputPath("accessory-chapters.png") });
      for (const [index, { disabled, href, label }] of chapterMenu.links.entries()) {
        if (disabled) continue;
        await chapters.nth(index).click();
        const pathname = new URL(href, page.url()).pathname;
        await expect(page, label).toHaveURL((url) => url.pathname === pathname, {
          timeout: 20_000,
        });
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await page.goBack();
        await expect(page).toHaveURL((url) => url.pathname === menu.href);
      }
    }
  });
}

for (const route of ["/", "/service?section=contact"]) {
  test(`${route} Services main link preserves opening in another tab`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await visit(page, route);
    const nav = header(page, route);
    const service = nav
      .locator(route === "/" ? ".desktop-nav" : "[data-products-nav]")
      .getByRole("link", { name: "บริการ", exact: true });
    const opened = context.waitForEvent("page");
    await service.click({ modifiers: ["Control"] });
    const popup = await opened;
    await expect(popup).toHaveURL((url) => url.pathname === "/service");
    expect(new URL(page.url()).pathname).toBe(route);
    await popup.close();
  });
}
