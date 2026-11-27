import type { Product } from "@/features/catalog/types";
import { additionalScaleSubcategoryPages } from "@/features/catalog/data/additional-subcategory-pages";

type Destination = { href: string; label: string };
type Solution = {
  title: string;
  description?: string;
  parent?: Destination;
  emptyMessage?: string;
  links: readonly Destination[];
  evidence?: (product: Product) => string | undefined;
};

const catalog = "/products/category";
const details = { href: "/technical-specification", label: "ค้นหาคู่มือและสเปกสินค้า" };
const software = { href: "/software/download", label: "ดาวน์โหลดซอฟต์แวร์" };
const industrial = { href: catalog + "/scales/industrial", label: "สำรวจเครื่องชั่งอุตสาหกรรม" };
const indicators = { href: catalog + "/indicators", label: "สำรวจอินดิเคเตอร์แท่นชั่ง" };
const printers = { href: catalog + "/accessories/printers", label: "สำรวจเครื่องพิมพ์" };
const pos = { href: catalog + "/pos", label: "สำรวจระบบ POS" };
const mes = { href: "/solution/mes", label: "ระบบ MES" };
const batchControl = { href: "/solution/mes/batch-control", label: "ควบคุมชุดการผลิต" };
const formulaControl = { href: "/solution/mes/formula-control", label: "ควบคุมสูตรการผลิต" };
const mesProductAvailability = "ยังไม่มีรายการสินค้าที่ระบุว่ารองรับงานนี้ในแค็ตตาล็อก";
const retailPriceLabelSkus = new Set(["G106209", "G106407", "G108562"]);

const unconfirmed =
  /ไม่รองรับ|ไม่มี|สั่งเพิ่ม|ตัวเลือก|เพิ่มเติม|เพิ่มบลูทูธ|ออปชั[่น]+|\boptional\b|\bnot supported\b/i;

function connection(product: Product, port: RegExp) {
  const category = product.warehouseCategoryId;
  if (category !== "scales" && category !== "indicators") return;
  return product.warehouseSpecifications?.find(
    ({ label, value }) =>
      /เชื่อมต่อ|พอร์[ตท]|port|interface/i.test(label) &&
      port.test(value) &&
      !unconfirmed.test(label + " " + value),
  )?.value;
}

function printing(product: Product) {
  if (product.warehouseCategoryId !== "scales") return;
  return product.warehouseSpecifications
    ?.flatMap(({ value }) => value.split(/\n+/))
    .find((line) => /พิมพ์ฉลากสินค้า/.test(line) && !unconfirmed.test(line));
}

function softwareLicense(product: Product, name: RegExp) {
  if (product.warehouseGroup !== "โปรแกรมและสิทธิ์ใช้งาน") return;
  if (name.test(product.warehouseName ?? product.name)) return product.warehouseGroup;
}

const checkweighing = additionalScaleSubcategoryPages.find(
  ({ id }) => id === "scale-checkweighing",
);

