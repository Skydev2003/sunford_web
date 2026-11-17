import { expect, test, type Page } from "@playwright/test";

async function finderSource(page: Page) {
  await page.goto("/products?catalog=all");
  const search = page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true });
  await search.fill("WPS");
  const last = page
    .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford", exact: true })
    .locator('a[href^="/products/"]')
    .last();
  await last.scrollIntoViewIfNeeded();
  const top = await page.locator("dialog[open]").evaluate((el) => el.scrollTop);
  expect(top).toBeGreaterThan(100);
  const href = await last.getAttribute("href");
  await last.click();
  await expect(page).toHaveURL(href!);
  return { search, top };
}

async function navigate(page: Page, href: string) {
  await page.locator(`footer:visible a[href="${href}"]:visible`).first().click();
  await expect(page).toHaveURL(href);
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
});

for (const width of [390, 834, 1440]) {
  test(`detail back returns to the actual finder with its query and inner position at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const { search, top } = await finderSource(page);
    await page.locator(".back-link:visible").click();
    await expect(page).toHaveURL("/products?catalog=all");
    await expect(search).toHaveValue("WPS");
    await expect.poll(() => page.locator("dialog[open]").evaluate((el) => el.scrollTop)).toBe(top);
  });

  test(`finder state and scroll survive traversal beyond the route cache at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const { search, top } = await finderSource(page);
    await navigate(page, "/contact-us");
    await navigate(page, "/about-us");
    await page.locator('[data-products-header]:visible a[aria-label="SUNFORD หน้าแรก"]').click();
    await expect(page).toHaveURL("/");
    for (let i = 0; i < 4; i++) await page.goBack();
    await expect(search).toHaveValue("WPS");
    await expect.poll(() => page.locator("dialog[open]").evaluate((el) => el.scrollTop)).toBe(top);
  });
}

async function leaveAndReturn(
  page: Page,
  paths = ["/contact-us", "/about-us", "/solutions", "/service"],
) {
  for (const path of paths) {
    const footer = page.locator("footer:visible");
    const visibleLink = footer.locator(`a[href="${path}"]:visible`).first();
    if (!(await visibleLink.count())) {
      await footer
        .locator("details")
        .filter({ has: page.locator(`a[href="${path}"]`) })
        .locator("summary")
        .click();
    }
    await footer.locator(`a[href="${path}"]:visible`).first().click();
    await expect(page).toHaveURL(path);
  }
  for (let i = 0; i < paths.length; i++) await page.goBack();
}

test("directory filters and expanded results survive eviction and repeated Back/Forward", async ({
  page,
}) => {
  await page.goto("/explore");
  await page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" }).fill("software");
  const all = page.getByRole("button", { name: /ดูทั้งหมด \d+ รายการ/ });
  if (await all.count()) await all.click();
  const count = await page.locator(".directory-card").count();
  await leaveAndReturn(page);
  await expect(page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" })).toHaveValue("software");
  await expect(page.locator(".directory-card")).toHaveCount(count);
  await page.goForward();
  await expect(page).toHaveURL("/contact-us");
  await page.locator('footer:visible a[href="/products"]:visible').click();
  await expect(page).toHaveURL("/products");
  await page.goBack();
  await expect(page).toHaveURL("/contact-us");
  await page.goBack();
  await expect(page.getByRole("textbox", { name: "ค้นหาข้อมูล Sunford" })).toHaveValue("software");
});

test("related detail pages unwind to each real source before returning to the finder", async ({
  page,
}) => {
  const { search } = await finderSource(page);
  const parent = page.url();
  const related = page
    .locator(".related-products article")
    .first()
    .locator('a[href^="/products/"]')
    .first();
  const href = (await related.getAttribute("href"))!;
  await related.click();
  await expect(page).toHaveURL(href);
  await page.locator(".back-link:visible").click();
  await expect(page).toHaveURL(parent);
  await page.locator(".back-link:visible").click();
  await expect(search).toHaveValue("WPS");
  await expect(page).toHaveURL("/products?catalog=all");
});

test("phone native product rail restores its selected model after eviction", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/products");
  const carousel = page.locator("[data-products-index-carousel]");
  await expect(carousel).toHaveAttribute("data-mobile-rail", "true");
  await expect(carousel.locator("[data-products-mobile-rail]")).toBeVisible();
  await expect(carousel).toHaveAttribute("data-interactive", "true");
  await carousel.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true }).click();
  await expect(carousel).toHaveAttribute("data-active-index", "1");
  await leaveAndReturn(page);
  await expect(carousel).toHaveAttribute("data-active-index", "1");
  await carousel.scrollIntoViewIfNeeded();
  await expect(
    carousel.locator('[data-products-mobile-rail] [aria-current="true"]'),
  ).toBeInViewport();
});

