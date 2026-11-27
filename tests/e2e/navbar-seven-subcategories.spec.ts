import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import type { Product } from "../../src/features/catalog/types";
import type { NavigationItem } from "../../src/features/site/types";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import { catalogSubmenuDestination } from "../../src/features/catalog/data/catalog-submenu-destinations";
import { getPlatformPlacementSubcategories } from "../../src/features/catalog/data/platform-subcategories";
import siteContent from "../../data/site/content.json";

const root = "/products/category";
const groups = [
  {
    category: "scales",
    parent: "เครื่องชั่ง",
    children: [["analytical", "งานวิเคราะห์", "scale-analytical"]],
  },
  {
    category: "indicators",
    parent: "อินดิเคเตอร์",
    children: [["waterproof", "กันน้ำ", "indicator-waterproof"]],
  },
  {
    category: "platforms",
    parent: "แท่นชั่ง",
    children: [
      ["floor", "แท่นชั่งตั้งพื้น", "platform-floor"],
      ["benchtop", "แท่นชั่งตั้งโต๊ะ", "platform-benchtop"],
    ],
  },
  {
    category: "pos",
    parent: "POS",
    children: [["ios", "iOS", "pos-ios"]],
  },
] as const;

const navigation = siteContent.find(
  (document) =>
    document.kind === "settings" &&
    document.id === "navigation" &&
    !("deletedAt" in document && document.deletedAt),
);
const items = (navigation?.data as { items?: NavigationItem[] } | undefined)?.items ?? [];
const savedDisabled = new Set(
  items
    .flatMap(({ links, groups }) => [...links, ...(groups ?? []).flatMap((group) => group.links)])
    .filter(({ disabled }) => disabled)
    .map(({ href }) => resolveCategoryHref(href)),
);

async function catalogue(request: APIRequestContext) {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  const { products } = (await response.json()) as { products: Product[] };
  expect(products.some(({ warehouseSku }) => warehouseSku)).toBe(true);
  return products;
}

function members(products: Product[], category: string, subcategory: string) {
  if (category === "platforms") {
    const ids = new Set(
      getPlatformPlacementSubcategories(products).find(({ id }) => id === subcategory)?.productIds,
    );
    return products.filter(({ id }) => ids.has(id));
  }
  return products.filter(
    (product) =>
      product.warehouseSku &&
      product.warehouseCategoryId === category &&
      product.warehouseSubcategoryIds?.includes(subcategory),
  );
}

async function homeReady(page: Page) {
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
}

async function verifyMenu(page: Page, home: boolean, input: "touch" | "keyboard" | "mouse") {
  const touch = input === "touch";
  const header = page.locator(home ? ".site-header:visible" : "[data-products-header]:visible");
  if (!home)
    await expect(header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล" })).toBeEnabled();
  for (const { category, parent, children } of groups) {
    const parentHref = `${root}/${category}`;
    if (touch) {
      await header.getByRole("button", { name: "เปิดเมนู", exact: true }).tap();
      await header.locator(`[aria-label="เปิดเมนูย่อย${parent}"]`).tap();
    } else {
      const trigger = header
        .getByRole("navigation", { name: "เมนูหลัก SUNFORD", exact: true })
        .getByRole("link", { name: parent, exact: true });
      if (input === "mouse") await trigger.hover();
      else await trigger.press("ArrowDown");
    }
    const panelId = "#products-navigation-panel";
    const panel = header.locator(`${panelId} [data-nav-menu="${parentHref}"]`);
    const features = panel.locator('[data-nav-column="uses"]');
    if (category !== "pos") await expect(features.locator("p").first()).toHaveText("คุณสมบัติ");
    const navChildren =
      category === "pos"
        ? [
            ["android", "Android"],
            ["windows", "Windows"],
          ]
        : children;
    for (const [slug, label] of navChildren) {
      const href = `${parentHref}/${slug}`;
      const link =
        category === "indicators" && slug === "waterproof"
          ? features.getByRole("link", { name: "กันน้ำกันฝุ่น", exact: true })
          : panel.getByRole("link", {
              name: slug === "analytical" ? "ห้องปฏิบัติการ" : label,
              exact: true,
            });
      await expect(link).toBeVisible();
      if (!savedDisabled.has(href)) {
        await expect(link).toHaveAttribute("href", catalogSubmenuDestination(href));
        await expect(link).toBeEnabled();
      } else {
        await expect(link).toBeDisabled();
        await expect(link).not.toHaveAttribute("href", /.+/);
      }
    }
    if (category === "pos")
      await expect(panel.getByRole("link", { name: "iOS", exact: true })).toHaveCount(0);
    if (touch) await header.getByRole("button", { name: "ปิดเมนู", exact: true }).tap();
    else await page.keyboard.press("Escape");
  }
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("desktop keyboard menus offer the same destinations across the homepage and catalogue navigation", async ({
  page,
  request,
}) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await catalogue(request);
  await page.goto("/");
  await homeReady(page);
  await verifyMenu(page, true, "keyboard");
  await page.locator(".desktop-nav").getByRole("link", { name: "ร้าน", exact: true }).click();
  await expect(page).toHaveURL(/\/products$/);
  await verifyMenu(page, false, "keyboard");
  await page.reload();
  await verifyMenu(page, false, "mouse");
});

test.describe("390px touch", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });
  test("both mobile menus open known routes with or without published inventory", async ({
    page,
    request,
  }) => {
    test.setTimeout(90_000);
    await catalogue(request);
    await page.goto("/");
    await homeReady(page);
    await verifyMenu(page, true, "touch");
    await page.goto("/service?section=contact");
    await verifyMenu(page, false, "touch");
  });
});

