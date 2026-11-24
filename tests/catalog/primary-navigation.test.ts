import assert from "node:assert/strict";
import test from "node:test";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";
import { productCategoryDefinitions } from "../../src/features/catalog/data/mock-categories";
import { catalogSubmenuDestination } from "../../src/features/catalog/data/catalog-submenu-destinations";

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
          ["เครื่องชั่งคำนวณราคา", "/products/category/scales/price", false],
          ["เครื่องชั่งครัวและกาแฟ", "/products/category/scales/kitchen", false],
          ["เครื่องชั่งสำหรับโรงงาน", "/products/category/scales/industrial", false],
          ["ดาวน์โหลดซอฟต์แวร์ POS", "/software/download#retail-software", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["คู่มือและสเปก", "/technical-specification", false],
          ["ติดต่อเรา", "/service?section=contact", false],
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
          ["เครื่องชั่งครัวและกาแฟ", "/products/category/scales/kitchen", false],
          ["เครื่องชั่งสำหรับโรงงาน", "/products/category/scales/industrial", false],
          ["เครื่องชั่งคำนวณราคา", "/products/category/scales/price", false],
          ["งานวิเคราะห์", "/products/category/scales/analytical", false],
        ],
      },
      { label: "คุณสมบัติ", links: [] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อเรา", "/service?section=contact", false],
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
      { label: "คุณสมบัติ", links: [] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อเรา", "/service?section=contact", false],
          ["จัดสเปค", "/guides/indicator-platform-compatibility", false],
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
          ["สแตนเลส SUS304", "/products/category/platforms/sus304", false],
          ["สแตนเลส SUS201", "/products/category/platforms/sus201", false],
          ["แท่นเหล็กคาร์บอน", "/products/category/platforms/carbon-steel", false],
          ["พลาสติก ABS", "/products/category/platforms/abs", false],
        ],
      },
      { label: "คุณสมบัติ", links: [] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อเรา", "/service?section=contact", false],
          ["จัดสเปค", "/guides/indicator-platform-compatibility", false],
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
          ["iOS", "/products/category/pos/ios", false],
          ["Android", "/products/category/pos/android", false],
          ["Windows", "/products/category/pos/windows", false],
        ],
      },
      { label: "คุณสมบัติ", links: [] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["คู่มือและสเปก", "/technical-specification", false],
          ["ติดต่อเรา", "/service?section=contact", false],
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
          ["อื่น ๆ", "/products/category/accessories/consumables", false],
        ],
      },
      { label: "คุณสมบัติ", links: [] },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ขอใบเสนอราคา", "/service/quotation", false],
          ["ติดต่อเรา", "/service?section=contact", false],
          ["เงื่อนไขรับประกัน", "/warranty/policy", false],
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
        ],
      },
      {
        label: "ซอฟต์แวร์และเอกสาร",
        links: [
          ["คู่มือและสเปก", "/technical-specification", false],
          ["ดาวน์โหลดซอฟต์แวร์", "/software/download", false],
        ],
      },
      {
        label: "ช่วยเหลือ",
        links: [
          ["ติดต่อเรา", "/service?section=contact", false],
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

test("Navbar reserves five live feature columns beside the configured entries", () => {
  const items = getPrimaryNavigationItems(defaultNavigation);
  assert.equal(items.length, 8);
  assert.ok(items.every((item) => item.groups?.length === 2));
  assert.deepEqual(
    items.map((item) => item.groups![0].label),
    [
      "การใช้งาน",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "คุณสมบัติ",
      "ตรวจสอบก่อนเลือก",
      "ซอฟต์แวร์และเอกสาร",
    ],
  );
  assert.ok(items.every((item) => item.groups?.[1].label === "ช่วยเหลือ"));
  assert.equal(
    items.flatMap((item) => [...item.links, ...item.groups!.flatMap((group) => group.links)])
      .length,
    64,
  );
  const links = items.flatMap((item) => [
    ...item.links,
    ...item.groups!.flatMap((group) => group.links),
  ]);
  assert.equal(links.filter((link) => !link.disabled).length, 64);
  assert.equal(links.filter((link) => link.disabled).length, 0);
  assert.deepEqual(
    items.map((item) => columns(item).map((column) => column.links.length)),
    [
      [5, 4, 4],
      [4, 0, 3],
      [2, 0, 3],
      [4, 0, 3],
      [3, 0, 4],
      [8, 0, 3],
      [3, 1, 2],
      [2, 2, 4],
    ],
  );
  assert.deepEqual(
    items[3].links.map((link) => link.label),
    ["สแตนเลส SUS304", "สแตนเลส SUS201", "แท่นเหล็กคาร์บอน", "พลาสติก ABS"],
  );
  assert.equal(items[3].links.length, 4);
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
  assert.equal(expectedLinks.length, 64);
  const readiness = new Map<string, boolean>();
  for (const [, href, disabled] of expectedLinks) {
    if (readiness.has(href)) assert.equal(readiness.get(href), disabled, href);
    readiness.set(href, disabled);
  }
  assert.equal([...readiness.values()].filter(Boolean).length, 0);
  assert.equal(links.length, expectedLinks.length);
  for (const link of links) {
    assert.ok(readiness.has(link.href), link.href);
    assert.equal(Boolean(link.disabled), readiness.get(link.href), link.label);
  }
  assert.ok(!links.some((link) => link.href.startsWith("/solutions/")));
  for (const href of [
    "/products/category/platforms",
    "/software/download",
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
  assert.ok(links.some((link) => link.href === "/software/download" && !link.disabled));
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
  assert.equal(scales.links.filter((link) => link.label === "เครื่องชั่งสำหรับโรงงาน").length, 1);
  assert.equal(
    scales.links.find((link) => link.label === "เครื่องชั่งสำหรับโรงงาน")!.href,
    "/products/category/scales/industrial",
  );
});

test("the five chapter rails keep their category labels and product destinations before catalog data is available", () => {
  const productCategories = approvedMenus.slice(1, 6);
  for (const ready of [[], ["/products/category/platforms/abs", "/products/category/pos/ios"]]) {
    const chapterMenus = getPrimaryNavigationItems(defaultNavigation, ready, "category-chapters");
    for (const { href, columns } of productCategories) {
      const actual = chapterMenus.find((menu) => menu.href === href)!;
      assert.deepEqual(
        actual.links.map(({ label, href, disabled }) => [label, href, Boolean(disabled)]),
        columns[0].links.map(([label, destination, disabled]) => [
          destination === "/products/category/scales/kitchen"
            ? "ครัวเรือน"
            : destination === "/products/category/scales/industrial"
              ? "การผลิต"
              : destination === "/products/category/scales/price"
                ? "คำนวณราคา"
                : label,
          destination,
          disabled,
        ]),
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
        "/products/category/scales/price",
        "/products/category/scales/kitchen",
        "/products/category/scales/industrial",
        "/software/download#retail-software",
      ],
      [
        "/technical-specification",
        "/service?section=contact",
        "/warranty/policy",
        "/warranty/register",
      ],
    ],
  );
  assert.equal(children.length, 23);
  assert.deepEqual(
    items.map((item) => item.links.length),
    [4, 2, 4, 3, 8],
  );
  for (const item of navigation) {
    assert.ok(item.href.startsWith("/"));
    assert.ok(
      columns(item).every((column) => column.links.every((link) => link.href !== item.href)),
    );
  }
  assert.ok(
    getPrimaryNavigationItems(defaultNavigation, [], "category-chapters")[5].groups![0].links.some(
      (link) => link.href === "/products/category/accessories/consumables",
    ),
  );
  assert.equal(JSON.stringify(defaultNavigation), before);
});

test("company destinations stay under Services and shared menu labels take precedence", () => {
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
    ["/service/quotation", "/warranty/register"],
  );
  const links = [...services.links, ...services.groups!.flatMap(({ links }) => links)];
  for (const href of ["/about-us", "/service?section=contact", "/warranty/register"])
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
    [defaultNavigation, "category-chapters", false],
    [navigation, "navbar", true],
    [navigation, "category-chapters", true],
  ] as const) {
    const menus = getPrimaryNavigationItems(source, [href], surface);
    const accessories = menus.find((menu) => menu.href === "/products/category/accessories")!;
    const pos = menus.find((menu) => menu.href === "/products/category/pos")!;
    assert.equal(
      Boolean(accessories.links.find((link) => link.href === href)!.disabled),
      accessoriesDisabled,
    );
    const scannerLink = pos.groups![0].links.find((link) => link.label === "สแกนเนอร์และลิ้นชัก");
    assert.equal(scannerLink?.href, surface === "category-chapters" ? scanners : undefined);
    assert.equal(Boolean(scannerLink?.disabled), false);
  }
});

test("catalog destinations stay linked for every runtime inventory while an explicit saved disable takes precedence", () => {
  const paths = [
    "/products/category/scales/analytical",
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
    assert.equal(entries.length, 64);
    assert.equal(entries.filter((entry) => !entry.disabled).length, 64);
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
