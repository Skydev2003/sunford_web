import sourcePages from "./pages.json";

// Landing pages in the source site can point at the wrong embedded collection.
// Use the dedicated collection as the authority for each section's membership.
const platformLinks = [
  { label: "โครงสร้างแท่นชั่งทั้งหมด", href: "/product/โครงสร้างแท่นชั่ง" },
  { label: "แท่นชั่งตั้งโต๊ะ", href: "/Product/แท่นชั่งตั้งโต๊ะ" },
  { label: "แท่นชั่งตั้งพื้น", href: "/Product/แท่นชั่งตั้งพืั้น" },
  { label: "แท่นชั่งขนาดใหญ่", href: "/collections/แท่นชั่งตั้งพืั้น ขนาดใหญ่" },
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
  { label: "ห้องปฏิบัติการ", href: "/product/ห้องปฏิบัติการ" },
  { label: "อุตสาหกรรม", href: "/product/อุตสาหกรรม" },
  { label: "พาณิชยกรรมและบริการ", href: "/product/พาณิชยกรรมและบริการ" },
  { label: "ไลฟ์สไตล์", href: "/product/ไลฟ์สไตล์" },
];
const indicatorLinks = [
  { label: "อินดิเคเตอร์ทั้งหมด", href: "/Indicator" },
  { label: "ห้องปฏิบัติการ", href: "/Indicator/ห้องปฏิบัติการ" },
  { label: "อุตสาหกรรม", href: "/Indicator/อุตสาหกรรม" },
  { label: "พาณิชยกรรมและบริการ", href: "/Indicator/พาณิชยกรรมและบริการ" },
];
const accessoryLinks = [
  { label: "อุปกรณ์เสริมทั้งหมด", href: "/product/อุปกรณ์ประกอบเครื่องชั่ง" },
  { label: "อุปกรณ์ส่งข้อมูล", href: "/product/อุปกรณ์ส่งข้อมูล" },
  { label: "อุปกรณ์ต่อพ่วง", href: "/product/อุปกรณ์ต่อพ่วง" },
  { label: "เครื่องพิมพ์", href: "/collections/เครื่องพิมพ์" },
  { label: "ชิ้นส่วนเสริม", href: "/product/Scale-parts" },
  { label: "วัสดุสิ้นเปลือง", href: "/product/Consumables" },
];

function section(
  title: string,
  collections: string[],
  links: ProductSection["links"],
  category?: string,
): ProductSection {
  return {
    title,
    collectionPaths: collections.map((name) => `/collections/${name}`),
    links,
    category,
  };
}

const sections: Record<string, ProductSection> = {
  "/product/digital-weighing": section("เครื่องชั่งดิจิทัล", ["เครื่องชั่ง"], scaleLinks),
  "/product/ห้องปฏิบัติการ": section(
    "เครื่องชั่งห้องปฏิบัติการ",
    ["ห้องปฏิบัติการ"],
    scaleLinks,
    "laboratory",
  ),
  "/product/อุตสาหกรรม": section("เครื่องชั่งอุตสาหกรรม", ["อุตสาหกรรม"], scaleLinks, "industrial"),
  "/product/พาณิชยกรรมและบริการ": section(
    "เครื่องชั่งพาณิชยกรรมและบริการ",
    ["พาณิชยกรรมและบริการ"],
    scaleLinks,
    "commercial",
  ),
  "/product/ไลฟ์สไตล์": section(
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
  "/indicator/ห้องปฏิบัติการ": section(
    "อินดิเคเตอร์ห้องปฏิบัติการ",
    ["อินดิเคเตอร์ห้องปฏิบัติการ"],
    indicatorLinks,
  ),
  "/indicator/อุตสาหกรรม": section(
    "อินดิเคเตอร์อุตสาหกรรม",
    ["อินดิเคเตอร์อุตสาหกรรม"],
    indicatorLinks,
  ),
  "/indicator/พาณิชยกรรมและบริการ": section(
    "อินดิเคเตอร์พาณิชยกรรมและบริการ",
    ["อินดิเคเตอร์พาณิชยกรรมและบริการ"],
    indicatorLinks,
  ),
  "/product/อุปกรณ์ประกอบเครื่องชั่ง": section(
    "อุปกรณ์ประกอบเครื่องชั่ง",
    ["อุปกรณ์ประกอบเครื่องชั่ง"],
    accessoryLinks,
    "accessories",
  ),
  "/product/อุปกรณ์ส่งข้อมูล": section(
    "อุปกรณ์ส่งข้อมูล",
    ["อุปกรณ์ส่งข้อมูล"],
    accessoryLinks,
    "accessories",
  ),
  "/product/อุปกรณ์ต่อพ่วง": section(
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
  "/product/แท่นชั่งจัดการข้อมูล": section(
    "แท่นชั่งจัดการข้อมูล",
    ["โครงสร้างแท่นชั่งอัจฉริยะ"],
    [],
    "smart",
  ),
  "/product/โครงสร้างแท่นชั่ง": {
    title: "โครงสร้างแท่นชั่ง",
    collectionPaths: ["/collections/โครงสร้างแท่นชั่ง"],
    links: platformLinks,
  },
  "/product/แท่นชั่งตั้งโต๊ะ": {
    title: "แท่นชั่งตั้งโต๊ะ",
    collectionPaths: ["/collections/แท่นชั่งตั้งโต๊ะ"],
    links: platformLinks,
  },
  "/product/แท่นชั่งตั้งพืั้น": {
    title: "แท่นชั่งตั้งพื้น",
    collectionPaths: ["/collections/แท่นชั่งตั้งพืั้น"],
    links: platformLinks,
  },
  "/product/pos": {
    title: "ระบบ POS ชั่งน้ำหนักเพื่อการขาย",
    collectionPaths: ["/collections/POS เชื่อมต่อเครื่องชั่ง"],
    links: posLinks,
    category: "pos",
  },
  "/product/pos/android": {
    title: "POS ระบบ Android",
    collectionPaths: ["/collections/POS ระบบ Android"],
    links: posLinks,
    category: "pos",
  },
  "/product/pos/windows": {
    title: "POS ระบบ Windows",
    collectionPaths: ["/collections/POS ระบบ Windows"],
    links: posLinks,
    category: "pos",
  },
};

const aliases: Record<string, string> = {
  "/product/lifestyle": "/product/ไลฟ์สไตล์",
  "/product/ชิ้นส่วน": "/product/scale-parts",
  "/product/pos-ระบบ-windows": "/product/pos/windows",
  "/product/ควบคุมชุดการผลิต": "/product/mes/batch",
  "/product/ควบคุมสูตรการผลิต": "/product/mes/formula",
};
const normalize = (path: string) => decodeURIComponent(path).replace(/\/$/, "").toLowerCase();
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
