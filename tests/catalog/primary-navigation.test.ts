import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import {
  getHeaderNavigationItems,
  getPrimaryNavigationItems,
} from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { catalogSubmenuDestination } from "../../src/features/catalog/data/catalog-submenu-destinations";

test("the shared header follows the approved Figma order and preserves submenu destinations", () => {
  const menus = getHeaderNavigationItems(defaultNavigation);
  assert.deepEqual(
    menus.map(({ label, href }) => [label, href]),
    [
      ["ร้าน", "/products"],
      ["เครื่องชั่ง", "/scales"],
      ["แท่นชั่ง", "/platforms"],
      ["ซอฟต์แวร์", "/software"],
      ["อุปกรณ์เสริม", "/accessories"],
      ["POS", "/pos"],
      ["MES", "/mes"],
      ["โซลูชัน", "/solutions"],
      ["บริการช่วยเหลือ", "/service"],
    ],
  );
  assert.deepEqual(
    menus.find(({ href }) => href === "/software"),
    {
      label: "ซอฟต์แวร์",
      href: "/software",
      submenuLabel: "ซอฟต์แวร์",
      links: [
        { label: "การพาณิชย์และค้าปลีก", href: "/software/retail" },
        { label: "การผลิตอุตสาหกรรม", href: "/software/industrial" },
        { label: "ครัวเรือนและสุขภาพ", href: "/software/household" },
      ],
      groups: [
        { label: "ช่วยเหลือ", links: [{ label: "ติดต่อเรา", href: "/service?section=contact" }] },
      ],
    },
  );
  assert.deepEqual(
    menus.find(({ href }) => href === "/mes"),
    {
      label: "MES",
      href: "/mes",
      submenuLabel: "สินค้า",
      links: [
        { label: "Batch MES", href: "/mes/batch-control", subtitle: "ควบคุมชุดการผลิต" },
        { label: "Batch formula MES", href: "/mes/formula-control", subtitle: "ควบคุมสูตรการผลิต" },
      ],
      groups: [
        {
          label: "ช่วยเหลือ",
          links: [
            { label: "ให้คำปรึกษาแนะนำ", href: "/service?section=contact" },
            { label: "ทดลองใช้งานจริง", href: "/service?section=contact" },
            { label: "เลือกซื้อที่ร้านออนไลน์", href: "https://sunfordshop.com/" },
            { label: "ขอใบเสนอราคา", href: "/service/quotation" },
            { label: "ติดต่อเรา", href: "/service?section=contact" },
          ],
        },
      ],
    },
  );
  assert.deepEqual(menuContract([menus.find(({ href }) => href === "/solutions")!]), [
    {
      label: "โซลูชัน",
      href: "/solutions",
      columns: [
        {
          label: "สำหรับนักพัฒนา",
          links: [
            ["ส่งข้อมูลน้ำหนักเข้าคอมพิวเตอร์ (แบบใช้สาย)", "/solutions/rs232", false],
            ["ส่งข้อมูลน้ำหนักเข้าคอมพิวเตอร์ (แบบไร้สาย)", "/solutions/wireless", false],
            ["บันทึกข้อมูลน้ำหนักลง USB Drive", "/solutions/usb-drive", false],
            ["ตั้งค่าพารามิเตอร์และรูปแบบการรับส่งข้อมูล", "/solutions/data-format", false],
            ["ปรับรูปแบบข้อมูลส่งออกด้วยไดรเวอร์", "/solutions/driver", false],
            ["เชื่อมต่อเครื่องชั่งกับอุปกรณ์ PLC", "/solutions/plc", false],
          ],
        },
        {
          label: "สำหรับผู้ใช้งานพาณิชยกรรม",
          links: [
            ["งานชั่งพื้นที่เปียก ฉีดล้าง และมีฝุ่นละออง", "/solutions/wet-environments", false],
            ["แจ้งเตือนน้ำหนักขาด-เกินตามช่วงที่กำหนด", "/solutions/checkweighing", false],
            ["เชื่อมต่อจอแสดงผลภายนอก", "/solutions/external-display", false],
            [
              "พิมพ์สติ๊กเกอร์น้ำหนัก วันที่ บาร์โค้ด และ QR Code",
              "/solutions/label-printing",
              false,
            ],
            ["บันทึกรายงานการชั่งบน Windows", "/solutions/windows", false],
            ["บันทึกรายงานการชั่งบน Android (ขั้นต้น)", "/solutions/android", false],
            ["บันทึกรายงานการชั่งบน Android (ขั้นสูง)", "/solutions/android-advanced", false],
            ["ชั่งน้ำหนักพร้อมสร้าง Lot No. และ Serial No.", "/solutions/lot-serial", false],
          ],
        },
        {
          label: "สำหรับผู้ใช้งานอุตสาหกรรม",
          links: [
            ["เชื่อมต่อเครื่องชั่งกับระบบขายหน้าร้าน (POS)", "/solutions/pos", false],
            [
              "พิมพ์สติ๊กเกอร์น้ำหนัก วันที่ บาร์โค้ด และ QR Code (POS)",
              "/solutions/pos-label-printing",
              false,
            ],
          ],
        },
      ],
    },
  ]);
  assert.ok(
    menus
      .find(({ href }) => href === "/service")
      ?.links.some(({ href }) => href === "/service/warranty/register"),
  );
});

