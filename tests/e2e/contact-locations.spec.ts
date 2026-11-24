import { expect, test } from "@playwright/test";
import { contactLocations } from "../../src/features/content/data/contact-locations";

const bangLen = contactLocations.find((location) => location.id === "service")!;
const facebookHref = "https://www.facebook.com/sunfordthai";

test("contact cards link to email, the Bang Len office and Facebook", async ({ page, context }) => {
  await context.route(bangLen.satelliteMap, (route) => route.fulfill({ body: "Satellite map" }));
  await page.goto("/contact-us");
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
    [1024, 4],
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
  }
});
