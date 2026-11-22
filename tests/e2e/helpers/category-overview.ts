import { expect, type Page } from "@playwright/test";
import {
  categoryApplicationsLink,
  type CategoryApplicationId,
} from "../../../src/features/catalog/data/category-applications";
import { productCategoryDefinitions } from "../../../src/features/catalog/data/mock-categories";
import { buyingGuides } from "../../../src/features/content/data/buying-guides";

export async function verifyCategoryOverview(page: Page, id: CategoryApplicationId, width: number) {
  await page.setViewportSize({ width, height: 1000 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`/products/category/${id}`);
  const main = page.locator(`[data-overview-category="${id}"]:visible main`);
  const category = productCategoryDefinitions.find((item) => item.id === id)!;
  const applications = categoryApplicationsLink(id);
  await expect(main.getByRole("heading", { level: 1 })).toHaveText(category.label);
  await expect(page.locator("[data-products-header]:visible")).toHaveCount(1);
  await expect(page.locator("[data-products-footer]:visible")).toHaveCount(1);
  await expect(page.locator("footer:visible")).toHaveCount(1);
  const sections = main.locator("[data-overview-section]");
  expect(
    await sections.evaluateAll((nodes) =>
      nodes.map((n) => n.getAttribute("data-overview-section")),
    ),
  ).toEqual(["chapters", "lineup", "services", "features", "essentials", "accordion", "index"]);
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
  const rail = main.locator("#products-lineup");
  if (await rail.evaluate((el) => el.scrollWidth > el.clientWidth + 1)) {
    await lineup.getByRole("button", { name: "เลื่อนผลิตภัณฑ์ถัดไป" }).press("Enter");
    await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
  }
  const guide = buyingGuides.find((g) => g.slug === id)!;
  const features = main.locator("#products-features > li");
  await expect(features.locator("h3")).toHaveText(guide.sections.map((s) => s.title));
  for (const trackId of ["products-services", "products-features"]) {
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
      await expect(detail).toHaveAttribute("href", `/guides/${id}#${guide.sections[0].id}`);
      for (const link of guide.sections[0].links) {
        const href = link.href === guide.productHref ? applications.href : link.href;
        await expect(dialog.locator(`a[href="${href}"]`).first()).toBeVisible();
      }
    } else {
      await expect(detail).toHaveAttribute("href", /^\//);
    }
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  }
  await expect(
    filters.getByRole("link", { name: applications.shortLabel, exact: true }),
  ).toHaveAttribute("href", applications.href);
  await expect(lineup.getByRole("button", { name: /^ดู.*ทั้งหมด$/ })).toHaveCount(0);
  const disclosures = main.locator('[data-overview-section="accordion"] details');
  await expect(disclosures.locator("summary")).toHaveText(guide.sections.map((s) => s.title));
  for (const [i, section] of guide.sections.entries()) {
    const entry = disclosures.nth(i);
    if ((await entry.getAttribute("open")) === null) await entry.locator("summary").press("Enter");
    await expect(entry).toHaveJSProperty("open", true);
    await expect(entry.getByRole("link", { name: /อ่านคู่มือ/ })).toHaveAttribute(
      "href",
      `/guides/${id}#${section.id}`,
    );
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
    true,
  );
  expect(errors).toEqual([]);
}
