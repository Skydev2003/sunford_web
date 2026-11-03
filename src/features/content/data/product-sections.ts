import sourcePages from "./pages.json";
import { publicPath } from "./public-paths.mjs";

// Landing pages in the source site can point at the wrong embedded collection.
// Use the dedicated collection as the authority for each section's membership.
const platformLinks = [
  { label: "โครงสร้างแท่นชั่งทั้งหมด", href: "/product/scale-platforms" },
  { label: "แท่นชั่งตั้งโต๊ะ", href: "/Product/benchtop-platforms" },
  { label: "แท่นชั่งตั้งพื้น", href: "/Product/floor-platforms" },
  { label: "แท่นชั่งขนาดใหญ่", href: "/collections/large-floor-platforms" },
];
const posLinks = [
  { label: "ระบบ POS ทั้งหมด", href: "/Product/POS" },
  { label: "POS ระบบ Android", href: "/Product/POS/Android" },
  { label: "POS ระบบ Windows", href: "/Product/POS/Windows" },
];

type ProductSection = {
  title: string;
  collectionPaths: string[];
  links: { label: string; href: string }[];
  category?: string;
};

const scaleLinks = [
  { label: "ห้องปฏิบัติการ", href: "/product/laboratory" },
  { label: "อุตสาหกรรม", href: "/product/industrial" },
  { label: "พาณิชยกรรมและบริการ", href: "/product/commercial" },
  { label: "ไลฟ์สไตล์", href: "/product/lifestyle-scales" },
];
const indicatorLinks = [
  { label: "อินดิเคเตอร์ทั้งหมด", href: "/Indicator" },
  { label: "ห้องปฏิบัติการ", href: "/Indicator/laboratory" },
  { label: "อุตสาหกรรม", href: "/Indicator/industrial" },
  { label: "พาณิชยกรรมและบริการ", href: "/Indicator/commercial" },
];
const accessoryLinks = [
  { label: "อุปกรณ์เสริมทั้งหมด", href: "/product/scale-accessories" },
  { label: "อุปกรณ์ส่งข้อมูล", href: "/product/data-interfaces" },
  { label: "อุปกรณ์ต่อพ่วง", href: "/product/scale-peripherals" },
  { label: "เครื่องพิมพ์", href: "/collections/printers" },
  { label: "ชิ้นส่วนเสริม", href: "/product/Scale-parts" },
  { label: "วัสดุสิ้นเปลือง", href: "/product/Consumables" },
  { label: "สินค้าพรีเมี่ยม", href: "/product/premium" },
];

function section(
  title: string,
  collections: string[],
  links: ProductSection["links"],
  category?: string,
): ProductSection {
  return {
    title,
    collectionPaths: collections.map((name) => publicPath(`/collections/${name}`)),
    links,
    category,
  };
}