test("Navbar submenu links remove fragments and preserve existing query parameters", () => {
  const targets = [
    ["/scales#product-lineup-scales", "/scales"],
    ["/indicators/lcd#product-listing-indicators", "/indicators/lcd"],
    ["/indicators/rs232", "/indicators/rs232"],
    ["/indicators/waterproof", "/indicators/waterproof"],
    [
      "/scales?trace=keep&feature=counting#product-listing-scales",
      "/scales?trace=keep&feature=counting",
    ],
    ["/accessories/thermal-paper#product-listing-accessories", "/accessories/thermal-paper"],
    ["/software#retail-software", "/software"],
    ["/service/warranty/policy", "/service/warranty/policy"],
  ];
  for (const [source, target] of targets) assert.equal(catalogSubmenuDestination(source), target);
});

type Navigation = ReturnType<typeof getPrimaryNavigationItems>[number];
type MenuContract = {
  label: string;
  href: string;
  columns: { label: string; links: [string, string, boolean][] }[];
};

// Owner-approved Navbar columns, destinations, and default availability.
const approvedMenus: MenuContract[] = [
  {
    label: "ผลิตภัณฑ์ทั้งหมด",
    href: "/products",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["เครื่องชั่ง", "/scales", false],
          ["แท่นชั่ง", "/platforms", false],
          ["อินดิเคเตอร์", "/platforms/indicators", false],
          ["ระบบ POS", "/pos", false],
          ["ระบบ MES", "/mes", false],
          ["อุปกรณ์เสริม", "/accessories", false],
        ],
      },
      {
        label: "ลิงก์ด่วน",
        links: [
          ["เครื่องชั่งร้านค้าทั่วไป", "/scales/retail", false],
          ["เครื่องชั่งอุตสาหกรรม", "/scales/industrial", false],
          ["เครื่องชั่งประกอบเอง", "/platforms/custom-spec", false],
          ["เครื่องชั่งขนาดเล็ก", "/scales/household", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/", false],
          ["เงื่อนไขรับประกัน", "/service/warranty/policy", false],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "เครื่องชั่ง",
    href: "/scales",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["ห้องปฏิบัติการ", "/scales/laboratory", false],
          ["อุตสาหกรรม", "/scales/industrial", false],
          ["ร้านค้าและบริการ", "/scales/retail", false],
          ["ครัวเรือนและบุคคล", "/scales/household", false],
          ["จัดสเปค", "/scales/custom-spec", false],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["เชื่อมต่ออุปกรณ์", "/scales?feature=device-connection", false],
          ["กันน้ำกันฝุ่น", "/scales?feature=waterproof", false],
          ["คำนวณราคา", "/scales?feature=price-computing", false],
          ["นับจำนวน", "/scales?feature=counting", false],
          ["เตือนน้ำหนักขาดเกิน", "/scales?feature=checkweighing", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/scales/custom-spec", false],
          ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/", false],
          ["เงื่อนไขรับประกัน", "/service/warranty/policy", false],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "อินดิเคเตอร์แท่นชั่ง",
    href: "/indicators",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["อุตสาหกรรม", "/indicators/industrial", false],
          ["พาณิชยกรรมและบริการ", "/indicators/commercial", false],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["เชื่อมต่ออุปกรณ์", "/platforms/indicators?feature=connectivity", false],
          ["กันน้ำกันฝุ่น", "/platforms/indicators?feature=waterproof", false],
          ["คำนวณราคา", "/platforms/indicators?feature=price-computing", false],
          ["นับจำนวน", "/platforms/indicators?feature=counting", false],
          ["เตือนน้ำหนักขาดเกิน", "/platforms/indicators?feature=checkweighing", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          [
            "เลือกซื้ออินดิเคเตอร์",
            "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6",
            false,
          ],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "โครงสร้างแท่นชั่ง",
    href: "/platforms",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["อินดิเคเตอร์", "/platforms/indicators", false],
          ["โครงสร้างแท่นชั่ง", "/platforms/structures", false],
          ["จัดสเปค", "/platforms/custom-spec", false],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["เชื่อมต่ออุปกรณ์", "/platforms/indicators?feature=connectivity", false],
          ["กันน้ำกันฝุ่น", "/platforms/indicators?feature=waterproof", false],
          ["คำนวณราคา", "/platforms/indicators?feature=price-computing", false],
          ["นับจำนวน", "/platforms/indicators?feature=counting", false],
          ["เตือนน้ำหนักขาดเกิน", "/platforms/indicators?feature=checkweighing", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          [
            "เลือกซื้อที่ร้านออนไลน์",
            "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6",
            false,
          ],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "ระบบ POS",
    href: "/pos",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["Positive", "/pos/android", false],
          ["Hardware", "/pos/windows", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ให้คำปรึกษาแนะนำ", "/service?section=contact", false],
          ["ทดลองใช้งานจริง", "/service?section=contact", false],
          ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/", false],
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "อุปกรณ์เสริม",
    href: "/accessories",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["อุปกรณ์ส่งข้อมูล", "/accessories/cables", false],
          ["อุปกรณ์ต่อพ่วง", "/accessories/displays", false],
          ["เครื่องพิมพ์", "/accessories/printers", false],
          ["ชิ้นส่วนเสริม", "/accessories/mechanical", false],
          ["วัสดุสิ้นเปลือง", "/accessories/consumables", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["เลือกเครื่องชั่งเพื่อประกอบ", "/scales/custom-spec", false],
          ["เลือกแท่นชั่งเพื่อประกอบ", "/platforms/custom-spec", false],
          ["เลือกซื้อที่ร้านออนไลน์", "https://sunfordshop.com/", false],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "จัดสเปค",
    href: "/platforms/custom-spec",
    columns: [
      {
        label: "เลือกอุปกรณ์",
        links: [
          ["โครงสร้างแท่นชั่ง", "/platforms", false],
          ["อุปกรณ์เสริม", "/accessories", false],
          ["อินดิเคเตอร์แท่นชั่ง", "/platforms/indicators", false],
        ],
      },
      { label: "ตรวจสอบก่อนเลือก", links: [["ติดต่อเรา", "/service?section=contact", false]] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["เงื่อนไขรับประกัน", "/service/warranty/policy", false],
        ],
      },
    ],
  },
  {
    label: "บริการ",
    href: "/service",
    columns: [
      {
        label: "บริการ",
        links: [
          ["ลงทะเบียนรับประกัน", "/service/warranty/register", false],
          ["บริการหลังการขาย", "/service", false],
        ],
      },
      {
        label: "เอกสาร",
        links: [
          ["บทความ", "/service/articles", false],
          ["เกี่ยวกับผลิตภัณฑ์", "/service/technical-assistance", false],
          ["เงื่อนไขการรับประกัน", "/service/warranty/policy", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [["ติดต่อเรา", "/service?section=contact", false]],
      },
    ],
  },
];

function columns(item: Navigation) {
  return [{ label: item.submenuLabel ?? "", links: item.links }, ...(item.groups ?? [])];
}

function menuContract(items: Navigation[]): MenuContract[] {
  return items.map((item) => ({
    label: item.label,
    href: item.href,
    columns: columns(item).map((column) => ({
      label: column.label,
      links: column.links.map((link) => [link.label, link.href, Boolean(link.disabled)]),
    })),
  }));
}

test("every displayed label and column matches the owner-selected specification", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(approvedMenus.length, 8);
  assert.deepEqual(menuContract(items), approvedMenus);
});

test("Navbar displays the configured features and assistance columns", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(items.length, 8);
  assert.deepEqual(
    items.map((item) => item.groups?.length),
    [2, 2, 2, 2, 1, 1, 2, 2],
  );
  assert.deepEqual(
    items.map((item) => item.groups![0].label),
    [
      "ลิงก์ด่วน",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "ช่วยเหลือ",
      "ช่วยเหลือ",
      "ตรวจสอบก่อนเลือก",
      "เอกสาร",
    ],
  );
  assert.ok(items.every((item) => item.groups?.at(-1)?.label === "ช่วยเหลือ"));
  assert.equal(
    items.filter(
      (item) => item.groups?.[0].label === "คุณสมบัติ" && item.groups[0].links.length === 0,
    ).length,
    0,
  );
  assert.equal(
    items.flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
      .length,
    76,
  );
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  assert.equal(links.filter((link) => !link.disabled).length, 76);
  assert.equal(links.filter((link) => link.disabled).length, 0);
  assert.deepEqual(
    items.map((item) => columns(item).map((column) => column.links.length)),
    [
      [6, 4, 4],
      [5, 5, 4],
      [2, 5, 2],
      [3, 5, 3],
      [2, 5],
      [5, 4],
      [3, 1, 2],
      [2, 3, 1],
    ],
  );
  assert.deepEqual(
    items[3].links.map((link) => link.label),
    ["อินดิเคเตอร์", "โครงสร้างแท่นชั่ง", "จัดสเปค"],
  );
  assert.equal(items[3].links.length, 3);
  assert.ok(items[3].links.every((link) => !link.disabled));
});

test("readiness follows the canonical destination across contexts without disabling populated parents", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  const analytical = links.filter((link) => link.href === "/scales/laboratory");
  assert.equal(analytical.length, 1);
  assert.ok(analytical.every((link) => !link.disabled));
  const expectedLinks = approvedMenus.flatMap((item) =>
    item.columns.flatMap((column) => column.links),
  );
  assert.equal(expectedLinks.length, 76);
  const readiness = new Map<string, boolean>();
  for (const [, href, disabled] of expectedLinks) {
    if (readiness.has(href)) assert.equal(readiness.get(href), disabled, href);
    readiness.set(href, disabled);
  }
  assert.deepEqual(
    [...readiness].filter(([, disabled]) => disabled),
    [],
  );
  assert.equal(links.length, expectedLinks.length);
  for (const link of links) {
    assert.ok(readiness.has(link.href), link.href);
    assert.equal(Boolean(link.disabled), readiness.get(link.href), link.label);
  }
  assert.ok(!links.some((link) => link.href.startsWith("/solutions/")));
  for (const href of [
    "/platforms",
    "/service/technical-assistance",
    "/service/warranty/register",
    "/service?section=contact",
  ]) {
    const matching = links.filter((link) => link.href === href);
    assert.ok(matching.length > 0, href);
    assert.ok(
      matching.every((link) => !link.disabled),
      href,
    );
  }
  assert.ok(items.every((item) => item.href.startsWith("/")));
});

test("the shared Navbar gets the approved category order without mutating CMS data", () => {
  const before = JSON.stringify(defaultNavigation);
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.deepEqual(
    items.map(({ label }) => label),
    [
      "ผลิตภัณฑ์ทั้งหมด",
      ...productCategoryDefinitions.map(({ label }) => label),
      "จัดสเปค",
      "บริการ",
    ],
  );
  assert.deepEqual(
    items.slice(1, 6).map(({ href }) => href),
    productCategoryDefinitions.map(({ id }) => `/${id}`),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("scale features and scale families link to their own views", () => {
  const scales = getPrimaryNavigationItems(defaultNavigation).find(
    ({ href }) => href === "/scales",
  )!;
  assert.equal(scales.groups![0].label, "คุณสมบัติ");
  assert.equal(scales.groups![0].links.length, 5);
  assert.equal(scales.links.filter((link) => link.label === "อุตสาหกรรม").length, 1);
  assert.equal(
    scales.links.find((link) => link.label === "อุตสาหกรรม")!.href,
    "/scales/industrial",
  );
});

test("the five chapter rails keep their category labels and product destinations before catalog data is available", () => {
  const productCategories = approvedMenus.slice(1, 6);
  const scaleChapters: [string, string, boolean][] = [
    ["ครัวเรือนและบุคคล", "/scales/household", false],
    ["อุตสาหกรรม", "/scales/industrial", false],
    ["ร้านค้าและบริการ", "/scales/retail", false],
    ["งานวิเคราะห์", "/scales/laboratory", false],
  ];
  const indicatorChapters: [string, string, boolean][] = [
    ["LCD", "/indicators/lcd", false],
    ["LED", "/indicators/led", false],
  ];
  const platformChapters: [string, string, boolean][] = [
    ["แท่นชั่งตั้งพื้น", "/platforms/floor", false],
    ["แท่นชั่งตั้งโต๊ะ", "/platforms/benchtop", false],
  ];
  const accessoryChapters: [string, string, boolean][] = [
    ["อุปกรณ์ POS", "/accessories/pos", false],
    ["จอและไฟเตือน", "/accessories/displays", false],
    ["สายและหัวต่อ", "/accessories/cables", false],
    ["เครื่องพิมพ์", "/accessories/printers", false],
    ["ชิ้นส่วนแท่น", "/accessories/mechanical", false],
    ["ลูกตุ้มน้ำหนัก", "/accessories/weights", false],
    ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/accessories/electronics", false],
    ["อื่น ๆ", "/accessories/consumables", false],
  ];
  for (const ready of [[], ["/platforms/abs", "/pos/ios"]]) {
    const chapterMenus = getPrimaryNavigationItems(defaultNavigation, ready, "category-chapters");
    for (const { href, columns } of productCategories) {
      const actual = chapterMenus.find((menu) => menu.href === href)!;
      assert.deepEqual(
        actual.links.map(({ label, href, disabled }) => [label, href, Boolean(disabled)]),
        href === "/scales"
          ? scaleChapters
          : href === "/indicators"
            ? indicatorChapters
            : href === "/platforms"
              ? platformChapters
              : href === "/accessories"
                ? accessoryChapters
                : href === "/pos"
                  ? [["iOS", "/pos/ios", false], ...columns[0].links]
                  : columns[0].links,
        href,
      );
    }
  }
});

test("category overview keeps its separate feature links", () => {
  const chapterMenus = getPrimaryNavigationItems(defaultNavigation, [], "category-chapters");
  const [scales, indicators] = chapterMenus.slice(1, 3);
  assert.deepEqual(
    scales.groups![0].links.map(({ label }) => label),
    ["กันน้ำ", "ตั้งโต๊ะ", "ตั้งพื้น", "นับจำนวนชิ้น", "เตือนน้ำหนักขาด–เกิน"],
  );
  assert.deepEqual(
    indicators.groups![0].links.map(({ label }) => label),
    ["ดูจอและไฟเตือน", "เชื่อมต่อ RS232", "ดูโครงสร้างแท่นชั่ง"],
  );
});

test("product menus keep approved short names and direct parent links without changing source categories", () => {
  const before = JSON.stringify(defaultNavigation);
  const navigation = getPrimaryNavigationItems(defaultNavigation);
  const allProducts = navigation.filter(({ href }) => href === "/products");
  const items = navigation.slice(1, 6);
  const children = defaultNavigation[0].groups!.flatMap(({ links }) => links);
  assert.equal(allProducts.length, 1);
  assert.equal(allProducts[0].label, "ผลิตภัณฑ์ทั้งหมด");
  assert.equal(children.length, 21);
  assert.deepEqual(
    items.map((item) => item.links.length),
    [5, 2, 3, 2, 5],
  );
  for (const item of navigation) {
    assert.ok(item.href.startsWith("/"));
    const parentLinks = columns(item)
      .flatMap(({ links }) => links)
      .filter(({ href }) => href === item.href);
    assert.deepEqual(
      parentLinks,
      item.href === "/service" ? [{ label: "บริการหลังการขาย", href: "/service" }] : [],
    );
  }
  assert.ok(
    getPrimaryNavigationItems(defaultNavigation, [], "category-chapters")[5].groups![0].links.some(
      (link) => link.href === "/accessories/consumables",
    ),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("support destinations stay under Services and shared menu labels take precedence", () => {
  const input = defaultNavigation.map((item) =>
    item.href === "/products"
      ? { ...item, links: item.links.map((link) => ({ ...link, label: `Provided ${link.label}` })) }
      : item,
  );
  const items = getPrimaryNavigationItems(input);
  assert.deepEqual(
    items.slice(1, 6).map(({ label }) => label),
    productCategoryDefinitions.map(({ label }) => label),
  );
  assert.ok(!items.some(({ href }) => ["/about-us", "/service?section=contact"].includes(href)));
  const services = items.find(({ href }) => href === "/service")!;
  assert.deepEqual(
    services.links.map((link) => link.href),
    ["/service/warranty/register", "/service"],
  );
  const links = [...services.links, ...services.groups!.flatMap(({ links }) => links)];
  for (const href of [
    "/service/articles",
    "/service/technical-assistance",
    "/service?section=contact",
  ])
    assert.ok(links.some((link) => link.href === href));
});
test("the guide appears once at the top level and saved Services copies are removed", () => {
  const href = "/platforms/custom-spec";
  const navigation = structuredClone(defaultNavigation);
  const services = navigation.find((item) => item.href === "/service")!;
  services.links.push({ label: "จัดสเปคเครื่องชั่ง", href });
  services.groups![0].links.push({ label: "จัดสเปคเครื่องชั่ง", href });
  navigation.push({ label: "ชื่อเดิม", href, links: [] });
  const before = JSON.stringify(navigation);
  const items = getPrimaryNavigationItems(navigation);
  const guides = items.filter((item) => item.href === href);
  assert.equal(guides.length, 1);
  assert.equal(guides[0].label, "จัดสเปค");
  assert.equal(guides[0].groups?.length, 2);
  assert.deepEqual(
    guides[0].links.map((link) => link.href),
    ["/platforms", "/accessories", "/platforms/indicators"],
  );
  const result = items.find((item) => item.href === "/service")!;
  assert.equal(
    result
      .groups!.find((group) => group.label === "ช่วยเหลือ")!
      .links.filter((link) => link.href === href).length,
    0,
  );
  assert.equal(result.links.filter((link) => link.href === href).length, 0);
  assert.ok(columns(guides[0]).every((column) => column.links.every((link) => link.href !== href)));
  const indicatorHelp = items.find((item) => item.href === "/indicators")!;
  assert.ok(
    !columns(indicatorHelp).some((column) => column.links.some((link) => link.href === href)),
  );
  assert.equal(JSON.stringify(navigation), before);
});

test("saved disabled links are preserved after alias normalization without mutating the source", () => {
  const navigation = structuredClone(defaultNavigation);
  const commercial = navigation[1].groups![0].links[0];
  commercial.disabled = true;
  const before = JSON.stringify(navigation);
  const matching = getPrimaryNavigationItems(navigation)
    .flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
    .filter((link) => link.href === "/scales/retail");
  assert.equal(matching.length, 2);
  assert.ok(matching.every((link) => link.disabled));
  assert.equal(JSON.stringify(navigation), before);
});

test("the scanner Navbar listing is separate from POS accessories and keeps chapter behavior", () => {
  const href = "/accessories/pos";
  const scanners = "/accessories/scanners-and-cash-drawers";
  const navigation = structuredClone(defaultNavigation);
  navigation[0].links.push({
    label: "อุปกรณ์ POS",
    href: "/products?category=accessories&subcategory=accessory-pos",
    disabled: true,
  });
  for (const [source, surface, accessoriesDisabled] of [
    [defaultNavigation, "navbar", false],
    [defaultNavigation, "category-chapters", false],
    [navigation, "navbar", true],
    [navigation, "category-chapters", true],
  ] as const) {
    const menus = getPrimaryNavigationItems(source, [href], surface);
    const accessories = menus.find((menu) => menu.href === "/accessories")!;
    const pos = menus.find((menu) => menu.href === "/pos")!;
    const accessoryLink = accessories.links.find((link) => link.href === href);
    if (surface === "navbar") assert.equal(accessoryLink, undefined);
    else assert.equal(Boolean(accessoryLink!.disabled), accessoriesDisabled);
    const scannerLink = pos.groups![0].links.find((link) => link.label === "สแกนเนอร์และลิ้นชัก");
    assert.equal(scannerLink?.href, surface === "category-chapters" ? scanners : undefined);
    assert.equal(Boolean(scannerLink?.disabled), false);
  }
});

test("catalog destinations stay linked for every runtime inventory while an explicit saved disable takes precedence", () => {
  const paths = ["/scales/laboratory", "/pos/windows"];
  const links = (ready?: string[], navigation = defaultNavigation) =>
    getPrimaryNavigationItems(navigation, ready).flatMap((item) =>
      columns(item).flatMap((column) => column.links),
    );
  for (const ready of [undefined, [paths[0]], [], paths]) {
    const entries = links(ready);
    assert.equal(entries.length, 76);
    assert.equal(entries.filter((entry) => !entry.disabled).length, 76);
    for (const path of paths) {
      const matching = entries.filter(({ href }) => href === path);
      assert.equal(matching.length, 1, path);
      assert.equal(Boolean(matching[0].disabled), false, path);
    }
  }
  const navigation = structuredClone(defaultNavigation);
  navigation[0].links.push({ href: "/product/laboratory", label: "งานวิเคราะห์", disabled: true });
  assert.ok(links(paths, navigation).find(({ href }) => href === paths[0])?.disabled);
});

test("the Platform menu uses the appropriate feature links for the selected product", () => {
  const menus = getPrimaryNavigationItems(defaultNavigation);
  const features = menus.find(({ href }) => href === "/platforms")!.groups![0].linksByProduct!;
  assert.deepEqual(
    features["/platforms/indicators"],
    menus.find(({ href }) => href === "/indicators")!.groups![0].links,
  );
  assert.deepEqual(
    features["/platforms/structures"].map(({ label, href, disabled }) => [
      label,
      href,
      Boolean(disabled),
    ]),
    [
      ["Bench-top", "/platforms/structures?type=bench-top", false],
      ["Mini-floor", "/platforms/structures?type=mini-floor", false],
      ["Standard-floor", "/platforms/structures?type=standard-floor", false],
      ["High-Leg", "/platforms/structures?type=high-leg", false],
      ["Weighing desk", "/platforms/structures?type=weighing-desk", false],
    ],
  );
});