test("tablet category entrances and direct listings agree with Warehouse membership", async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 768, height: 1024 });
  const products = await catalogue(request);
  for (const { category, children } of groups) {
    const parentHref = `${root}/${category}`;
    await page.goto(parentHref);
    await expect(
      page
        .locator("[data-products-header]:visible")
        .getByRole("button", { name: "ค้นหาสินค้าและข้อมูล" }),
    ).toBeEnabled();
    for (const [slug, label] of children) {
      const href = `${parentHref}/${slug}`;
      const button = page
        .locator("#products-chapters")
        .getByText(label, { exact: true })
        .locator("..");
      if (category === "indicators") {
        await expect(button).toHaveCount(0);
        continue;
      }
      if (!savedDisabled.has(href)) await expect(button).toHaveAttribute("href", href);
      else await expect(button).toBeDisabled();
    }
    for (const [slug, , id] of children) {
      const href = `${parentHref}/${slug}`;
      const expected = members(products, category, id);
      const response = await page.goto(href);
      expect(response?.ok()).toBe(true);
      const main = page.locator(`[data-product-subcategory-page="${id}"]`);
      await expect(main).toBeVisible();
      const cards = main.locator("#mock-product-results article");
      for (let shown = 24; shown < expected.length; shown += 24)
        await main.getByRole("button", { name: /ดูเพิ่มเติม/ }).click();
      await expect(cards).toHaveCount(expected.length);
      if (expected.length) {
        const hrefs = await cards
          .locator("h3")
          .evaluateAll((headings) =>
            headings.map((heading) => heading.closest("a")?.getAttribute("href")),
          );
        expect(hrefs.sort()).toEqual(
          expected.map(({ slug }) => `/products/${slug}?from=${id}`).sort(),
        );
        const detail = cards.first().getByRole("heading", { level: 3 }).locator("..");
        const destination = await detail.getAttribute("href");
        await detail.click();
        await expect(page).toHaveURL(new URL(destination!, page.url()).href, { timeout: 20000 });
        const back = page.locator(".back-link:visible");
        await expect(back).toHaveAttribute("href", href);
        await back.click();
        await expect(main).toBeVisible();
      } else {
        await expect(
          main.getByRole("heading", { name: "ยังไม่มีรายการสินค้าที่เผยแพร่ในหมวดนี้" }),
        ).toBeVisible();
        await expect(
          main
            .getByRole("navigation", { name: "ข้อมูลที่เกี่ยวข้อง" })
            .getByRole("link", { name: /ปรึกษาผู้เชี่ยวชาญ/ }),
        ).toHaveAttribute("href", "/service?section=contact");
      }
    }
  }
});