test("home video selection survives eviction without starting playback again", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("#sunford-biz-talk");
  await section.getByRole("button", { name: /^เล่นวิดีโอ/ }).click();
  await expect(section.locator("iframe")).toHaveAttribute("src", /autoplay=1/);
  await leaveAndReturn(page);
  await expect(section.locator("iframe")).toHaveAttribute("src", /autoplay=0/);
});

test("quotation draft fields and quantities survive eviction without issuing a quotation", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && request.url().includes("/api/")) writes.push(request.url());
  });
  await page.goto("/service/quotation");
  await page.locator('input[name="name"]').fill("History QA");
  await page.locator('input[name="contact"]').fill("Draft contact");
  await page.locator('textarea[name="address"]').fill("Draft address");
  const quantity = page.locator('input[inputmode="decimal"], input[type="number"]').first();
  if (await quantity.count()) await quantity.fill("3");
  await leaveAndReturn(page);
  await expect(page.locator('input[name="name"]')).toHaveValue("History QA");
  await expect(page.locator('input[name="contact"]')).toHaveValue("Draft contact");
  await expect(page.locator('textarea[name="address"]')).toHaveValue("Draft address");
  if (await quantity.count()) await expect(quantity).toHaveValue("3");
  expect(writes).toEqual([]);
});

test("service tab survives eviction", async ({ page }) => {
  await page.goto("/service");
  const tab = page.getByRole("tab").last();
  await tab.click();
  const label = (await tab.getAttribute("aria-label"))!;
  await leaveAndReturn(page, ["/contact-us", "/about-us", "/solutions", "/products"]);
  await expect(page.getByRole("tab", { name: label, exact: true })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("builder filters survive eviction", async ({ page }) => {
  await page.goto("/guides/indicator-platform-compatibility");
  const search = page.getByRole("searchbox");
  await search.fill("QA missing item");
  const disclosures = page.locator("main:visible details");
  await disclosures.nth(1).locator("summary").click();
  await disclosures.nth(3).locator("summary").click();
  const open = await disclosures.evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLDetailsElement).open),
  );
  await leaveAndReturn(page);
  await expect(search).toHaveValue("QA missing item");
  await expect(page.locator("main:visible article")).toHaveCount(0);
  await expect
    .poll(() =>
      disclosures.evaluateAll((nodes) => nodes.map((node) => (node as HTMLDetailsElement).open)),
    )
    .toEqual(open);
});

test("reload keeps existing products finder behavior and direct detail return uses its safe fallback", async ({
  page,
}) => {
  await page.goto("/products?catalog=all");
  await page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("WPS");
  const href = await page
    .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford", exact: true })
    .locator('a[href^="/products/"]')
    .first()
    .getAttribute("href");
  await page.reload();
  await expect(page).toHaveURL("/products?catalog=all");
  await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true })).toHaveValue("");
  await page.goto(href!);
  await expect(page.locator(".back-link:visible")).toHaveAttribute("href", "/products");
});

test("separate visits to the same service URL keep separate tab states", async ({ page }) => {
  await page.goto("/service");
  await page.getByRole("tab").last().click();
  await page.locator('footer:visible a[href="/contact-us"]:visible').first().click();
  await expect(page).toHaveURL("/contact-us");
  await page.locator('footer:visible a[href="/service"]:visible').first().click();
  await expect(page.getByRole("tab").first()).toHaveAttribute("aria-selected", "true");
  await page.goBack();
  await expect(page).toHaveURL("/contact-us");
  await page.goBack();
  await expect(page.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
});

test("native skip-link hash entries preserve the selected tab through Back and Forward", async ({
  page,
}) => {
  await page.goto("/service");
  await page.getByRole("tab").last().click();
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/service#main-content");
  await expect(page.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
  await page.goBack();
  await expect(page).toHaveURL("/service");
  await expect(page.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
  await page.goForward();
  await expect(page.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
});

test("comparison detail returns its selected products and popup; explicit close still clears it", async ({
  page,
}) => {
  await page.goto("/products?catalog=all");
  await page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true }).fill("WPS");
  await page
    .getByRole("region", { name: "แคตตาล็อกสินค้า Sunford", exact: true })
    .getByRole("button", { name: "เลือกสินค้าเพื่อเปรียบเทียบ", exact: true })
    .click();
  await page
    .getByRole("button", { name: /^เพิ่มเพื่อเปรียบเทียบ / })
    .first()
    .click();
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "เปรียบเทียบสินค้า", exact: true });
  const product = dialog.locator('a[href^="/products/"]').first();
  const href = (await product.getAttribute("href"))!;
  const name = await product.innerText();
  await product.click();
  await expect(page).toHaveURL(href);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.locator(".back-link:visible").click();
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(name.trim());
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "ค้นหารุ่นสินค้า", exact: true })).toBeVisible();
});

