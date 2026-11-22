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

const serviceHeading = "บริการหลังการขาย";
const lineUrl = "https://line.me/R/ti/p/@sunford";

test.use({ reducedMotion: "reduce" });

function serviceMain(page: Page) {
  return page.getByRole("main").filter({
    has: page.getByRole("heading", { level: 1, name: serviceHeading }),
  });
}

function serviceTab(main: Locator, name: string) {
  return main.getByRole("tab", { name: new RegExp(`^(?:[1-5]\\. )?${name}$`) });
}

async function expectInstructions(area: Locator, service: (typeof services)[number]) {
  await expect(area.getByRole("heading", { name: service.title, exact: true })).toBeVisible();
  await expect(area.locator("ol").getByRole("listitem")).toHaveCount(service.steps);
  if (service.name === "รับสินค้าที่โรงงาน") {
    const details = area.locator("details");
    const summary = details.locator("summary");
    await summary.focus();
    await summary.press("Enter");
    await expect(details.getByRole("listitem")).toHaveCount(4);
  }
  for (const text of service.conditions) await expect(area.getByText(text).first()).toBeVisible();
}

async function expectContactAndPolicies(main: Locator) {
  for (const [label, href] of [
    ["034-276999", "tel:034276999"],
    ["089-8152652", "tel:0898152652"],
    ["LINE @sunford", lineUrl],
    ["นโยบายการรับประกัน", "/warranty/policy"],
    ["เงื่อนไขการเปลี่ยนและคืนสินค้า", "/cancel-and-return/policy"],
  ]) {
    const link = main.getByRole("link", { name: label, exact: true }).first();
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", href);
  }
  await expect(main.locator("address").getByText(/อำเภอบางเลน จังหวัดนครปฐม 73130/)).toBeVisible();
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
  await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete");
  const mobile = width < 1024;
  if (mobile) await page.getByRole("button", { name: "เปิดเมนู", exact: true }).click();
  const service = page
    .getByRole("navigation", { name: mobile ? "เมนูมือถือ" : "เมนูหลัก", exact: true })
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
    await expect(main.getByRole("tablist").getByRole("tab")).toHaveCount(services.length);
    await expect(serviceTab(main, services[0].name)).toHaveAttribute("aria-selected", "true");
    await page.evaluate(() => document.fonts.ready);

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
  for (const [key, index] of [
    ["ArrowRight", 1],
    ["End", 4],
    ["ArrowRight", 0],
    ["ArrowLeft", 4],
    ["Home", 0],
  ] as const) {
    await page.keyboard.press(key);
    const tab = serviceTab(main, services[index].name);
    await expect(tab).toBeFocused();
    await expect(tab).toHaveAttribute("aria-selected", "true");
    await expect(tab).toHaveAttribute("tabindex", "0");
    await expect(
      main.getByRole("tabpanel").getByRole("heading", { name: services[index].title }),
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

test("service shortcuts reach LINE and the policy links", async ({ page }) => {
  await page.goto("/service");
  const main = serviceMain(page);
  const contact = main.getByRole("link", { name: "ติดต่อฝ่ายบริการ", exact: true });
  await contact.click();
  await expect(page).toHaveURL("/service#service-contact");
  const line = main
    .locator("#service-contact")
    .getByRole("link", { name: "LINE @sunford", exact: true });
  await expect(line).toBeInViewport();
  await expect(line).toHaveAttribute("href", lineUrl);
  await expect(line).toHaveAttribute("target", "_blank");

  const shortcut = main.getByRole("link", { name: "เงื่อนไขบริการ", exact: true });
  await expect(shortcut).toHaveAttribute("href", /^#.+/);
  const href = (await shortcut.getAttribute("href"))!;
  await shortcut.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`/service${href}`);
  const policies = main.locator(href);
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
        await expect(section.getByRole("heading", { name: service.title })).toBeInViewport();
        await expectInstructions(section, service);
        await expectHorizontalFit(main);
      }
      await expectContactAndPolicies(main);
    });
  }
});
