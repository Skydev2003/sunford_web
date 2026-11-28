import { expect, test, type Page } from "@playwright/test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";

const routes = [
  "/",
  "/products",
  "/scales",
  "/indicators",
  "/platforms",
  "/pos",
  "/accessories",
  "/platforms/sus304",
  "/products/wps10ks",
  "/service/technical-specification",
  "/service/warranty/policy",
  "/service?section=contact",
  "/software",
  "/service",
  "/solutions",
  "/not-a-sunford-page",
];

function snapshot(page: Page) {
  return page.evaluate(() => {
    const measure = (selector: string) => {
      const element = document.querySelector<HTMLElement>(selector)!;
      const { x, width, height } = element.getBoundingClientRect();
      const css = getComputedStyle(element);
      return {
        values: [x, width, height],
        spacing: [css.paddingBlockStart, css.paddingBlockEnd, css.paddingInlineStart, css.gap],
      };
    };
    const links = (selector: string) =>
      [...document.querySelectorAll<HTMLAnchorElement>(selector)].map((link) => [
        (link.getAttribute("aria-label") ?? link.textContent ?? "").replace(/\s+/g, " ").trim(),
        link.getAttribute("href"),
      ]);

    return {
      boxes: ["[data-products-nav]", "footer.site-footer", ".footer-main", ".footer-bottom"].map(
        measure,
      ),
      navbar: links("[data-products-nav] a"),
      footer: links("footer.site-footer a"),
      footerText: document.querySelector("footer.site-footer")!.textContent!.replace(/\s+/g, " "),
    };
  });
}

for (const width of [390, 834, 1023, 1024, 1440]) {
  test(`public Navbar and Footer share spacing and content at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    let baseline: Awaited<ReturnType<typeof snapshot>> | undefined;

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const navbar = page.locator("header[data-products-header]:visible");
      const footer = page.locator("footer.site-footer:visible");
      await expect(navbar, route).toHaveCount(1);
      await expect(footer, route).toHaveCount(1);
      await expect(footer.locator(".contact-banner")).toHaveCount(0);
      await page.evaluate(() => document.fonts.ready);
      const current = await snapshot(page);
      baseline ??= current;

      expect(current.navbar, route).toEqual(baseline.navbar);
      expect(current.footer, route).toEqual(baseline.footer);
      expect(current.footerText, route).toEqual(baseline.footerText);
      expect(current.boxes[0].values[2], route).toBe(width < 1024 ? 48 : 44);
      for (const [index, box] of current.boxes.entries()) {
        expect(box.spacing, route).toEqual(baseline.boxes[index].spacing);
        box.values.forEach((value, dimension) =>
          expect(
            Math.abs(value - baseline!.boxes[index].values[dimension]),
            route,
          ).toBeLessThanOrEqual(1),
        );
      }
    }
  });
}

for (const width of [390, 834, 1440]) {
  test(`all eight Navbar submenus share layout and links at ${width}px`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const baselines = new Map<string, { geometry: number[][]; links: (string | null)[][] }>();

    for (const route of ["/", "/products", "/service?section=contact"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const navbar = page.locator("header[data-products-header]:visible");
      await expect(
        navbar.getByRole("button", { name: "ค้นหาสินค้าและข้อมูล", exact: true }),
      ).toBeEnabled();
      await page.evaluate(() => document.fonts.ready);

      for (const { label, href } of getPrimaryNavigationItems(defaultNavigation)) {
        if (width < 1024) {
          await navbar.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
          await navbar.getByRole("button", { name: `เปิดเมนูย่อย${label}`, exact: true }).click();
        } else {
          await navbar
            .locator(".desktop-nav")
            .getByRole("link", { name: label, exact: true })
            .press("ArrowDown");
        }
        const content = navbar.locator(`[data-nav-menu="${href}"]`);
        await expect(content).toBeVisible();
        const current = await content.evaluate((node) => {
          const dimensions = (element: Element) => {
            const { x, y, width, height } = element.getBoundingClientRect();
            return [x, y, width, height].map((value) => Math.round(value));
          };
          return {
            geometry: [
              dimensions(node),
              ...Array.from(node.querySelectorAll("[data-nav-column]"), dimensions),
            ],
            links: [...node.querySelectorAll("[role=link], a")].map((link) => [
              link.textContent!.trim(),
              link.getAttribute("href"),
            ]),
          };
        });
        if (!baselines.has(href)) baselines.set(href, current);
        expect(current, `${route} ${label}`).toEqual(baselines.get(href));
        await page.keyboard.press("Escape");
        await expect(content).toBeHidden();
      }
    }
  });
}