test("quotation picker draft reopens on Forward without issuing a quotation", async ({ page }) => {
  await page.goto("/service");
  await page.locator('footer:visible a[href="/service/quotation"]:visible').click();
  await page.getByRole("button", { name: /เลือกรุ่นสินค้ารายการที่ 1/ }).click();
  const search = page.getByRole("searchbox", { name: "ค้นหาชื่อรุ่นหรือ SKU" });
  await search.fill("WPS");
  await page.goBack();
  await expect(page).toHaveURL("/service");
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await page.goForward();
  await expect(search).toBeVisible();
  await expect(search).toHaveValue("WPS");
  await page.keyboard.press("Escape");
  await expect(search).toBeHidden();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("carousel selection and product-specification popup restore through Back and Forward", async ({
  page,
}) => {
  await page.goto("/products");
  const carousel = page.locator("[data-products-index-carousel]");
  await carousel.getByRole("button", { name: "สินค้ารุ่นถัดไป", exact: true }).click();
  const index = await carousel.getAttribute("data-active-index");
  await leaveAndReturn(page);
  await expect(carousel).toHaveAttribute("data-active-index", index!);
  await carousel.locator("[data-products-models] button").last().click();
  const photo = carousel
    .getByRole("button", { name: /^ดูรายละเอียด / })
    .filter({ visible: true })
    .first();
  await photo.click();
  const complete = page.getByRole("link", { name: "ดูรายละเอียดทั้งหมด", exact: true });
  await complete.click();
  await expect(page).toHaveURL(/\/products\//);
  const spec = page.locator("main:visible .product-spec-groups article > button").first();
  await expect(spec).toBeVisible();
  await spec.click();
  await expect(page.locator("main:visible dialog[open]")).toHaveCount(1);
  await page.goBack();
  await expect(page.getByRole("link", { name: "ดูรายละเอียดทั้งหมด", exact: true })).toBeVisible();
  await page.goForward();
  await expect(page.locator("main:visible dialog[open]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.locator("main:visible dialog[open]")).toHaveCount(0);
  await page.locator(".skip-link").focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await page.locator(".back-link:visible").click();
  await expect(page).toHaveURL("/products");
  await expect(page.getByRole("link", { name: "ดูรายละเอียดทั้งหมด", exact: true })).toBeVisible();
});

test("expanded finder results survive cache eviction", async ({ page }) => {
  await page.goto("/products?catalog=all");
  await page.getByRole("button", { name: /^ดูเพิ่มเติม \(/ }).click();
  const cards = page.locator("#mock-product-results > article");
  const count = await cards.count();
  expect(count).toBeGreaterThan(24);
  const product = cards.last().locator('a[href^="/products/"]').first();
  const href = (await product.getAttribute("href"))!;
  await product.click();
  await expect(page).toHaveURL(href);
  await navigate(page, "/contact-us");
  await navigate(page, "/about-us");
  await page.locator('[data-products-header]:visible a[aria-label="SUNFORD หน้าแรก"]').click();
  await expect(page).toHaveURL("/");
  for (let i = 0; i < 4; i++) await page.goBack();
  await expect(cards).toHaveCount(count);
});

test("a resized return keeps the actual source product in view", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto("/products?catalog=all");
  const product = page
    .locator("#mock-product-results > article")
    .nth(10)
    .locator('a[href^="/products/"]')
    .last();
  await product.scrollIntoViewIfNeeded();
  const href = (await product.getAttribute("href"))!;
  await product.click();
  await expect(page).toHaveURL(href);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator(".back-link:visible").click();
  await expect(page).toHaveURL("/products?catalog=all");
  await expect(product).toBeInViewport();
});

test("returning to a search at zero restores zero after the reused dialog was scrolled elsewhere", async ({
  page,
}) => {
  await page.goto("/service");
  await page.getByRole("button", { name: /ค้นหาสินค้า/ }).click();
  const query = page.getByRole("textbox", { name: "ค้นหาสินค้า Sunford" });
  await query.fill("WPS");
  const dialog = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await expect.poll(() => dialog.evaluate((el) => el.scrollTop)).toBe(0);
  await dialog.locator('a[href^="/products/"]').first().click();
  await expect(page).toHaveURL(/\/products\//);
  await page.getByRole("button", { name: /ค้นหาสินค้า/ }).click();
  await query.fill("");
  await dialog.locator('a[href^="/products/"]').last().scrollIntoViewIfNeeded();
  expect(await dialog.evaluate((el) => el.scrollTop)).toBeGreaterThan(100);
  await page.goBack();
  await expect(page).toHaveURL("/service");
  await expect(query).toHaveValue("WPS");
  await expect.poll(() => dialog.evaluate((el) => el.scrollTop)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