export const solutionDetails: Readonly<Record<string, Solution>> = {
  "/solutions/rs232": {
    title: "ส่งข้อมูลผ่าน RS232",
    links: [
      { href: catalog + "/indicators/rs232", label: "ดูอินดิเคเตอร์ที่ระบุพอร์ต RS232" },
      details,
    ],
    evidence: (product) => connection(product, /\bRS[-\s]?232\b/i),
  },
  "/solutions/wireless": {
    title: "ส่งข้อมูลแบบไร้สาย",
    links: [indicators, details],
    evidence: (product) => connection(product, /Bluetooth|บลูทูธ|Wi[-\s]?Fi/i),
  },
  "/solutions/usb-drive": {
    title: "บันทึกน้ำหนักลง USB Drive",
    links: [industrial, details],
  },
  "/solutions/android": {
    title: "บันทึกข้อมูลการชั่งบน Android",
    links: [{ href: catalog + "/pos/android", label: "สำรวจระบบ POS Android" }, software],
  },
  "/solutions/label-printing": {
    title: "พิมพ์ฉลากจากเครื่องชั่ง",
    links: [
      printers,
      { href: catalog + "/accessories/labels", label: "ดูฉลากและสติ๊กเกอร์" },
      details,
    ],
    evidence: printing,
  },
  "/solutions/pos-label-printing": {
    title: "พิมพ์ฉลากสำหรับ POS",
    links: [
      pos,
      printers,
      { href: "/solutions/label-printing", label: "ดูรุ่นเครื่องชั่งที่ระบุการพิมพ์ฉลาก" },
    ],
  },
  "/solutions/lot-serial": {
    title: "Lot No. และ Serial No. ในกระบวนการผลิต",
    links: [industrial, details],
  },
  "/solutions/pos": {
    title: "เชื่อมเครื่องชั่งกับระบบ POS",
    links: [pos, { href: catalog + "/accessories/pos", label: "สำรวจอุปกรณ์ POS" }, details],
    evidence: (product) => softwareLicense(product, /\bconnect\s+pos\b/i),
  },
  "/solutions/price-label-printing": {
    title: "ชั่งคำนวณราคาและพิมพ์ฉลากสินค้าหน้าร้าน",
    description:
      "ตั้งราคาต่อหน่วยเพื่อคำนวณราคาสินค้าจากน้ำหนักที่ชั่งได้ แล้วส่งข้อมูลไปพิมพ์ฉลากราคาผ่านเครื่องพิมพ์ภายนอกที่รองรับ",
    emptyMessage: "ขณะนี้ยังไม่มีรุ่นที่รองรับงานนี้เผยแพร่ในแค็ตตาล็อก",
    links: [printers, { href: catalog + "/scales/price", label: "สำรวจเครื่องชั่งคำนวณราคา" }],
    evidence: (product) => {
      if (product.warehouseSku && retailPriceLabelSkus.has(product.warehouseSku.toUpperCase())) {
        return "คำนวณราคาตามน้ำหนักและส่งข้อมูลไปพิมพ์ฉลากกับเครื่องพิมพ์ภายนอก";
      }
    },
  },
  "/solutions/checkweighing": {
    title: "ตรวจน้ำหนักขาด–เกิน",
    links: [
      { href: catalog + "/scales/checkweighing", label: "ดูรุ่นที่ระบุการเตือนน้ำหนักขาด–เกิน" },
      industrial,
    ],
    evidence: (product) => (checkweighing?.matches(product) ? "เตือนน้ำหนักขาด–เกิน" : undefined),
  },
  "/solutions/external-display": {
    title: "เชื่อมต่อจอแสดงผลภายนอก",
    links: [
      { href: catalog + "/accessories/displays", label: "สำรวจจอและไฟเตือน" },
      indicators,
      details,
    ],
  },
  "/solutions/plc": {
    title: "เชื่อมต่ออุปกรณ์ PLC",
    links: [industrial, indicators, details],
  },
  "/solutions/wet-environments": {
    title: "งานชั่งในสภาพเปียกชื้น",
    links: [
      { href: catalog + "/scales/water-dust", label: "ดูหมวดเครื่องชั่งกันน้ำและฝุ่น" },
      { href: catalog + "/indicators/waterproof", label: "ดูอินดิเคเตอร์ในหมวดกันน้ำ" },
      details,
    ],
    evidence: (product) =>
      product.warehouseSubcategoryIds?.some(
        (id) => id === "indicator-waterproof" || id === "scale-water-dust",
      )
        ? product.warehouseSpecifications?.find(
            ({ label, value }) =>
              /ระดับการป้องกัน IP/.test(label) && /^IP\d{2}$/i.test(value.trim()),
          )?.value
        : undefined,
  },
  "/solutions/windows": {
    title: "บันทึกข้อมูลการชั่งบน Windows",
    links: [{ href: catalog + "/pos/windows", label: "สำรวจระบบ POS Windows" }, software],
  },
  "/solutions/driver": {
    title: "โปรแกรม SUNFORD Driver",
    links: [{ href: "/software/download", label: "ตรวจสอบซอฟต์แวร์ที่เปิดให้ดาวน์โหลด" }, details],
    evidence: (product) => softwareLicense(product, /\bconnect\s+driver\b/i),
  },
  "/solution/erp": { title: "ระบบ ERP", links: [software, details] },
  [mes.href]: { title: mes.label, links: [batchControl, formulaControl, industrial, software] },
  [batchControl.href]: {
    title: batchControl.label,
    description:
      "สำหรับงานชั่งที่แบ่งการผลิตเป็นชุด ใช้ชุดการผลิตเป็นจุดอ้างอิงเพื่อเชื่อมค่าน้ำหนักจากเครื่องชั่งกับข้อมูลของการผลิตรอบนั้น",
    parent: mes,
    emptyMessage: mesProductAvailability,
    links: [formulaControl, industrial],
  },
  [formulaControl.href]: {
    title: formulaControl.label,
    description:
      "สำหรับงานชั่งวัตถุดิบตามสูตรการผลิต ใช้น้ำหนักที่ระบุในสูตรเป็นเกณฑ์เทียบกับน้ำหนักที่ชั่งได้ของวัตถุดิบแต่ละรายการ",
    parent: mes,
    emptyMessage: mesProductAvailability,
    links: [batchControl, software],
  },
};

export function getSolutionEvidence(solution: Solution, products: readonly Product[]) {
  return products.flatMap((product) => {
    const fact = product.warehouseSku && solution.evidence?.(product)?.trim();
    return fact ? [{ product, fact }] : [];
  });
}
