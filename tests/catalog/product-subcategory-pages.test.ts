import assert from "node:assert/strict";
import test from "node:test";
import {
  indicatorSubcategoryPages,
  platformPlacementPages,
  platformSubcategoryPages,
  posSubcategoryPages,
  accessorySubcategoryPages,
  getProductSubcategoryPage,
  getProductReturnPage,
  getReadySubcategoryHrefs,
  resolveListingSubcategory,
} from "../../src/features/catalog/data/product-subcategory-pages";
import { scaleSubcategoryPages } from "../../src/features/catalog/data/scale-subcategory-pages";
import { resolveCategoryHref } from "../../src/features/catalog/data/category-destinations";
import { getProductListingFeatures } from "../../src/features/catalog/data/product-listing-features";
import { buildNavbarListingFeatures } from "../../src/features/catalog/data/navbar-listing-features";
import type { Product } from "../../src/features/catalog/types";

test("Navbar selects real listing features, caps popular series at six, and keeps preferred supported pages", () => {
  const scales = [
    {
      id: "a",
      warehouseSku: "A",
      warehouseCategoryId: "scales",
      warehouseSpecifications: [
        { label: "เงื่อนไขการเชื่อมต่อ", value: "ส่งข้อมูลผ่านพอร์ท RS232" },
      ],
    },
    {
      id: "b",
      warehouseSku: "B",
      warehouseCategoryId: "scales",
      warehouseSpecifications: [
        { label: "นับจำนวนชิ้น", value: "รองรับ" },
        { label: "เงื่อนไขการเชื่อมต่อ", value: "ส่งข้อมูลผ่านพอร์ท RS232" },
      ],
    },
    {
      id: "mock",
      warehouseCategoryId: "scales",
      warehouseSpecifications: [{ label: "เตือนน้ำหนักขาด–เกิน", value: "รองรับ" }],
    },
  ];
  const platforms = ["FCS", "TCS", "FSS", "TSS", "BCS", "BSS", "XS"].flatMap((series, index) =>
    Array.from({ length: 7 - index }, (_, model) => ({
      id: `${series}${model}`,
      warehouseSku: `${series}${model}`,
      warehouseName: `Platform ${series} 4050`,
      warehouseSubcategoryIds: ["platform-carbon-steel"],
    })),
  );
  const categories = [
    {
      id: "scales",
      subcategories: [
        { id: "scale-kitchen", label: "ครัวเรือน", productIds: ["a"] },
        { id: "scale-industrial", label: "อุตสาหกรรม", productIds: ["a", "b", "mock"] },
      ],
    },
    {
      id: "platforms",
      subcategories: [
        {
          id: "platform-floor",
          label: "แท่นชั่งตั้งพื้น",
          productIds: platforms.map(({ id }) => id),
        },
      ],
    },
  ];
  const products = [...scales, ...platforms] as Product[];
  const features = buildNavbarListingFeatures(categories, products);
  assert.deepEqual(features["/scales"], [
    {
      label: "เชื่อมต่ออุปกรณ์",
      href: "/scales?feature=device-connection",
    },
    {
      label: "นับจำนวน",
      href: "/scales?feature=scale-counting",
    },
  ]);
  const series = features["/platforms"];
  assert.deepEqual(
    series.map(({ label }) => label),
    ["ซีรีส์ FCS", "ซีรีส์ TCS", "ซีรีส์ FSS", "ซีรีส์ TSS", "ซีรีส์ BCS", "ซีรีส์ BSS"],
  );
  assert.ok(
    series.every(
      ({ href, label }) =>
        href.startsWith("/platforms?") &&
        new URL(href, "https://example.test").searchParams.get("feature") === label,
    ),
  );
  const fallback = buildNavbarListingFeatures(categories, products, ["/scales/industrial"]);
  assert.ok(
    fallback["/scales"]
      .find(({ label }) => label === "เชื่อมต่ออุปกรณ์")
      ?.href.startsWith("/scales?feature=device-connection"),
  );
  assert.deepEqual(buildNavbarListingFeatures(categories, [])["/scales"], []);
});

