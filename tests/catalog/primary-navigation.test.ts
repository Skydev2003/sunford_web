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
      ["เครื่องชั่ง", "/products/category/scales"],
      ["แท่นชั่ง", "/products/category/platforms"],
      ["อินดิเคเตอร์", "/products/category/indicators"],
      ["จัดสเปค", "/guides/indicator-platform-compatibility"],
      ["ซอฟต์แวร์", "/software/download"],
      ["อุปกรณ์เสริม", "/products/category/accessories"],
      ["POS", "/products/category/pos"],
      ["MES", "/solution/mes"],
      ["โซลูชัน", "/solutions"],
      ["บริการช่วยเหลือ", "/service"],
    ],
  );
  assert.deepEqual(menus[5], {
    label: "ซอฟต์แวร์",
    href: "/software/download",
    submenuLabel: "ซอฟต์แวร์",
    links: [
      { label: "การพาณิชย์และค้าปลีก", href: "/software/download#retail-software" },
      { label: "การผลิตอุตสาหกรรม", href: "/software/download#industrial-software" },
      { label: "ครัวเรือนและสุขภาพ", href: "/software/download#household-software" },
    ],
    groups: [
      { label: "ช่วยเหลือ", links: [{ label: "ติดต่อเรา", href: "/service?section=contact" }] },
    ],
  });
  assert.deepEqual(menus[8], {
    label: "MES",
    href: "/solution/mes",
    submenuLabel: "สินค้า",
    links: [
      { label: "ควบคุมชุดการผลิต", href: "/solution/mes/batch-control" },
      { label: "ควบคุมสูตรการผลิต", href: "/solution/mes/formula-control" },
    ],
    groups: [
      { label: "ช่วยเหลือ", links: [{ label: "ติดต่อเรา", href: "/service?section=contact" }] },
    ],
  });
  assert.deepEqual(menuContract([menus[9]]), [
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
            ["ตั้งค่าพารามิเตอร์และรูปแบบการรับส่งข้อมูล", "", true],
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
            ["บันทึกรายงานการชั่งบน Android (ขั้นสูง)", "", true],
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
  assert.ok(menus[10].links.some(({ href }) => href === "/warranty/register"));
});

