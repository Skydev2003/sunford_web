import type { Product } from "../types";

export const topicGroups = [
  {
    label: "เลือกตามการใช้งาน",
    topics: [
      { id: "weighing", label: "ชั่งน้ำหนัก", href: "/collections/weighing-scales" },
      { id: "counting", label: "นับจำนวน", href: "/collections/counting-scales" },
      { id: "price", label: "คำนวณราคา", href: "/collections/price-computing-scales" },
      { id: "labels", label: "พิมพ์ฉลาก", href: "/collections/label-printing-price-scales" },
    ],
  },
  {
    label: "เลือกตามคุณสมบัติ",
    topics: [
      { id: "waterproof", label: "กันน้ำ", href: "/collections/waterproof-weighing-scales" },
      { id: "non-waterproof", label: "ไม่กันน้ำ", href: "/guides/platforms#environment" },
      { id: "connected", label: "เชื่อมต่อข้อมูล", href: "/product/data-interfaces" },
    ],
  },
  {
    label: "เลือกตามลักษณะงาน",
    topics: [
      { id: "general", label: "งานทั่วไป", href: "/product/scale-platforms" },
      { id: "wet", label: "งานเปียก", href: "/guides/platforms#environment" },
      { id: "heavy", label: "งานน้ำหนักมาก", href: "/collections/large-floor-platforms" },
    ],
  },
  {
    label: "ระบบ POS และซอฟต์แวร์",
    topics: [
      { id: "android", label: "POS ระบบ Android", href: "/Product/POS/Android" },
      { id: "windows", label: "POS ระบบ Windows", href: "/Product/POS/Windows" },
      { id: "pos-software", label: "ซอฟต์แวร์ POS", href: "/software/download" },
      { id: "printers", label: "เครื่องพิมพ์", href: "/collections/printers" },
      { id: "peripherals", label: "อุปกรณ์ต่อพ่วง", href: "/product/scale-peripherals" },
    ],
  },
  {
    label: "ประเภทอุปกรณ์และวัสดุเสริม",
    topics: [
      { id: "data-devices", label: "อุปกรณ์ส่งข้อมูล", href: "/product/data-interfaces" },
      { id: "thermal", label: "Thermal Printer", href: "/collections/printers" },
      { id: "parts", label: "ชิ้นส่วนเสริม", href: "/collections/parts" },
      { id: "consumables", label: "วัสดุสิ้นเปลือง", href: "/collections/consumables" },
    ],
  },
  {
    label: "เลือกอุปกรณ์ให้ตรงงาน",
    topics: [
      { id: "for-scales", label: "สำหรับเครื่องชั่ง", href: "/product/scale-accessories" },
      { id: "for-pos", label: "สำหรับระบบ POS", href: "/collections/POS Related" },
      { id: "for-printing", label: "สำหรับงานพิมพ์", href: "/collections/printers" },
    ],
  },
];