test("listing filters use verified scale features and keep indicator water ratings exact", () => {
  const products = [
    {
      id: "scale-a",
      warehouseSku: "scale-a",
      warehouseCategoryId: "scales",
      warehouseSpecifications: [
        { label: "นับจำนวนชิ้น", value: "รองรับ" },
        { label: "เงื่อนไขการเชื่อมต่อ", value: "ส่งข้อมูลผ่านพอร์ท RS232" },
      ],
    },
    {
      id: "scale-b",
      warehouseSku: "scale-b",
      warehouseCategoryId: "scales",
      warehouseName: "เครื่องชั่งนับจำนวนชิ้น",
      warehouseSpecifications: [{ label: "นับจำนวนชิ้น", value: "ไม่รองรับ" }],
    },
  ] as Product[];
  assert.deepEqual(
    getProductListingFeatures("scales", "scale-industrial", products).map(
      ({ label, productIds, exclusive }) => [label, productIds, exclusive],
    ),
    [
      ["เชื่อมต่ออุปกรณ์", ["scale-a"], undefined],
      ["นับจำนวน", ["scale-a"], undefined],
    ],
  );
  const fullScale = {
    id: "scale-full",
    warehouseSku: "scale-full",
    warehouseCategoryId: "scales",
    warehouseSubcategoryIds: ["scale-water-dust", "scale-price"],
    warehouseSpecifications: [
      { label: "เงื่อนไขการเชื่อมต่อ", value: "ส่งข้อมูลผ่านพอร์ท RS232" },
      { label: "คำนวณราคาสินค้า", value: "รองรับ" },
      { label: "นับจำนวนชิ้น", value: "รองรับ" },
      { label: "เตือนน้ำหนักขาด–เกิน", value: "รองรับ" },
    ],
  } as Product;
  assert.deepEqual(
    getProductListingFeatures("scales", "scale-industrial", [fullScale]).map(({ label }) => label),
    ["เชื่อมต่ออุปกรณ์", "กันน้ำกันฝุ่น", "คำนวณราคา", "นับจำนวน", "เตือนน้ำหนักขาดเกิน"],
  );

  const indicators = ["IP67", "IP68"].map((rating) => ({
    id: rating,
    warehouseSubcategoryIds: ["indicator-waterproof"],
    warehouseSpecifications: [{ label: "ระดับการป้องกัน IP", value: rating }],
  })) as Product[];
  assert.deepEqual(
    getProductListingFeatures("indicators", "indicator-lcd", indicators).map(
      ({ productIds }) => productIds,
    ),
    [["IP67"]],
  );
});

test("platform series, POS groups and accessory filters reflect only the current listing's products", () => {
  const expectOptions = (
    category: string,
    subcategory: string,
    products: Partial<Product>[],
    expected: [string, string[]][],
  ) => {
    const features = getProductListingFeatures(category, subcategory, products as Product[]);
    assert.deepEqual(
      features.map(({ label, productIds }) => [label, productIds]),
      expected,
    );
    assert.ok(features.every(({ exclusive }) => exclusive));
  };
  expectOptions(
    "platforms",
    "platform-sus304",
    [
      { id: "tss", warehouseName: "SUNFORD ชิ้นส่วน - Platform TSS 4050" },
      { id: "fss", warehouseName: "SUNFORD ชิ้นส่วน - Platform FSS100100" },
      { id: "unknown", warehouseName: "Platform 4050" },
    ],
    [
      ["ซีรีส์ FSS", ["fss"]],
      ["ซีรีส์ TSS", ["tss"]],
    ],
  );
  expectOptions(
    "pos",
    "pos-android",
    [
      { id: "kit", warehouseGroup: "สินค้าจำหน่ายแบบแพ็ก" },
      { id: "license", warehouseGroup: "โปรแกรมและสิทธิ์ใช้งาน" },
    ],
    [
      ["ชุด POS", ["kit"]],
      ["ซอฟต์แวร์ POS", ["license"]],
    ],
  );
  expectOptions(
    "accessories",
    "accessory-displays",
    [
      { id: "display", warehouseName: "SUNFORD จอแสดงผล LED-R5" },
      { id: "light", warehouseName: "SUNFORD ไฟเตือน RYG-POLE" },
      { id: "display-code", warehouseName: "LCDC1C5" },
      { id: "light-code", warehouseName: "RPole_Buzzer" },
    ],
    [
      ["จอแสดงผล", ["display", "display-code"]],
      ["ไฟเตือน", ["light", "light-code"]],
    ],
  );
  expectOptions(
    "accessories",
    "accessory-mechanical",
    [
      { id: "wheel", warehouseName: "PUC20M10" },
      { id: "pan", warehouseName: "PCS60FC11STL" },
    ],
    [
      ["ล้อ", ["wheel"]],
      ["จานชั่ง", ["pan"]],
    ],
  );
  expectOptions(
    "accessories",
    "accessory-thermal-paper",
    [
      { id: "paper-a", warehouseName: "กระดาษความร้อน 57x50 บรรจุ 10 ม้วน" },
      { id: "paper-b", warehouseName: "กระดาษความร้อน 80x80 บรรจุ 20 ม้วน" },
      {
        id: "paper-code",
        warehouseName: "Thermalpaper20",
        description: "กระดาษความร้อน 57x50 บรรจุ 20 ม้วน",
      },
      { id: "unknown", warehouseName: "Thermalpaper8020" },
    ],
    [
      ["57 × 50", ["paper-a", "paper-code"]],
      ["80 × 80", ["paper-b"]],
    ],
  );
});

