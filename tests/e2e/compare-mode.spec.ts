import { expect, test, type Locator, type Page } from "@playwright/test";

type WarehouseProduct = {
  id: string;
  slug: string;
  name: string;
  storefrontName?: string;
  warehouseSku?: string;
  category: string;
};
type ReferenceProduct = WarehouseProduct & { href: string };
let warehouseProducts: WarehouseProduct[];
const displayName = (product: WarehouseProduct) => product.storefrontName ?? product.name;

test.beforeAll(async ({ request }) => {
  const response = await request.get("/api/products");
  expect(response.ok()).toBe(true);
  warehouseProducts = (await response.json()).products;
  expect(warehouseProducts.length).toBeGreaterThanOrEqual(4);
});

async function openCatalog(page: Page, width: number) {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width, height: 1000 });
  await page.goto("/products?category=scales");
  const catalog = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford", exact: true });
  await expect(catalog).toBeVisible();
  await expect(catalog.locator("article").first()).toBeVisible();
  const hrefs = await catalog
    .locator('article a[href^="/products/"]')
    .evaluateAll((links) => [...new Set(links.map((link) => link.getAttribute("href")!))]);
  const references: ReferenceProduct[] = [];
  for (const href of hrefs) {
    const pathname = new URL(href, page.url()).pathname;
    const source = warehouseProducts.find((product) => pathname === `/products/${product.slug}`);
    if (
      source?.warehouseSku &&
      source.category === "scales" &&
      !references.some((reference) => reference.id === source.id)
    )
      references.push({ ...source, href });
  }
  expect(
    references.length,
    "Comparison requires four real Warehouse products in the catalogue",
  ).toBeGreaterThanOrEqual(4);
  return {
    catalog,
    references: references.slice(0, 4),
    entry: catalog.getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true }),
    controls: catalog.getByRole("button", { name: /^(เพิ่มเพื่อ|นำออกจาก)เปรียบเทียบ / }),
    bar: page.locator(".compare-bar"),
    dialog: page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true }),
  };
}

type Session = Awaited<ReturnType<typeof openCatalog>>;

function choice(catalog: Locator, product: ReferenceProduct, selected = false) {
  const card = catalog.locator("article").filter({
    has: catalog.page().locator(`a[href="${product.href}"]`),
  });
  return card.getByRole("button", {
    name: `${selected ? "นำออกจาก" : "เพิ่มเพื่อ"}เปรียบเทียบ ${displayName(product)}`,
    exact: true,
  });
}

async function startEmpty(session: Session) {
  await session.entry.click();
  await expect(session.controls.first()).toBeVisible();
  await expect(session.bar.locator("strong")).toHaveText("0/3");
  await expect(
    session.bar.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }),
  ).toBeDisabled();
  await expect(session.dialog).not.toBeVisible();
}

async function expectFinished(session: Session) {
  await expect(session.dialog).not.toBeVisible();
  await expect(session.controls).toHaveCount(0);
  await expect(session.bar).toHaveCount(0);
  await expect(session.catalog).toBeVisible();
}

async function selectProducts(session: Session, products: ReferenceProduct[]) {
  for (const product of products) {
    await choice(session.catalog, product).click();
    await expect(choice(session.catalog, product, true)).toHaveAttribute("aria-pressed", "true");
  }
  await expect(session.bar.locator("strong")).toHaveText(`${products.length}/3`);
}

async function showComparison(session: Session, products: ReferenceProduct[]) {
  await session.bar.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  await expect(session.dialog).toBeVisible();
  const ids = new Set(products.map((product) => product.id));
  const expected = warehouseProducts.filter((product) => ids.has(product.id));
  const headers = session.dialog.locator('thead a[href^="/products/"]');
  await expect(headers).toHaveText(expected.map(displayName));
  expect(
    await headers.evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(expected.map((product) => `/products/${product.slug}`));
  expect(new Set(expected.map((product) => product.warehouseSku)).size).toBe(products.length);
}

for (const width of [1440, 390]) {
  test(`comparison controls appear only during an explicit session (${width}px)`, async ({
    page,
  }) => {
    const session = await openCatalog(page, width);
    await expect(session.catalog.getByRole("link", { name: /^ดูรายละเอียด / })).toHaveCount(0);
    await expectFinished(session);
    await startEmpty(session);
    const selected = session.references.slice(0, 3);
    await selectProducts(session, selected);
    await expect(choice(session.catalog, session.references[3])).toBeDisabled();
    for (const product of selected)
      await expect(choice(session.catalog, product, true)).toBeEnabled();
    await showComparison(session, selected);
    await session.dialog.getByRole("button", { name: "ปิด", exact: true }).click();
    await expectFinished(session);
    await startEmpty(session);
    await session.bar.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
    await expectFinished(session);
  });
}

test("Escape finishes comparison and the catalogue can start a new session", async ({ page }) => {
  const session = await openCatalog(page, 834);
  await startEmpty(session);
  const selected = session.references.slice(0, 1);
  await selectProducts(session, selected);
  await showComparison(session, selected);
  await page.keyboard.press("Escape");
  await expectFinished(session);
  await expect(
    session.catalog.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }),
  ).toBeFocused();
  await startEmpty(session);
  await session.bar.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
  await expectFinished(session);
});

test("removing the last product in the comparison finishes the session", async ({ page }) => {
  const session = await openCatalog(page, 834);
  await startEmpty(session);
  const product = session.references[0];
  await selectProducts(session, [product]);
  await showComparison(session, [product]);
  await session.dialog
    .getByRole("button", {
      name: `นำ ${displayName(product)} ออกจากการเปรียบเทียบ`,
      exact: true,
    })
    .click();
  await expectFinished(session);
  await startEmpty(session);
  await session.bar.getByRole("button", { name: "ยกเลิกการเปรียบเทียบ", exact: true }).click();
  await expectFinished(session);
});
