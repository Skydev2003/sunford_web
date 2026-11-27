import { expect, test, type Locator, type Page } from "@playwright/test";

const viewports = [
  { width: 320, height: 740 },
  { width: 390, height: 844 },
  { width: 768, height: 844 },
  { width: 1280, height: 720 },
  { width: 1440, height: 900 },
];

const services = [
  {
    name: "ซ่อมบำรุง",
    title: "ส่งเครื่องซ่อม",
    steps: 6,
    conditions: [/ส่งเฉพาะตัวเครื่อง.*ไม่ส่งสายชั่งและปลั๊ก/, /ระบุอาการที่พบ/],
  },
  {
    name: "เปลี่ยนสินค้า",
    title: "ส่งสินค้าเปลี่ยนรุ่น",
    steps: 5,
    conditions: [/สินค้า.*เอกสารว่ามีครบทุกชิ้น/, /“ขอเปลี่ยนสินค้า”/, /อาจมีค่าใช้จ่ายตามจริง/],
  },
  {
    name: "เคลมสินค้า",
    title: "ส่งสินค้าเคลม",
    steps: 4,
    conditions: [
      /เฉพาะชิ้นที่ได้รับความเสียหาย/,
      /ส่งคืนพร้อมใบรับรอง/,
      /แจ้งสลิปค่าส่งทางไลน์ @sunford/,
    ],
  },
  {
    name: "คืนสินค้า",
    title: "ส่งสินค้าคืน",
    steps: 5,
    conditions: [/สินค้า.*เอกสารว่ามีครบทุกชิ้น/, /“คืนสินค้า”/, /อาจมีค่าใช้จ่ายตามจริง/],
  },
  {
    name: "รับสินค้าที่โรงงาน",
    title: "นัดรับสินค้าที่โรงงาน",
    steps: 4,
    conditions: [
      /โดยมิได้นัดหมาย/,
      /08\.00–17\.00 น\./,
      /12\.00–13\.00 น\./,
      /ข้อมูลคนขับรถ/,
      /หากต้องการออกใบกำกับภาษี/,
    ],
  },
];

test.use({ reducedMotion: "reduce" });

function serviceMain(page: Page) {
  return page.locator("main#main-content:visible");
}

const mobileServiceMenu = (main: Locator) => main.locator("details:visible > summary");

function serviceTab(main: Locator, name: string) {
  return main.getByRole("tab", { name: new RegExp(`^(?:[1-5]\\. )?${name}$`) });
}

async function expectInstructions(area: Locator, service: (typeof services)[number]) {
  const heading = area.getByRole("heading", { name: service.title, exact: true });
  await expect(heading.locator("..")).toHaveCSS("clip-path", "inset(50%)");
  await expect(area.locator("ol").getByRole("listitem")).toHaveCount(service.steps);
  if (service.name === "รับสินค้าที่โรงงาน") {
    await expect(area.getByRole("heading", { name: "เมื่อมารับสินค้าที่โรงงาน" })).toBeVisible();
    await expect(area.locator("ul").getByRole("listitem")).toHaveCount(4);
  }
  for (const text of service.conditions) await expect(area.getByText(text).first()).toBeVisible();
}

