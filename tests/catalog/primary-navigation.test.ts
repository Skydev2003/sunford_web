import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";

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
          ["ระบบ POS", "/products/category/pos", false],
          ["เครื่องชั่ง", "/products/category/scales", false],
          ["อุปกรณ์เสริม", "/products/category/accessories", false],
          ["โครงสร้างแท่นชั่ง", "/products/category/platforms", false],
          ["อินดิเคเตอร์แท่นชั่ง", "/products/category/indicators", false],
        ],
      },
      {
        label: "การใช้งาน",
        links: [
          ["ครัวและกาแฟ", "/products/category/scales/kitchen", false],
          ["ซอฟต์แวร์ POS", "/applications-and-softwares", false],
          ["คำนวณราคาและงานขาย", "/products/category/scales/price", false],
          ["งานผลิตและอุตสาหกรรม", "/products/category/scales/industrial", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["คู่มือและสเปก", "/technical-specification", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
          ["เงื่อนไขรับประกัน", "/warranty/policy", false],
          ["ลงทะเบียนรับประกัน", "/warranty/register", false],
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
          ["ครัวเรือน", "/products/category/scales/kitchen", false],
          ["การผลิต", "/products/category/scales/industrial", false],
          ["คำนวณราคา", "/products/category/scales/price", false],
          ["งานวิเคราะห์", "/products/category/scales/analytical", true],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["นับจำนวนชิ้น", "/products/category/scales/counting", false],
          ["เตือนน้ำหนักขาด–เกิน", "/products/category/scales/checkweighing", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
          ["ลงทะเบียนรับประกัน", "/warranty/register", false],
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
          ["LCD", "/products/category/indicators/lcd", false],
          ["LED", "/products/category/indicators/led", false],
        ],
      },
      {
        label: "คุณสมบัติ",
        links: [
          ["เชื่อมต่อ RS232", "/products/category/indicators/rs232", false],
          ["ตัวเครื่องกันน้ำ IP67", "/products/category/indicators/waterproof", true],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
          ["คู่มือเลือกหัวอ่านและแท่นชั่ง", "/guides/indicator-platform-compatibility", false],
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
          ["สแตนเลส SUS304", "/products/category/platforms/sus304", true],
          ["สแตนเลส SUS201", "/products/category/platforms/sus201", true],
          ["แท่นเหล็กคาร์บอน", "/products/category/platforms/carbon-steel", true],
          ["พลาสติก ABS เหนียวพิเศษ", "/products/category/platforms/abs", true],
        ],
      },
      {
        label: "เลือกอุปกรณ์ร่วม",
        links: [
          ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical", false],
          ["อินดิเคเตอร์แท่นชั่ง", "/products/category/indicators", false],
          ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
          ["สอบถามรุ่นและสเปก", "/contact-us", false],
          ["คู่มือเลือกหัวอ่านและแท่นชั่ง", "/guides/indicator-platform-compatibility", false],
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
          ["iOS", "/products/category/pos/ios", true],
          ["Android", "/products/category/pos/android", false],
          ["Windows", "/products/category/pos/windows", false],
        ],
      },
      {
        label: "ระบบและอุปกรณ์",
        links: [
          ["เครื่องพิมพ์", "/products/category/accessories/printers", false],
          [
            "สแกนเนอร์และลิ้นชัก",
            "/products/category/accessories/scanners-and-cash-drawers",
            false,
          ],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["คู่มือและสเปก", "/technical-specification", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
          ["ลงทะเบียนรับประกัน", "/warranty/register", false],
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
          ["อุปกรณ์ POS", "/products/category/accessories/pos", false],
          ["จอและไฟเตือน", "/products/category/accessories/displays", false],
          ["สายและหัวต่อ", "/products/category/accessories/cables", false],
          ["เครื่องพิมพ์", "/products/category/accessories/printers", false],
          ["ชิ้นส่วนแท่น", "/products/category/accessories/mechanical", false],
          ["ลูกตุ้มน้ำหนัก", "/products/category/accessories/weights", false],
          ["โหลดเซลล์และอะไหล่อิเล็กทรอนิกส์", "/products/category/accessories/electronics", false],
        ],
      },
      {
        label: "วัสดุสิ้นเปลือง",
        links: [
          ["กระดาษและฉลาก", "/products/category/accessories/consumables", false],
          ["กระดาษความร้อน", "/products/category/accessories/thermal-paper", false],
          ["ฉลากและสติ๊กเกอร์", "/products/category/accessories/labels", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
          ["เงื่อนไขรับประกัน", "/warranty/policy", false],
          ["สอบถามอุปกรณ์ที่ใช้ร่วมกัน", "/contact-us", false],
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
          ["เลือกแท่นชั่ง", "/products/category/platforms", false],
          ["ดูอุปกรณ์เสริม", "/products/category/accessories", false],
          ["เลือกอินดิเคเตอร์", "/products/category/indicators", false],
        ],
      },
      { label: "ตรวจสอบก่อนเลือก", links: [["สอบถามความเข้ากันได้", "/contact-us", false]] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อฝ่ายบริการ", "/contact-us", false],
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
        ],
      },
      {
        label: "ซอฟต์แวร์และเอกสาร",
        links: [
          ["คู่มือและสเปก", "/technical-specification", false],
          ["ดาวน์โหลดซอฟต์แวร์", "/software/download", false],
          ["ซอฟต์แวร์และสิทธิ์ใช้งาน", "/applications-and-softwares", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ติดต่อเรา", "/contact-us", false],
          ["เงื่อนไขรับประกัน", "/warranty/policy", false],
          ["เกี่ยวกับ SUNFORD", "/about-us", false],
          ["นโยบายยกเลิกและคืนสินค้า", "/cancel-and-return/policy", false],
        ],
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

test("owner-approved Navbar keeps 79 entries in three columns with 72 ready and 7 unavailable", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(items.length, 8);
  assert.ok(items.every((item) => item.groups?.length === 2));
  assert.deepEqual(
    items.map((item) => item.groups![0].label),
    [
      "การใช้งาน",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "เลือกอุปกรณ์ร่วม",
      "ระบบและอุปกรณ์",
      "วัสดุสิ้นเปลือง",
      "ตรวจสอบก่อนเลือก",
      "ซอฟต์แวร์และเอกสาร",
    ],
  );
  assert.ok(items.every((item) => item.groups?.[1].label === "ช่วยเหลือ"));
  assert.equal(
    items.flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
      .length,
    79,
  );
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  assert.equal(links.filter((link) => !link.disabled).length, 72);
  assert.equal(links.filter((link) => link.disabled).length, 7);
  assert.deepEqual(
    items.map((item) => columns(item).map((column) => column.links.length)),
    [
      [5, 4, 4],
      [4, 2, 3],
      [2, 2, 3],
      [4, 3, 4],
      [3, 2, 4],
      [7, 3, 4],
      [3, 1, 3],
      [2, 3, 4],
    ],
  );
  const pos = items.find((item) => item.href === "/products/category/pos")!;
  assert.ok(
    pos.groups![0].links.every((link) => !pos.links.some((primary) => primary.href === link.href)),
    "POS operating systems must not repeat in the equipment column",
  );
  assert.deepEqual(
    items[3].links.map((link) => link.label),
    ["สแตนเลส SUS304", "สแตนเลส SUS201", "แท่นเหล็กคาร์บอน", "พลาสติก ABS เหนียวพิเศษ"],
  );
  assert.equal(items[3].links.length, 4);
  assert.ok(items[3].links.every((link) => link.disabled));
  for (const item of items)
    for (const column of [
      ...(item.href === "/products/category/scales" ? [] : [item.links]),
      ...item.groups!.map((group) => group.links),
    ])
      assert.ok(
        column.every((link, index) => {
          if (!index) return true;
          const previous = column[index - 1].label;
          const first = previous.endsWith("ทั้งหมด");
          const next = link.label.endsWith("ทั้งหมด");
          return first !== next ? first : previous.length <= link.label.length;
        }),
      );
});

test("readiness follows the canonical destination across contexts without disabling populated parents", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  const analytical = links.filter((link) => link.href === "/products/category/scales/analytical");
  assert.equal(analytical.length, 1);
  assert.ok(analytical.every((link) => link.disabled));
  const expectedLinks = approvedMenus.flatMap((item) =>
    item.columns.flatMap((column) => column.links),
  );
  assert.equal(expectedLinks.length, 79);
  const readiness = new Map<string, boolean>();
  for (const [, href, disabled] of expectedLinks) {
    if (readiness.has(href)) assert.equal(readiness.get(href), disabled, href);
    readiness.set(href, disabled);
  }
  assert.equal([...readiness.values()].filter(Boolean).length, 7);
  assert.equal(links.length, expectedLinks.length);
  for (const link of links) {
    assert.ok(readiness.has(link.href), link.href);
    assert.equal(Boolean(link.disabled), readiness.get(link.href), link.label);
  }
  assert.ok(!links.some((link) => link.href.startsWith("/solutions/")));
  for (const href of [
    "/products/category/platforms",
    "/applications-and-softwares",
    "/warranty/register",
    "/contact-us",
  ]) {
    const matching = links.filter((link) => link.href === href);
    assert.ok(matching.length > 0, href);
    assert.ok(
      matching.every((link) => !link.disabled),
      href,
    );
  }
  assert.ok(links.some((link) => link.href === "/software/download" && !link.disabled));
  assert.ok(items.every((item) => item.href.startsWith("/")));
});

test("both Header consumers get the approved category order without mutating CMS data", () => {
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

test("product functions link to dedicated listings separate from machine families", () => {
  const scales = getPrimaryNavigationItems(defaultNavigation).find(
    ({ href }) => href === "/products/category/scales",
  )!;
  assert.deepEqual(
    scales.groups![0].links.map((link) => link.label),
    ["นับจำนวนชิ้น", "เตือนน้ำหนักขาด–เกิน"],
  );
  assert.equal(scales.links.filter((link) => link.label === "การผลิต").length, 1);
  assert.equal(
    scales.links.find((link) => link.label === "การผลิต")!.href,
    "/products/category/scales/industrial",
  );
  assert.ok(scales.groups![0].links.every((link) => !link.disabled));
});

test("category chapter rails retain their existing links when the Navbar is shortened", () => {
  const chapterMenus = getPrimaryNavigationItems(defaultNavigation, [], "category-chapters");
  const [scales, indicators] = chapterMenus.slice(1, 3);
  assert.deepEqual(
    scales.links.map(({ label }) => label),
    [
      "มีเสา",
      "ตั้งโต๊ะ",
      "ตั้งพื้น",
      "คำนวณราคา",
      "อุตสาหกรรม",
      "ครัวและกาแฟ",
      "งานวิเคราะห์",
      "กันน้ำ–กันฝุ่น",
    ],
  );
  assert.deepEqual(
    indicators.links.map(({ label }) => label),
    ["LCD", "LED", "กันน้ำ"],
  );
  assert.ok(indicators.links.at(-1)?.disabled);
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
  assert.deepEqual(
    allProducts[0].links.toSorted((a, b) => a.href.localeCompare(b.href)),
    ["เครื่องชั่ง", "อินดิเคเตอร์แท่นชั่ง", "โครงสร้างแท่นชั่ง", "ระบบ POS", "อุปกรณ์เสริม"]
      .map((label, index) => ({
        label,
        href: items[index].href,
      }))
      .toSorted((a, b) => a.href.localeCompare(b.href)),
  );
  assert.deepEqual(
    allProducts[0].groups?.map((group) => group.links.map((link) => link.href)),
    [
      [
        "/products/category/scales/kitchen",
        "/applications-and-softwares",
        "/products/category/scales/price",
        "/products/category/scales/industrial",
      ],
      ["/technical-specification", "/contact-us", "/warranty/policy", "/warranty/register"],
    ],
  );
  assert.equal(children.length, 23);
  assert.deepEqual(
    items.map((item) => item.links.length),
    [4, 2, 4, 3, 7],
  );
  for (const item of navigation) {
    assert.ok(item.href.startsWith("/"));
    assert.ok(
      columns(item).every((column) => column.links.every((link) => link.href !== item.href)),
    );
  }
  assert.ok(
    navigation[5].groups![0].links.some(
      (link) => link.href === "/products/category/accessories/consumables",
    ),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("company destinations stay under Services and provided navigation labels stay authoritative", () => {
  const input = defaultNavigation.map((item) =>
    item.href === "/products"
      ? { ...item, links: item.links.map((link) => ({ ...link, label: `Provided ${link.label}` })) }
      : item,
  );
  const items = getPrimaryNavigationItems(input);
  assert.deepEqual(
    items.slice(1, 6).map(({ label }) => label),
    productCategoryDefinitions.map(({ label }) => `Provided ${label}`),
  );
  assert.ok(!items.some(({ href }) => ["/about-us", "/contact-us"].includes(href)));
  const services = items.find(({ href }) => href === "/service")!;
  assert.deepEqual(
    services.links.map((link) => link.href),
    ["/service/quotation", "/warranty/register"],
  );
  const links = [...services.links, ...services.groups!.flatMap(({ links }) => links)];
  for (const href of ["/about-us", "/contact-us", "/warranty/register"])
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
    columns(indicatorHelp).some((column) => column.links.some((link) => link.href === href)),
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
  assert.equal(matching.length, 2);
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
    [defaultNavigation, "category-chapters", true],
    [navigation, "navbar", true],
  ] as const) {
    const menus = getPrimaryNavigationItems(source, [href], surface);
    const accessories = menus.find((menu) => menu.href === "/products/category/accessories")!;
    const pos = menus.find((menu) => menu.href === "/products/category/pos")!;
    assert.equal(
      Boolean(accessories.links.find((link) => link.href === href)!.disabled),
      accessoriesDisabled,
    );
    const scannerLink = pos.groups![0].links.find((link) => link.label === "สแกนเนอร์และลิ้นชัก");
    assert.equal(scannerLink?.href, surface === "navbar" ? scanners : href);
    assert.equal(Boolean(scannerLink?.disabled), surface === "category-chapters");
  }
});

test("the seven gated menu entries open individually from readiness while saved disables take precedence", () => {
  const paths = [
    "/products/category/scales/analytical",
    "/products/category/indicators/waterproof",
    "/products/category/platforms/carbon-steel",
    "/products/category/platforms/sus304",
    "/products/category/platforms/sus201",
    "/products/category/platforms/abs",
    "/products/category/pos/ios",
  ];
  const links = (ready?: string[], navigation = defaultNavigation) =>
    getPrimaryNavigationItems(navigation, ready).flatMap((item) =>
      columns(item).flatMap((column) => column.links),
    );
  for (const ready of [undefined, [paths[0]], [], paths]) {
    const entries = links(ready);
    assert.equal(entries.length, 79);
    assert.equal(entries.filter((entry) => !entry.disabled).length, 72 + (ready?.length ?? 0));
    for (const path of paths) {
      const matching = entries.filter(({ href }) => href === path);
      assert.equal(matching.length, 1, path);
      assert.equal(Boolean(matching[0].disabled), !ready?.includes(path), path);
    }
  }
  const navigation = structuredClone(defaultNavigation);
  navigation[0].links.push({ href: "/product/laboratory", label: "งานวิเคราะห์", disabled: true });
  assert.ok(links(paths, navigation).find(({ href }) => href === paths[0])?.disabled);
});