test("Navbar submenu links add a catalogue section and only seed the matching feature", () => {
  const targets = [
    ["/products/category/scales", "/products/category/scales#product-lineup-scales"],
    [
      "/products/category/indicators/lcd",
      "/products/category/indicators/lcd#product-listing-indicators",
    ],
    [
      "/products/category/indicators/rs232",
      "/products/category/indicators/rs232?feature=indicator-rs232#product-listing-indicators",
    ],
    [
      "/products/category/indicators/waterproof",
      "/products/category/indicators/waterproof?feature=ip67#product-listing-indicators",
    ],
    [
      "/products/category/scales/counting?trace=keep",
      "/products/category/scales/counting?trace=keep&feature=scale-counting#product-listing-scales",
    ],
    [
      "/products/category/accessories/thermal-paper",
      "/products/category/accessories/thermal-paper#product-listing-accessories",
    ],
    ["/software/download#retail-software", "/software/download#retail-software"],
    ["/warranty/policy", "/warranty/policy"],
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
          ["เครื่องชั่ง", "/products/category/scales", false],
          ["โครงสร้างแท่นชั่ง", "/products/category/platforms", false],
          ["อินดิเคเตอร์", "/products/category/indicators", false],
          ["ระบบ POS", "/products/category/pos", false],
          ["ระบบ MES", "/solution/mes", false],
          ["อุปกรณ์เสริม", "/products/category/accessories", false],
        ],
      },
      {
        label: "ลิงก์ด่วน",
        links: [
          ["เลือกซื้อสินค้า", "https://sunfordshop.com/", false],
          ["ลงทะเบียนรับประกัน", "/warranty/register", false],
          ["ใบเสนอราคา", "/service/quotation", false],
        ],
      },
    ],
  },
  {
    label: "เครื่องชั่ง",
    href: "/products/category/scales",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["ห้องปฏิบัติการ", "/products/category/scales/analytical", false],
          ["อุตสาหกรรม", "/products/category/scales/industrial", false],
          ["พาณิชยกรรมและบริการ", "/products/category/scales/price", false],
          ["ไลฟ์สไตล์", "/products/category/scales/kitchen", false],
        ],
      },
      { label: "คุณสมบัติ", links: [] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["เลือกซื้อเครื่องชั่ง", "https://sunfordshop.com/", false],
          ["เงื่อนไขรับประกัน", "/warranty/policy", false],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "อินดิเคเตอร์แท่นชั่ง",
    href: "/products/category/indicators",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["อุตสาหกรรม", "/products/category/indicators/industrial", false],
          ["พาณิชยกรรมและบริการ", "/products/category/indicators/commercial", false],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["เชื่อมต่ออุปกรณ์", "/products/category/indicators/rs232", false],
          ["กันน้ำกันฝุ่น", "/products/category/indicators/waterproof", false],
          ["คำนวณราคา", "", true],
          ["นับจำนวน", "", true],
          ["เตือนน้ำหนักขาดเกิน", "", true],
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
    href: "/products/category/platforms",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["แท่นชั่งตั้งโต๊ะ", "/products/category/platforms/benchtop", false],
          ["แท่นชั่งตั้งพื้น", "/products/category/platforms/floor", false],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["สแตนเลส 304", "/products/category/platforms/sus304", false],
          ["สแตนเลส 201", "/products/category/platforms/sus201", false],
          ["เหล็กคาร์บอน", "/products/category/platforms/carbon-steel", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          [
            "เลือกซื้อแท่นชั่ง",
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
    href: "/products/category/pos",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["Android", "/products/category/pos/android", false],
          ["Windows", "/products/category/pos/windows", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          [
            "เลือกซื้อเครื่อง POS",
            "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/18/SUNFORD%20POS%20&%20Gadget",
            false,
          ],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "อุปกรณ์เสริม",
    href: "/products/category/accessories",
    columns: [
      {
        label: "สินค้า",
        links: [
          ["อุปกรณ์ส่งข้อมูล", "/products/category/accessories/cables", false],
          ["อุปกรณ์ต่อพ่วง", "/products/category/accessories/displays", false],
          ["เครื่องพิมพ์", "/products/category/accessories/printers", false],
          ["ชิ้นส่วนเสริม", "/products/category/accessories/mechanical", false],
          ["วัสดุสิ้นเปลือง", "/products/category/accessories/consumables", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          [
            "เลือกซื้ออุปกรณ์เสริม",
            "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6",
            false,
          ],
          ["ติดต่อเรา", "/service?section=contact", false],
        ],
      },
    ],
  },
  {
    label: "จัดสเปค",
    href: "/guides/indicator-platform-compatibility",
    columns: [
      {
        label: "เลือกอุปกรณ์",
        links: [
          ["โครงสร้างแท่นชั่ง", "/products/category/platforms", false],
          ["อุปกรณ์เสริม", "/products/category/accessories", false],
          ["อินดิเคเตอร์แท่นชั่ง", "/products/category/indicators", false],
        ],
      },
      { label: "ตรวจสอบก่อนเลือก", links: [["ติดต่อเรา", "/service?section=contact", false]] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["เงื่อนไขรับประกัน", "/warranty/policy", false],
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
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ลงทะเบียนรับประกัน", "/warranty/register", false],
          ["บริการหลังการขาย", "/service", false],
        ],
      },
      {
        label: "เอกสาร",
        links: [
          ["บทความ", "/business/blogs/editorial", false],
          ["เกี่ยวกับผลิตภัณฑ์", "/support/technical-assistance", false],
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

test("Navbar reserves a live feature column for scales beside the configured entries", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(items.length, 8);
  assert.deepEqual(
    items.map((item) => item.groups?.length),
    [1, 2, 2, 2, 1, 1, 2, 2],
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
  assert.ok(items.slice(1).every((item) => item.groups?.at(-1)?.label === "ช่วยเหลือ"));
  assert.equal(
    items.filter(
      (item) => item.groups?.[0].label === "คุณสมบัติ" && item.groups[0].links.length === 0,
    ).length,
    1,
  );
  assert.equal(
    items.flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
      .length,
    55,
  );
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  assert.equal(links.filter((link) => !link.disabled).length, 52);
  assert.equal(links.filter((link) => link.disabled).length, 3);
  assert.deepEqual(
    items.map((item) => columns(item).map((column) => column.links.length)),
    [
      [6, 3],
      [4, 0, 3],
      [2, 5, 2],
      [2, 3, 2],
      [2, 2],
      [5, 2],
      [3, 1, 2],
      [3, 2, 1],
    ],
  );
  assert.deepEqual(
    items[3].links.map((link) => link.label),
    ["แท่นชั่งตั้งโต๊ะ", "แท่นชั่งตั้งพื้น"],
  );
  assert.equal(items[3].links.length, 2);
  assert.ok(items[3].links.every((link) => !link.disabled));
});

test("readiness follows the canonical destination across contexts without disabling populated parents", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  const analytical = links.filter((link) => link.href === "/products/category/scales/analytical");
  assert.equal(analytical.length, 1);
  assert.ok(analytical.every((link) => !link.disabled));
  const expectedLinks = approvedMenus.flatMap((item) =>
    item.columns.flatMap((column) => column.links),
  );
  assert.equal(expectedLinks.length, 55);
  const readiness = new Map<string, boolean>();
  for (const [, href, disabled] of expectedLinks) {
    if (readiness.has(href)) assert.equal(readiness.get(href), disabled, href);
    readiness.set(href, disabled);
  }
  assert.deepEqual(
    [...readiness].filter(([, disabled]) => disabled),
    [["", true]],
  );
  assert.equal(links.length, expectedLinks.length);
  for (const link of links) {
    assert.ok(readiness.has(link.href), link.href);
    assert.equal(Boolean(link.disabled), readiness.get(link.href), link.label);
  }
  assert.ok(!links.some((link) => link.href.startsWith("/solutions/")));
  for (const href of [
    "/products/category/platforms",
    "/support/technical-assistance",
    "/warranty/register",
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
    productCategoryDefinitions.map(({ id }) => `/products/category/${id}`),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("the configured scale families stay separate from live filters", () => {
  const scales = getPrimaryNavigationItems(defaultNavigation).find(
    ({ href }) => href === "/products/category/scales",
  )!;
  assert.deepEqual(scales.groups![0], { label: "คุณสมบัติ", links: [] });
  assert.equal(scales.links.filter((link) => link.label === "อุตสาหกรรม").length, 1);
  assert.equal(
    scales.links.find((link) => link.label === "อุตสาหกรรม")!.href,
    "/products/category/scales/industrial",
  );
});

test("the five chapter rails keep their category labels and product destinations before catalog data is available", () => {
  const productCategories = approvedMenus.slice(1, 6);
  const scaleChapters: [string, string, boolean][] = [
    ["ครัวเรือนและบุคคล", "/products/category/scales/kitchen", false],
    ["อุตสาหกรรม", "/products/category/scales/industrial", false],
    ["ร้านค้าและบริการ", "/products/category/scales/price", false],
    ["งานวิเคราะห์", "/products/category/scales/analytical", false],
  ];
  const indicatorChapters: [string, string, boolean][] = [
    ["LCD", "/products/category/indicators/lcd", false],
    ["LED", "/products/category/indicators/led", false],
  ];
  const accessoryChapters: [string, string, boolean][] = [
    ["อุปกรณ์ POS", "/products/category/accessories/pos", false],
    ["จอและไฟเตือน", "/products/category/accessories/displays", false],
    ["สายและหัวต่อ", "/products/category/accessories/cables", false],
    ["เครื่องพิมพ์", "/products/category/accessories/printers", false],
    ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical", false],
    ["ลูกตุ้มน้ำหนัก", "/products/category/accessories/weights", false],
    ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics", false],
    ["อื่น ๆ", "/products/category/accessories/consumables", false],
  ];
  for (const ready of [[], ["/products/category/platforms/abs", "/products/category/pos/ios"]]) {
    const chapterMenus = getPrimaryNavigationItems(defaultNavigation, ready, "category-chapters");
    for (const { href, columns } of productCategories) {
      const actual = chapterMenus.find((menu) => menu.href === href)!;
      assert.deepEqual(
        actual.links.map(({ label, href, disabled }) => [label, href, Boolean(disabled)]),
        href === "/products/category/scales"
          ? scaleChapters
          : href === "/products/category/indicators"
            ? indicatorChapters
            : href === "/products/category/platforms"
              ? columns[0].links.toReversed()
              : href === "/products/category/accessories"
                ? accessoryChapters
                : href === "/products/category/pos"
                  ? [["iOS", "/products/category/pos/ios", false], ...columns[0].links]
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
    [4, 2, 2, 2, 5],
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
      (link) => link.href === "/products/category/accessories/consumables",
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
    ["/service/quotation", "/warranty/register", "/service"],
  );
  const links = [...services.links, ...services.groups!.flatMap(({ links }) => links)];
  for (const href of [
    "/business/blogs/editorial",
    "/support/technical-assistance",
    "/service?section=contact",
  ])
    assert.ok(links.some((link) => link.href === href));
});
test("the guide appears once at the top level and saved Services copies are removed", () => {
  const href = "/guides/indicator-platform-compatibility";
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
    [
      "/products/category/platforms",
      "/products/category/accessories",
      "/products/category/indicators",
    ],
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
  const indicatorHelp = items.find((item) => item.href === "/products/category/indicators")!;
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
    .filter((link) => link.href === "/products/category/scales/price");
  assert.equal(matching.length, 1);
  assert.ok(matching.every((link) => link.disabled));
  assert.equal(JSON.stringify(navigation), before);
});

test("the scanner Navbar listing is separate from POS accessories and keeps chapter behavior", () => {
  const href = "/products/category/accessories/pos";
  const scanners = "/products/category/accessories/scanners-and-cash-drawers";
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
    const accessories = menus.find((menu) => menu.href === "/products/category/accessories")!;
    const pos = menus.find((menu) => menu.href === "/products/category/pos")!;
    const accessoryLink = accessories.links.find((link) => link.href === href);
    if (surface === "navbar") assert.equal(accessoryLink, undefined);
    else assert.equal(Boolean(accessoryLink!.disabled), accessoriesDisabled);
    const scannerLink = pos.groups![0].links.find((link) => link.label === "สแกนเนอร์และลิ้นชัก");
    assert.equal(scannerLink?.href, surface === "category-chapters" ? scanners : undefined);
    assert.equal(Boolean(scannerLink?.disabled), false);
  }
});

test("catalog destinations stay linked for every runtime inventory while an explicit saved disable takes precedence", () => {
  const paths = [
    "/products/category/scales/analytical",
    "/products/category/platforms/floor",
    "/products/category/platforms/benchtop",
    "/products/category/pos/windows",
  ];
  const links = (ready?: string[], navigation = defaultNavigation) =>
    getPrimaryNavigationItems(navigation, ready).flatMap((item) =>
      columns(item).flatMap((column) => column.links),
    );
  for (const ready of [undefined, [paths[0]], [], paths]) {
    const entries = links(ready);
    assert.equal(entries.length, 55);
    assert.equal(entries.filter((entry) => !entry.disabled).length, 52);
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