const sections: Record<string, ProductSection> = {
  "/product/digital-weighing": section("เครื่องชั่งดิจิทัล", ["เครื่องชั่ง"], scaleLinks),
  "/product/laboratory": section(
    "เครื่องชั่งห้องปฏิบัติการ",
    ["ห้องปฏิบัติการ"],
    scaleLinks,
    "laboratory",
  ),
  "/product/industrial": section("เครื่องชั่งอุตสาหกรรม", ["อุตสาหกรรม"], scaleLinks, "industrial"),
  "/product/commercial": section(
    "เครื่องชั่งพาณิชยกรรมและบริการ",
    ["พาณิชยกรรมและบริการ"],
    scaleLinks,
    "commercial",
  ),
  "/product/lifestyle-scales": section(
    "เครื่องชั่งไลฟ์สไตล์และสุขภาพ",
    ["ไลฟ์สไตล์"],
    scaleLinks,
    "lifestyle",
  ),
  "/indicator": section(
    "อินดิเคเตอร์แท่นชั่ง",
    ["อินดิเคเตอร์ห้องปฏิบัติการ", "อินดิเคเตอร์อุตสาหกรรม", "อินดิเคเตอร์พาณิชยกรรมและบริการ"],
    indicatorLinks,
  ),
  "/indicator/laboratory": section(
    "อินดิเคเตอร์ห้องปฏิบัติการ",
    ["อินดิเคเตอร์ห้องปฏิบัติการ"],
    indicatorLinks,
  ),
  "/indicator/industrial": section(
    "อินดิเคเตอร์อุตสาหกรรม",
    ["อินดิเคเตอร์อุตสาหกรรม"],
    indicatorLinks,
  ),
  "/indicator/commercial": section(
    "อินดิเคเตอร์พาณิชยกรรมและบริการ",
    ["อินดิเคเตอร์พาณิชยกรรมและบริการ"],
    indicatorLinks,
  ),
  "/product/scale-accessories": section(
    "อุปกรณ์ประกอบเครื่องชั่ง",
    ["อุปกรณ์ประกอบเครื่องชั่ง"],
    accessoryLinks,
    "accessories",
  ),
  "/product/data-interfaces": section(
    "อุปกรณ์ส่งข้อมูล",
    ["อุปกรณ์ส่งข้อมูล"],
    accessoryLinks,
    "accessories",
  ),
  "/product/scale-peripherals": section(
    "อุปกรณ์ต่อพ่วง",
    ["อุปกรณ์ต่อพ่วง"],
    accessoryLinks,
    "accessories",
  ),
  "/product/scale-parts": section("ชิ้นส่วนเสริม", ["ชิ้นส่วน"], accessoryLinks, "accessories"),
  "/product/consumables": section(
    "วัสดุสิ้นเปลือง",
    ["วัสดุสิ้นเปลือง"],
    accessoryLinks,
    "accessories",
  ),
  "/product/premium": section("สินค้าพรีเมี่ยม", ["พรีเมี่ยม"], [], "accessories"),
  "/product/mes": section(
    "ระบบ MES ชั่งน้ำหนักเพื่อการผลิต",
    ["MES ควบคุมชุดการผลิต", "MES ควบคุมสูตรการผลิต"],
    [
      { label: "ควบคุมชุดการผลิต", href: "/Product/MES/Batch" },
      { label: "ควบคุมสูตรการผลิต", href: "/Product/MES/Formula" },
    ],
    "smart",
  ),
  "/product/mes/batch": section("MES ควบคุมชุดการผลิต", ["MES ควบคุมชุดการผลิต"], [], "smart"),
  "/product/mes/formula": section("MES ควบคุมสูตรการผลิต", ["MES ควบคุมสูตรการผลิต"], [], "smart"),
  "/product/data-management-platforms": section(
    "แท่นชั่งจัดการข้อมูล",
    ["โครงสร้างแท่นชั่งอัจฉริยะ"],
    [],
    "smart",
  ),
  "/product/scale-platforms": {
    title: "โครงสร้างแท่นชั่ง",
    collectionPaths: ["/collections/scale-platforms"],
    links: platformLinks,
  },
  "/product/benchtop-platforms": {
    title: "แท่นชั่งตั้งโต๊ะ",
    collectionPaths: ["/collections/benchtop-platforms"],
    links: platformLinks,
  },
  "/product/floor-platforms": {
    title: "แท่นชั่งตั้งพื้น",
    collectionPaths: ["/collections/floor-platforms"],
    links: platformLinks,
  },
  "/product/pos": {
    title: "ระบบ POS ชั่งน้ำหนักเพื่อการขาย",
    collectionPaths: ["/collections/pos-scale-integration"],
    links: posLinks,
    category: "pos",
  },
  "/product/pos/android": {
    title: "POS ระบบ Android",
    collectionPaths: ["/collections/pos-android"],
    links: posLinks,
    category: "pos",
  },
  "/product/pos/windows": {
    title: "POS ระบบ Windows",
    collectionPaths: ["/collections/pos-windows"],
    links: posLinks,
    category: "pos",
  },
};

const aliases: Record<string, string> = {
  "/product/lifestyle": "/product/lifestyle-scales",
  "/product/parts": "/product/scale-parts",
  "/product/pos-windows": "/product/pos/windows",
  "/product/batch-control": "/product/mes/batch",
  "/product/formula-control": "/product/mes/formula",
};
const normalize = (path: string) => publicPath(path).replace(/\/$/, "").toLowerCase();
const collectionKey = (value: string) =>
  normalize(value)
    .split("/")
    .at(-1)!
    .replace(/[\s_-]/g, "");
const collections = sourcePages.filter((page) => page.kind === "collection");

export function getProductSection(path: string): ProductSection | undefined {
  const key = normalize(path);
  const explicit = sections[aliases[key] ?? key];
  if (explicit) return explicit;
  const page = sourcePages.find((page) => normalize(page.path) === key && page.kind !== "product");
  if (!page || !/^\/(product|indicator|collections)(\/|$)/i.test(key)) return undefined;
  const collection =
    page.kind === "collection"
      ? page
      : collections.find((item) => collectionKey(item.path) === collectionKey(path));
  return {
    title: collection?.title ?? page.title.replace(/\s*\|\s*Sunford$/i, ""),
    collectionPaths: collection ? [collection.path] : [],
    links: [],
  };
}