test("Navbar readiness follows the actual listing's Warehouse cards as members appear and disappear", () => {
  const cards = [
    { id: "scale", warehouseSku: "SKU-1" },
    { id: "platform", warehouseSku: "SKU-2" },
    { id: "editorial" },
  ];
  const categories = [
    {
      id: "scales",
      subcategories: [
        { id: "scale-analytical", label: "งานวิเคราะห์", productIds: ["missing", "editorial"] },
      ],
    },
    {
      id: "platforms",
      subcategories: [{ id: "platform-sus304", label: "SUS304", productIds: ["platform"] }],
    },
  ];
  assert.deepEqual(getReadySubcategoryHrefs(categories, []), []);
  assert.deepEqual(getReadySubcategoryHrefs(categories, cards), ["/platforms/sus304"]);
  categories[0].subcategories[0].productIds.push("scale", "scale");
  assert.deepEqual(getReadySubcategoryHrefs(categories, cards), [
    "/scales/laboratory",
    "/platforms/sus304",
  ]);
  assert.deepEqual(getReadySubcategoryHrefs(categories, cards.slice(1)), ["/platforms/sus304"]);
  assert.deepEqual(getReadySubcategoryHrefs([{ ...categories[1], id: "scales" }], cards), []);
});

test("LCD LED and waterproof indicators have exact canonical pages and whitelisted returns", () => {
  assert.deepEqual(
    indicatorSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["indicator-lcd", "/indicators/lcd"],
      ["indicator-led", "/indicators/led"],
      ["indicator-waterproof", "/indicators/waterproof"],
    ],
  );
  for (const page of indicatorSubcategoryPages) {
    for (const prefix of ["/products?category=indicators&", "/indicators?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "scales"), undefined);
  }
});

test("indicator IDs cannot hijack another family and unknown returns stay unresolved", () => {
  for (const href of [
    "/products?category=pos&subcategory=indicator-lcd",
    "/scales?subcategory=indicator-led",
    "/platforms/indicators?subcategory=scale-price",
    "/platforms/indicators?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  for (const context of ["https://example.com", "/indicators/lcd", "unknown"])
    assert.equal(getProductReturnPage(context), undefined);
});

test("shared registry retains scale paths and return aliases and uses current menu titles", () => {
  const menuTitles: Record<string, string> = {
    "/scales/laboratory": "ห้องปฏิบัติการ",
    "/scales/industrial": "อุตสาหกรรม",
    "/scales/retail": "ร้านค้าและบริการ",
    "/scales/household": "ครัวเรือนและบุคคล",
    "/scales/water-dust": "กันน้ำกันฝุ่น",
  };
  for (const page of scaleSubcategoryPages) {
    assert.equal(getProductSubcategoryPage(page.id, "scales")?.href, page.href);
    assert.equal(
      getProductReturnPage(page.returnContext)?.title,
      menuTitles[page.href] ?? page.label,
    );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
  }
  assert.equal(getProductReturnPage("industrial-scales")?.href, "/scales/industrial");
});

test("platform placements and legacy materials have exact routes and safe return contexts", () => {
  assert.deepEqual(
    platformPlacementPages.map((page) => [page.id, page.href]),
    [
      ["platform-floor", "/platforms/floor"],
      ["platform-benchtop", "/platforms/benchtop"],
    ],
  );
  assert.deepEqual(
    platformSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["platform-carbon-steel", "/platforms/carbon-steel"],
      ["platform-sus304", "/platforms/sus304"],
      ["platform-sus201", "/platforms/sus201"],
      ["platform-abs", "/platforms/abs"],
    ],
  );
  for (const page of [...platformPlacementPages, ...platformSubcategoryPages]) {
    for (const prefix of ["/products?category=platforms&", "/platforms?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "indicators"), undefined);
  }
});

test("platform expansion preserves cross-family boundaries and broader parent aliases", () => {
  for (const href of [
    "/products?category=pos&subcategory=platform-sus304",
    "/scales?subcategory=platform-abs",
    "/platforms?subcategory=indicator-lcd",
    "/platforms?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(resolveCategoryHref("/collections/stainless-steel-platforms"), "/platforms");
  assert.equal(resolveCategoryHref("/product/benchtop-platforms"), "/platforms/benchtop");
  assert.equal(resolveCategoryHref("/collections/floor-platforms"), "/platforms/floor");
  assert.equal(getProductReturnPage("/platforms/abs"), undefined);
});

test("three POS platforms have exact own-parent pages and safe originating contexts", () => {
  assert.deepEqual(
    posSubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["pos-ios", "/pos/ios"],
      ["pos-android", "/pos/android"],
      ["pos-windows", "/pos/windows"],
    ],
  );
  for (const page of posSubcategoryPages) {
    for (const prefix of ["/products?category=pos&", "/pos?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "platforms"), undefined);
  }
});

test("POS expansion preserves unknown and cross-family boundaries", () => {
  for (const href of [
    "/products?category=unknown&subcategory=pos-ios",
    "/platforms?subcategory=pos-android",
    "/pos?subcategory=indicator-lcd",
    "/pos?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  assert.equal(getProductReturnPage("/pos/ios"), undefined);
  assert.equal(resolveCategoryHref("/product/pos"), "/pos");
});

test("five accessory groups have exact own-parent routes and whitelisted return contexts", () => {
  assert.deepEqual(
    accessorySubcategoryPages.map((page) => [page.id, page.href]),
    [
      ["accessory-displays", "/accessories/displays"],
      ["accessory-cables", "/accessories/cables"],
      ["accessory-mechanical", "/accessories/mechanical"],
      ["accessory-pos", "/accessories/pos"],
      ["accessory-consumables", "/accessories/consumables"],
    ],
  );
  for (const page of accessorySubcategoryPages) {
    for (const prefix of ["/products?category=accessories&", "/accessories?"])
      assert.equal(
        resolveCategoryHref(`${prefix}subcategory=${page.id}&catalog=all&trace=keep#details`),
        `${page.href}?trace=keep#details`,
      );
    assert.equal(getProductReturnPage(page.id)?.href, page.href);
    assert.equal(getProductSubcategoryPage(page.id, "pos"), undefined);
  }
});

test("accessory expansion preserves broader aliases and cross-family boundaries", () => {
  for (const href of [
    "/products?category=pos&subcategory=accessory-pos",
    "/accessories?subcategory=pos-ios",
    "/platforms/indicators?subcategory=accessory-displays",
    "/accessories?subcategory=unknown",
  ])
    assert.equal(resolveCategoryHref(href), href);
  for (const href of [
    "/product/data-interfaces",
    "/product/scale-peripherals",
    "/collections/printers",
  ])
    assert.equal(resolveCategoryHref(href), "/accessories");
  assert.equal(getProductReturnPage("/accessories/pos"), undefined);
});

test("additional listings have distinct canonical paths and safe product return contexts", () => {
  for (const [category, slug, id] of [
    ["scales", "counting", "scale-counting"],
    ["scales", "checkweighing", "scale-checkweighing"],
    ["indicators", "rs232", "indicator-rs232"],
    ["indicators", "laboratory", "indicator-laboratory"],
    ["indicators", "industrial", "indicator-industrial"],
    ["indicators", "commercial", "indicator-commercial"],
    ["accessories", "electronics", "accessory-electronics"],
    ["accessories", "printers", "accessory-printers"],
    ["accessories", "scanners-and-cash-drawers", "accessory-scanners-and-cash-drawers"],
    ["accessories", "weights", "accessory-weights"],
    ["accessories", "thermal-paper", "accessory-thermal-paper"],
    ["accessories", "labels", "accessory-labels"],
  ]) {
    const href = `/${category}/${slug}`;
    assert.equal(getProductSubcategoryPage(id, category)?.href, href);
    assert.equal(getProductReturnPage(id)?.href, href);
    assert.equal(getProductReturnPage(href), undefined);
    assert.equal(resolveCategoryHref(`/products?category=${category}&subcategory=${id}`), href);
    assert.equal(getProductSubcategoryPage(id, "pos"), undefined);
  }
});

test("indicator application pages list only present Warehouse indicators verified for that use", () => {
  const warehouseProduct = (sku: string) =>
    ({ id: sku, warehouseSku: sku, warehouseCategoryId: "indicators" }) as Product;
  const industrial = ["G107763", "G107770", "G107787", "G107794", "G107800", "G107817"];
  const commercial = ["G107848"];
  const products = [
    ...industrial.map(warehouseProduct),
    ...commercial.map(warehouseProduct),
    warehouseProduct("G107831"),
    { ...warehouseProduct("G107817"), id: "wrong-family", warehouseCategoryId: "scales" },
    { ...warehouseProduct("G107848"), id: "archived", sourceId: "10784", warehouseSku: undefined },
  ];
  for (const [id, label, expected] of [
    ["indicator-laboratory", "ห้องปฏิบัติการ", []],
    ["indicator-industrial", "อุตสาหกรรม", industrial],
    ["indicator-commercial", "ร้านค้าและบริการ", commercial],
  ] as const) {
    const definition = getProductSubcategoryPage(id, "indicators");
    assert.ok(definition, id);
    assert.equal(definition.label, label);
    assert.deepEqual(
      resolveListingSubcategory(definition, { subcategories: [] }, products)?.productIds,
      expected,
    );
    assert.deepEqual(
      resolveListingSubcategory(definition, { subcategories: [] }, [])?.productIds,
      [],
    );
  }
});

test("new listings require matching Warehouse identity, group or specification", () => {
  const check = (id: string, categoryId: string, fields: Partial<Product>, expected: boolean) => {
    const page = getProductSubcategoryPage(id, categoryId);
    assert.ok(page && "matches" in page);
    const product = {
      warehouseSku: "example",
      warehouseCategoryId: categoryId,
      ...fields,
    } as Product;
    assert.equal(page.matches(product), expected, id);
    assert.equal(page.matches({ ...product, warehouseSku: undefined }), false, id);
    assert.equal(page.matches({ ...product, warehouseCategoryId: "pos" }), false, id);
  };
  check("scale-counting", "scales", { warehouseName: "เครื่องชั่ง-นับจำนวน" }, true);
  check("scale-counting", "scales", { name: "เครื่องชั่งนับจำนวน" }, false);
  check(
    "scale-counting",
    "scales",
    {
      warehouseName: "เครื่องชั่งนับจำนวน",
      warehouseSpecifications: [{ label: "นับจำนวนชิ้น", value: "ไม่รองรับ" }],
    },
    false,
  );
  check(
    "scale-checkweighing",
    "scales",
    { warehouseSpecifications: [{ label: "เตือนน้ำหนักขาด–เกิน", value: "รองรับ" }] },
    true,
  );
  check(
    "scale-checkweighing",
    "scales",
    { warehouseName: "เตือนเมื่อชั่งน้ำหนักเกินพิกัด" },
    false,
  );
  check(
    "indicator-rs232",
    "indicators",
    {
      warehouseSpecifications: [
        { label: "เงื่อนไขการเชื่อมต่อ", value: "ส่งข้อมูลผ่านพอร์ท RS232" },
      ],
    },
    true,
  );
  check(
    "indicator-rs232",
    "indicators",
    { warehouseSpecifications: [{ label: "พอร์ตเสริม", value: "RS-232 (optional)" }] },
    false,
  );
  check("indicator-rs232", "indicators", { warehouseName: "สาย RS232" }, false);
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "SUNFORD ชิ้นส่วน - Load cell" },
    true,
  );
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "SUNFORD ชิ้นส่วน - Loadcell Cable" },
    false,
  );
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "โครงแท่นพร้อมโหลดเซลล์" },
    false,
  );
  for (const part of [
    "PCB",
    "ส่วนขยายวงจร บลูทูธ BTA",
    "ส่วนขยายวงจร บลูทูธ BTB",
    "อุปกรณ์ส่งสัญญาณ บลูทูธ 1,000ม BTL",
    "วงจรแท่นชั่งเทอร์มินอล ABT",
  ]) {
    check(
      "accessory-electronics",
      "accessories",
      { warehouseGroup: "ชิ้นส่วน", warehouseName: `SUNFORD ชิ้นส่วน - ${part}` },
      true,
    );
  }
  for (const part of ["สาย PCB", "แท่นชั่งพร้อมวงจรแท่นชั่ง ABT", "PCB พร้อมแท่นชั่ง"]) {
    check(
      "accessory-electronics",
      "accessories",
      { warehouseGroup: "ชิ้นส่วน", warehouseName: `SUNFORD ชิ้นส่วน - ${part}` },
      false,
    );
  }
  check(
    "accessory-electronics",
    "accessories",
    { warehouseGroup: "วัตถุดิบ", warehouseName: "SUNFORD ชิ้นส่วน - PCB" },
    false,
  );
  check("accessory-printers", "accessories", { warehouseGroup: "เครื่องพิมพ์" }, true);
  const scannerListing = "accessory-scanners-and-cash-drawers";
  for (const warehouseSku of [
    "G107374",
    "G107381",
    "G107411",
    "SUNFORDDRW350-B",
    "SUNFORDDRW350-W",
  ])
    check(scannerListing, "accessories", { warehouseSku }, true);
  check(
    scannerListing,
    "accessories",
    { warehouseSku: "G107374-OTHER", warehouseSubcategoryIds: ["accessory-pos"] },
    false,
  );
  check(
    "accessory-printers",
    "accessories",
    { warehouseGroup: "ชิ้นส่วน", warehouseName: "ขาตั้งเครื่องพิมพ์" },
    false,
  );
  check("accessory-weights", "accessories", { warehouseGroup: "ลูกตุ้มและตุ้มน้ำหนัก" }, true);
  check("accessory-weights", "accessories", { warehouseName: "ตุ้มน้ำหนัก" }, false);
  const paper = { warehouseGroup: "วัสดุสิ้นเปลือง", warehouseName: "กระดาษความร้อน 57x50" };
  const sticker = { warehouseGroup: "วัสดุสิ้นเปลือง", warehouseName: "สติ๊กเกอร์เลเบล 40x60" };
  check("accessory-thermal-paper", "accessories", paper, true);
  check("accessory-thermal-paper", "accessories", sticker, false);
  check("accessory-labels", "accessories", sticker, true);
  check("accessory-labels", "accessories", paper, false);
  const paperCode = { ...paper, warehouseName: "Thermalpaper8020" };
  const labelCode = { ...sticker, warehouseName: "Label40x60WP-2u" };
  check("accessory-thermal-paper", "accessories", paperCode, true);
  check("accessory-thermal-paper", "accessories", labelCode, false);
  check("accessory-labels", "accessories", labelCode, true);
  check("accessory-labels", "accessories", paperCode, false);
});