async function expectContactAndPolicies(main: Locator, contactHref = "/service?section=contact") {
  const contact = main.locator("#service-contact");
  await expect(contact).toHaveAccessibleName("ติดต่อเรา");
  await expect(contact).toHaveAttribute("href", contactHref);
  for (const [label, href] of [
    ["นโยบายการรับประกัน", "/warranty/policy"],
    ["เงื่อนไขการเปลี่ยนและคืนสินค้า", "/cancel-and-return/policy"],
  ]) {
    const link = main.getByRole("link", { name: label, exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }
  await expect(main.getByRole("heading", { name: "ที่อยู่โรงงานซันฟอร์ด" })).toHaveCount(0);
  await expect(main.getByRole("link", { name: /^(034-276999|089-8152652)$/ })).toHaveCount(0);
}

async function expectHorizontalFit(main: Locator) {
  await expect
    .poll(() =>
      main.evaluate((element) => {
        const { left, right } = element.getBoundingClientRect();
        return Math.max(
          -left,
          right - innerWidth,
          document.documentElement.scrollWidth - innerWidth,
        );
      }),
    )
    .toBeLessThanOrEqual(1);
}

async function openServiceFromHome(page: Page, width: number) {
  await page.goto("/");
  await expect(page.locator("[data-hero-scene]")).toHaveAttribute("data-enhanced", "true");
  const mobile = width < 1024;
  if (mobile) await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const service = page
    .locator(
      mobile ? "header:visible #products-navigation-panel" : "header:visible [data-products-nav]",
    )
    .getByRole("link", { name: "บริการ", exact: true });
  await expect(service).toHaveAttribute("href", "/service");
  await service.click();
  await expect(page).toHaveURL("/service", { timeout: 15_000 });
}

for (const viewport of viewports) {
  test(`service menu and all five panels work at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && /hydrat/i.test(message.text())) errors.push(message.text());
    });
    await page.setViewportSize(viewport);
    await openServiceFromHome(page, viewport.width);
    const main = serviceMain(page);
    if (viewport.width < 768) await mobileServiceMenu(main).click();
    const menu = main.getByRole("tablist");
    await expect(menu).toHaveAttribute("aria-orientation", "vertical");
    await expect(main.getByRole("heading", { level: 1 })).toHaveText(services[0].title);
    await expect(menu.getByRole("tab")).toHaveCount(services.length + 1);
    await expect(serviceTab(main, services[0].name)).toHaveAttribute("aria-selected", "true");
    await page.evaluate(() => document.fonts.ready);
    const menuBox = (await menu.boundingBox())!;
    const panelBox = (await main.getByRole("tabpanel").boundingBox())!;
    if (viewport.width >= 768) expect(menuBox.x + menuBox.width).toBeLessThan(panelBox.x);
    else expect(menuBox.y + menuBox.height).toBeLessThan(panelBox.y);

    for (const service of services) {
      await test.step(service.name, async () => {
        const tab = serviceTab(main, service.name);
        await tab.click();
        await expect(tab).toHaveAttribute("aria-selected", "true");
        await expect(main.getByRole("tab", { selected: true })).toHaveCount(1);
        const panel = main.getByRole("tabpanel");
        await expect(panel).toHaveCount(1);
        await expect(panel).toHaveAccessibleName(
          (await tab.getAttribute("aria-label")) ?? service.name,
        );
        await expect(panel).toHaveAttribute("id", (await tab.getAttribute("aria-controls")) ?? "");
        await expect(panel.getByRole("heading", { level: 1 })).toHaveText(service.title);
        await expectInstructions(panel, service);
        await expectContactAndPolicies(main);
        await expectHorizontalFit(main);
      });
    }

    if ([390, 1280].includes(viewport.width)) {
      await serviceTab(main, services[0].name).click();
      await page.screenshot({ path: test.info().outputPath("service.png"), fullPage: true });
    }
    expect(errors).toEqual([]);
  });
}

test("keyboard moves focus, selects the matching service, and enters the active panel", async ({
  page,
}) => {
  await page.goto("/service");
  const main = serviceMain(page);
  const repair = serviceTab(main, services[0].name);
  await repair.focus();
  const tabs = [...services, { name: "ติดต่อเรา", title: "ติดต่อเรา" }];
  for (const [key, index] of [
    ["ArrowDown", 1],
    ["End", 5],
    ["ArrowDown", 0],
    ["ArrowUp", 5],
    ["Home", 0],
  ] as const) {
    await page.keyboard.press(key);
    const tab = serviceTab(main, tabs[index].name);
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(tab).toHaveAttribute("tabindex", "0");
    await expect(
      main.getByRole("tabpanel").getByRole("heading", { name: tabs[index].title }),
    ).toBeVisible();
  }
  await page.keyboard.press("Tab");
  await expect(main.getByRole("tabpanel")).toBeFocused();
});

test("a direct service hash opens the matching panel after hydration", async ({ page }) => {
  await page.goto("/service#service-panel-claim");
  const main = serviceMain(page);
  await expect(serviceTab(main, "เคลมสินค้า")).toHaveAttribute("aria-selected", "true");
  const panel = main.getByRole("tabpanel", { name: "เคลมสินค้า" });
  await expect(panel).toBeInViewport();
  await expectInstructions(panel, services[2]);
});

test("the mobile service disclosure reveals the active tab and supports arrow keys", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service?section=contact");
  const main = serviceMain(page);
  const summary = mobileServiceMenu(main);
  await expect(summary).toHaveText("เมนูบริการหลังการขาย");
  await expect(summary.locator("..")).not.toHaveAttribute("open", "");
  await expect(main.getByRole("heading", { level: 1, name: "ติดต่อเรา" })).toBeVisible();
  await summary.click();
  const menu = main.getByRole("tablist");
  const contact = serviceTab(main, "ติดต่อเรา");
  await expect(menu).toHaveAttribute("aria-orientation", "vertical");
  await expect(contact).toHaveAttribute("aria-selected", "true");
  await expect(contact).toBeInViewport({ ratio: 1 });
  await contact.focus();
  await page.keyboard.press("ArrowDown");
  const repair = serviceTab(main, services[0].name);
  await expect(repair).toBeInViewport({ ratio: 1 });
  await expect(repair).toBeFocused();
  await expectInstructions(main.getByRole("tabpanel"), services[0]);
  await expectHorizontalFit(main);
});

test("service contact and policy anchors still open directly", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/service#service-contact");
  const main = serviceMain(page);
  await expect(page).toHaveURL("/service#service-contact");
  const contact = main.locator("#service-contact");
  await expect(contact).toHaveAttribute("href", "/service?section=contact");
  await expect(contact).toBeInViewport();
  await contact.click();
  await expect(page).toHaveURL("/service?section=contact");
  const heading = main
    .getByRole("tabpanel", { name: "ติดต่อเรา" })
    .getByRole("heading", { name: "ติดต่อเรา" });
  await expect(heading).toBeInViewport();

  await page.goto("/service#service-policies");
  const policies = main.locator("#service-policies");
  await expect(policies.getByRole("link", { name: "นโยบายการรับประกัน" })).toBeInViewport();
  await expect(
    policies.getByRole("link", { name: "เงื่อนไขการเปลี่ยนและคืนสินค้า" }),
  ).toBeVisible();
});

test.describe("with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  for (const viewport of viewports) {
    test(`native service navigation exposes all instructions at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      const response = await page.goto("/service");
      expect(response?.status()).toBe(200);
      const main = serviceMain(page);
      await expect(main).toBeVisible();
      if (viewport.width < 768) await mobileServiceMenu(main).click();
      await expect(main.getByRole("tab")).toHaveCount(0);
      const navigation = main.getByRole("navigation", { name: "ประเภทบริการหลังการขาย" });
      for (const service of services) {
        const link = navigation.getByRole("link", { name: service.name, exact: true });
        await expect(link).toHaveAttribute("href", /^#.+/);
        const href = (await link.getAttribute("href"))!;
        await link.focus();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(`/service${href}`);
        const section = main.locator(href);
        await expect(section.locator("ol > li").first()).toBeInViewport();
        await expectInstructions(section, service);
        await expectHorizontalFit(main);
      }
      await expectContactAndPolicies(main, "#service-panel-contact");
      if (viewport.width === 390) {
        await main.locator("#service-contact").click();
        await expect(page).toHaveURL("/service#service-panel-contact");
        await expect(
          main.getByRole("heading", { name: "ติดต่อเรา", exact: true }),
        ).toBeInViewport();
      }
    });
  }
});