/** Only positive product facts or source collection membership qualify a product. */
export function classifyProductTopics(
  product: Pick<Product, "name" | "subtitle" | "description" | "category"> & Partial<Pick<Product, "connection">>,
  collections: string[] = [],
  sourceFacts = "",
) {
  const text = `${product.name} ${product.subtitle} ${product.description} ${product.connection ?? ""} ${sourceFacts}`;
  const identity = `${product.name} ${product.subtitle}`;
  const has = (pattern: RegExp) => pattern.test(text);
  const member = (pattern: RegExp) => collections.some((path) => pattern.test(path));
  const negativeWater = has(/[ไใ]ม่(?:สามารถ)?กันน้ำ|ไม่ทนน้ำ|non[ -]?waterproof|not waterproof/i);
  const positiveWater =
    !negativeWater &&
    (has(/กันน้ำ|ฉีดล้างได้|washdown|waterproof|IP(?:6[5-9]|[78]\d)/i) ||
      member(
        /\/(?:waterproof-(?:weighing-scales|indicators|platform-indicators|label-rolls)|washdown-price-computing-scales)$/i,
      ));
  const negativeConnection = has(
    /ไม่(?:สามารถ)?(?:รองรับการ)?(?:เชื่อมต่อ|ส่งข้อมูล)|non data transfer/i,
  );
  const connected =
    !negativeConnection &&
    (has(
      /RS[ -]?232|RS[ -]?485|USB|Wi[ -]?Fi|Bluetooth|Ethernet|LAN\b|ส่งข้อมูล|เชื่อมต่อข้อมูล/i,
    ) ||
      member(/data transferable|wifi-connected|bt-connected|wired smart|wireless/i));
  const printer = /เครื่องพิมพ์|printer/i.test(identity) || member(/\/printers$/i);
  const accessory =
    product.category === "accessories" ||
    member(/scale-accessories|peripherals|consumables|parts|POS Related/i);
  const consumable =
    /กระดาษ|สติ๊กเกอร์|สติกเกอร์|label roll|paper roll|หมึกพิมพ์/i.test(identity) ||
    member(/consumables|label-rolls|paper-rolls/i);
  const dataDevice =
    accessory &&
    (/อุปกรณ์.*(?:ส่ง|รับ|ข้อมูล)|ตัว(?:ส่ง|รับ)สัญญาณ|สาย(?:สัญญาณ|ข้อมูล)|interface|adapter/i.test(
      identity,
    ) ||
      member(/device|data-interface/i));
  const pos =
    product.category === "pos" || /\bPOS\b/i.test(identity) || member(/pos-android|pos-windows/i);
  const topics: Record<string, boolean> = {
    weighing:
      (/ชั่งน้ำหนัก|เครื่องชั่ง|อินดิเคเตอร์.*ชั่ง/i.test(identity) && !accessory) ||
      member(/\/(weighing-scales|weighing-indicators|platform-weighing-indicators)$/i),
    counting:
      !has(/ไม่นับจำนวน|ไม่รองรับการนับ/) &&
      (has(/นับจำนวน|นับชิ้น|counting/i) || member(/counting/i)),
    price:
      !has(/ไม่(?:รองรับการ)?คำนวณราคา/) &&
      (has(/คำนวณราคา|price computing/i) ||
        member(/price-computing|weighing and price computing/i)),
    labels:
      !consumable &&
      (has(/พิมพ์ฉลาก|พิมพ์(?:ป้ายราคา|สติ[๊กก]*เกอร์)|label printing/i) ||
        member(/label-printing-price-scales/i)),
    waterproof: positiveWater,
    "non-waterproof": negativeWater,
    connected,
    general: has(/งานทั่วไป|ใช้งานทั่วไป|งานแห้ง/),
    wet: !accessory && positiveWater,
    heavy: has(/งานหนัก|งานน้ำหนักมาก|ชั่งน้ำหนักมาก/) || member(/large-floor-platforms/i),
    android: pos && (has(/android/i) || member(/pos-android/i)),
    windows: pos && (has(/windows/i) || member(/pos-windows/i)),
    "pos-software":
      /ซอฟต์แวร์|software|โปรแกรม/i.test(identity) && /\bPOS\b|ระบบขาย/i.test(identity),
    printers: printer,
    peripherals:
      member(
        /peripherals|keyboards-and-mice|displays|signal-lights|cash-drawers|barcode-scanners|POS Related/i,
      ) ||
      (accessory &&
        /คีย์บอร์ด|เมาส์|จอ(?:แสดงผล|เสริม)|ลิ้นชัก|สแกนเนอร์|ไฟสัญญาณ/i.test(identity)),
    "data-devices": dataDevice,
    thermal: printer && has(/thermal|ความร้อน/i),
    parts:
      member(/parts|indicator-stands|printer-mounts|platform-ramps|stainless-steel-columns/i) ||
      (accessory && /ชิ้นส่วน|อะไหล่|ขาตั้ง|เสาสแตนเลส|แป้นรอง|ทางลาด/i.test(identity)),
    consumables: consumable,
    "for-scales":
      accessory && (has(/เครื่องชั่ง|อินดิเคเตอร์|แท่นชั่ง/) || member(/scale-accessories/i)),
    "for-pos": accessory && (has(/\bPOS\b/i) || member(/POS Related/i)),
    "for-printing": printer || consumable || member(/printer-mounts/i),
  };
  return Object.keys(topics).filter((key) => topics[key]);
}
