import { expect, test } from "@playwright/test";

test("legacy Shop and Scale URLs redirect in one hop and keep context", async ({ request }) => {
  const redirects = [
    ["/products?category=scales&subcategory=scale-price&ref=verify", "/scales/retail?ref=verify"],
    [
      "/products/category/scales?subcategory=scale-industrial&ref=verify",
      "/scales/industrial?ref=verify",
    ],
    ["/products/scales?subcategory=scale-kitchen&ref=verify", "/scales/household?ref=verify"],
    ["/scales?subcategory=scale-counting&ref=verify", "/scales/counting?ref=verify"],
    [
      "/products/category/scales/price?feature=price-computing&ref=verify",
      "/scales/retail?feature=price-computing&ref=verify",
    ],
    ["/product/commercial?ref=verify", "/scales/retail?ref=verify"],
    ["/product/industrial?ref=verify", "/scales/industrial?ref=verify"],
    ["/product/laboratory?ref=verify", "/scales/laboratory?ref=verify"],
    ["/collections/coffee-scales?ref=verify", "/scales/household?ref=verify"],
    ["/warranty/policy?ref=verify", "/service/warranty/policy?ref=verify"],
  ];
  for (const [from, to] of redirects) {
    const old = await request.get(from, { maxRedirects: 0 });
    expect(old.status(), from).toBe(308);
    expect(new URL(old.headers().location, old.url()).href).toBe(new URL(to, old.url()).href);
    expect((await request.get(to, { maxRedirects: 0 })).status(), to).toBe(200);
  }
});

test("Shop and Scales landing titles match the menu and warranty retains its terms", async ({
  page,
}) => {
  for (const [path, title] of [
    ["/products", "ร้าน"],
    ["/scales", "เครื่องชั่ง"],
    ["/platforms", "แท่นชั่ง"],
    ["/indicators", "อินดิเคเตอร์"],
    ["/scales/laboratory", "ห้องปฏิบัติการ"],
    ["/scales/industrial", "อุตสาหกรรม"],
    ["/scales/retail", "ร้านค้าและบริการ"],
    ["/scales/household", "ครัวเรือนและบุคคล"],
    ["/scales/water-dust?feature=water-resistant", "กันน้ำกันฝุ่น"],
    ["/scales/custom-spec", "จัดสเปค"],
    ["/service/quotation", "ขอใบเสนอราคา"],
    ["/service?section=contact", "ติดต่อเรา"],
    ["/service/warranty/policy", "เงื่อนไขรับประกัน"],
  ]) {
    await page.goto(path);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("table")).toHaveCount(1);
  await expect(page.locator("section[id^=clause-]")).toHaveCount(11);
});
