import { expect, test } from "@playwright/test";
import type { Product } from "@/features/catalog/types";

test("catalogue routes serialize shared product descriptions only once", async ({ request }) => {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  for (const route of ["/", "/products", "/Product/Digital-weighing"]) {
    await (await request.get(route)).text();
    const response = await request.get(route);
    expect(response.ok()).toBe(true);
    const html = await response.text();
    const flight = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)]
      .flatMap((script) => {
        const push = script[1].match(/self\.__next_f\.push\((\[[\s\S]*\])\);?$/);
        if (!push) return [];
        const [type, data] = JSON.parse(push[1]) as [number, string];
        return type === 1 ? [data] : [];
      })
      .join("");
    expect(flight.length).toBeGreaterThan(0);
    expect((flight.match(/"description":/g) ?? []).length).toBeLessThanOrEqual(products.length + 8);
    expect(flight).not.toContain('"createdAt":');
    expect(flight).not.toContain('"catalogManaged":');
  }
});

test("full description search and comparison survive client navigation", async ({
  page,
  request,
}) => {
  const { products } = (await (await request.get("/api/products")).json()) as {
    products: Product[];
  };
  await page.goto("/products");
  const catalogue = page.getByRole("region", { name: "แคตตาล็อกสินค้า Sunford" });
  const targetHref = await catalogue.getByRole("link", { name: /^ดูรายละเอียด / }).first().getAttribute("href");
  const target = products.find((product) => `/products/${product.slug}` === targetHref)!;
  expect(target).toBeTruthy();
  const query = target.description.slice(-30).trim();
  const matches = products.filter((p) =>
    `${p.name} ${p.subtitle} ${p.description}`.toLowerCase().includes(query.toLowerCase()),
  );
  await page.goto("/contact-us");
  await page.getByRole("button", { name: "ค้นหาสินค้า", exact: true }).click();
  const search = page.getByRole("dialog", { name: "ค้นพบสิ่งที่ใช่สำหรับคุณ" });
  await search.getByRole("textbox").fill(query);
  await expect(search.locator(".search-caption")).toHaveText(`พบ ${matches.length} ผลิตภัณฑ์`);
  expect(
    await search
      .locator('.search-results a[href^="/products/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  ).toEqual(matches.slice(0, 40).map((product) => `/products/${product.slug}`));
  await search.getByRole("textbox").fill("บริการหลังการขาย");
  await expect(search.locator('a[href="/service"]')).toBeVisible();
  await page.keyboard.press("Escape");
  await page.goto("/products");
  await page.getByPlaceholder("ค้นหารุ่นสินค้า").fill(query);
  const card = catalogue
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: target.name, exact: true }) });
  await card
    .getByRole("button", { name: `เพิ่มเพื่อเปรียบเทียบ ${target.name}`, exact: true })
    .click();
  await card.getByRole("heading", { name: target.name, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/products/${target.slug}$`));
  await page.getByRole("button", { name: "ดูการเปรียบเทียบ" }).click();
  const comparison = page.getByRole("dialog", { name: "เปรียบเทียบสิ่งที่ใช่" });
  for (const value of [
    target.name,
    target.subtitle,
    target.capacity,
    target.readability,
    target.connection,
  ])
    await expect(comparison.getByRole("table")).toContainText(value);
  await comparison.getByRole("button", { name: "ปิด", exact: true }).click();
  await page.getByRole("button", { name: "ล้างรายการเปรียบเทียบ" }).click();
  await expect(page.locator(".compare-bar")).toHaveCount(0);
});

test("mini motion preserves reveal timing, final appearance and live reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const section = page
    .locator('[data-home-motion="reveal"]')
    .filter({ has: page.locator("#solutions") });
  await expect(section).toHaveAttribute("data-motion-enabled", "true");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await section.scrollIntoViewIfNeeded();
  const heading = section.locator("h2").first();
  await expect(heading).toHaveCSS("opacity", "1");
  await expect(heading).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(section).toHaveAttribute("data-motion-enabled", "false");
  for (const copy of await section.locator("h2, h3, p").all()) {
    await expect(copy).toHaveCSS("opacity", "1");
    await expect(copy).toHaveCSS("transform", "none");
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(section).toHaveAttribute("data-motion-enabled", "true");
  await page.evaluate(() => scrollTo(0, 0));
  await section.scrollIntoViewIfNeeded();
  await expect(heading).toHaveCSS("opacity", "1");
  await expect(heading).toHaveCSS("transform", "none");
});
