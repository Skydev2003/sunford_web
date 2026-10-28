import { test, expect } from "@playwright/test";
import { contactLocations } from "../../src/features/content/data/contact-locations";

test("contact locations retain real company details, map links and responsive cards", async ({
  page,
  context,
}) => {
  await page.goto("/contact-us");
  const locations = page.getByRole("region", { name: "พบกับซันฟอร์ด", exact: true });
  const cards = locations.getByRole("article");
  await expect(cards).toHaveCount(3);
  await context.route("https://maps.app.goo.gl/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "Map destination verified" }),
  );
  for (const [index, location] of contactLocations.entries()) {
    const card = cards.nth(index);
    await expect(card.getByRole("heading", { level: 3 })).toHaveText(location.title);
    await expect(card).toContainText(location.company);
    await expect(card.locator("address")).toHaveText(location.address);
    const map = card.getByRole("link", { name: `ดูแผนที่ ${location.title}`, exact: true });
    await expect(map).toHaveAttribute("href", location.map);
    await expect(map).toHaveAttribute("target", "_blank");
    await expect(map.getByRole("heading")).toHaveText(location.title);
    await expect(map.locator("address")).toHaveText(location.address);
    const popup = page.waitForEvent("popup");
    await map.getByRole("heading").click();
    const mapTab = await popup;
    await expect(mapTab).toHaveURL(location.map);
    await mapTab.close();
  }
  await expect(locations.getByRole("button")).toHaveCount(0);
  await expect(locations.getByText("ดูแผนที่และการเดินทาง", { exact: true })).toHaveCount(0);
  await expect(page.locator(".contact-banner")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "ดูแลกันต่อ ในทุกวันของการใช้งาน" })).toHaveCount(
    0,
  );
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    await locations.scrollIntoViewIfNeeded();
    await page.mouse.move(0, 0);
    await expect(cards.first()).toHaveCSS("transform", "none");
    await expect(cards.last()).toHaveCSS("transform", "none");
    const boxes = await cards.evaluateAll((elements) =>
      elements.map((e) => {
        const { x, y, width, height } = e.getBoundingClientRect();
        return { x, y, width, height };
      }),
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (width > 900) {
      expect(Math.max(...boxes.map((b) => b.y)) - Math.min(...boxes.map((b) => b.y))).toBeLessThan(
        1,
      );
      expect(
        Math.max(...boxes.map((b) => b.height)) - Math.min(...boxes.map((b) => b.height)),
      ).toBeLessThan(1);
    } else {
      expect(boxes[1].y).toBeGreaterThanOrEqual(boxes[0].y + boxes[0].height);
    }
    if (width === 1440 || width === 390) {
      await locations.screenshot({
        path: test.info().outputPath(`contact-locations-${width}.png`),
        animations: "disabled",
      });
    }
  }
});
