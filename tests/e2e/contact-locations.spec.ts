import { expect, test } from "@playwright/test";
import { contactLocations } from "../../src/features/content/data/contact-locations";
import { contactPath, legacyContactPath } from "../../src/features/content/data/contact-route";

const bangLen = contactLocations.find((location) => location.id === "service")!;
const facebookHref = "https://www.facebook.com/sunfordthai";

test("contact cards link to email, the Bang Len office and Facebook", async ({ page, context }) => {
  await context.route(bangLen.satelliteMap, (route) => route.fulfill({ body: "Satellite map" }));
  await page.goto(contactPath);
  await expect(page.getByRole("tab", { name: "ติดต่อเรา", selected: true })).toBeVisible();
  const channels = page.getByRole("region", { name: "ช่องทางติดต่อซันฟอร์ด" });
  const cards = channels.getByRole("link");
  await expect(cards).toHaveCount(5);
  await expect(page.getByRole("heading", { name: "พบกับซันฟอร์ด", exact: true })).toHaveCount(0);
  await expect(channels.getByText("เวลาทำการ", { exact: true })).toHaveCount(0);
  await expect(channels.getByRole("link", { name: /โทรศัพท์/ })).toHaveAttribute(
    "href",
    "tel:034276999",
  );
  await expect(channels.getByRole("link", { name: /อีเมลสอบถาม/ })).toHaveAttribute(
    "href",
    "mailto:info@sunford.co.th",
  );
  const map = channels.getByRole("link", { name: /Google Maps.*สำนักงานบางเลน/ });
  await expect(map).toContainText("ต.บางระกำ จ.นครปฐม");
  const facebook = channels.getByRole("link", { name: /Facebook.*@sunfordthai/ });
  await expect(cards.nth(0)).toHaveAttribute("href", facebookHref);
  await expect(cards.nth(1)).toContainText("LINE OFFICIAL");
  const preview = channels.locator('iframe[title*="แผนที่ดาวเทียม"]');
  await expect(preview).toHaveAttribute("src", bangLen.satelliteMap);
  await expect(preview).toHaveAttribute("loading", "lazy");
  for (const [link, href] of [
    [map, bangLen.map],
    [facebook, facebookHref],
  ] as const) {
    await expect(link).toHaveAttribute("href", href);
    await context.route(href, (route) => route.fulfill({ body: "Contact destination" }));
    const popup = page.waitForEvent("popup");
    await link.click();
    const tab = await popup;
    await expect(tab).toHaveURL(href);
    await tab.close();
  }
  for (const [width, columns] of [
    [320, 1],
    [390, 1],
    [768, 2],
    [1024, 2],
    [1440, 4],
  ]) {
    await page.setViewportSize({ width, height: 950 });
    const top = await cards.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().top),
    );
    expect(top.filter((value) => value === top[0])).toHaveLength(columns);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if ([390, 768, 1440].includes(width)) {
      await channels.screenshot({ path: test.info().outputPath(`contact-${width}.png`) });
    }
  }
});

test("legacy contact URL sends visitors directly to the service sidebar", async ({
  request,
  page,
}) => {
  const response = await request.get(legacyContactPath, { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe(contactPath);
  await page.goto(legacyContactPath);
  await expect(page).toHaveURL(contactPath);
  await expect(page.getByRole("tabpanel", { name: "ติดต่อเรา" })).toBeVisible();
});

test("sidebar, footer and history open the contact panel in the same document", async ({
  page,
  context,
}) => {
  await context.route(bangLen.satelliteMap, (route) => route.fulfill({ body: "Satellite map" }));
  await page.goto("/service");
  const repair = page.getByRole("tab", { name: "ซ่อมบำรุง" });
  const claim = page.getByRole("tab", { name: "เคลมสินค้า" });
  const contact = page.getByRole("tab", { name: "ติดต่อเรา" });
  await expect(repair).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('iframe[title*="แผนที่ดาวเทียม"]')).toHaveCount(0);
  await page.evaluate(() => {
    document.documentElement.dataset.contactProbe = "same-document";
  });
  await claim.click();
  await page
    .locator("footer:visible")
    .getByRole("link", { name: "ติดต่อเรา", exact: true })
    .click();
  await expect(page).toHaveURL(contactPath);
  await expect(contact).toHaveAttribute("aria-selected", "true");
  await page.goBack();
  await expect(claim).toHaveAttribute("aria-selected", "true");
  await page.goForward();
  await expect(contact).toHaveAttribute("aria-selected", "true");
  await repair.click();
  await expect(repair).toHaveAttribute("aria-selected", "true");
  await expect(page.locator('iframe[title*="แผนที่ดาวเทียม"]')).toHaveCount(0);
  await contact.click();
  await expect(page).toHaveURL(contactPath);
  await expect(contact).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("html")).toHaveAttribute("data-contact-probe", "same-document");
});

test("navbar links straight to the contact panel", async ({ page, context }) => {
  await context.route(bangLen.satelliteMap, (route) => route.fulfill({ body: "Satellite map" }));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/service");
  const header = page.locator("header:visible");
  await expect(
    header.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
  ).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await header.getByRole("link", { name: "บริการ", exact: true }).hover();
  const contact = page
    .locator("#products-navigation-panel")
    .getByRole("link", { name: "ติดต่อเรา", exact: true });
  await expect(contact).toHaveAttribute("href", contactPath);
  await contact.click();
  await expect(page).toHaveURL(contactPath);
  await expect(page.getByRole("tabpanel", { name: "ติดต่อเรา" })).toBeVisible();
});

test.describe("contact without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("sidebar anchor exposes the cards and native map link", async ({ page }) => {
    await page.goto(contactPath);
    await page
      .getByRole("navigation", { name: "ประเภทบริการหลังการขาย" })
      .getByRole("link", { name: "ติดต่อเรา" })
      .click();
    await expect(page.getByRole("heading", { name: "ติดต่อเรา", exact: true })).toBeInViewport();
    await expect(page.getByRole("link", { name: /Google Maps.*สำนักงานบางเลน/ })).toHaveAttribute(
      "href",
      bangLen.map,
    );
    await expect(page.getByRole("link", { name: /อีเมลสอบถาม/ })).toHaveAttribute(
      "href",
      "mailto:info@sunford.co.th",
    );
  });
});
