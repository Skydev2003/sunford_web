import type { ClientProduct } from "../types";

type LineupProduct = Pick<
  ClientProduct,
  | "name"
  | "subtitle"
  | "description"
  | "readability"
  | "capacity"
  | "connection"
  | "warehouseSku"
  | "warehouseName"
  | "warehouseGroup"
  | "warehouseCategoryId"
  | "warehouseSubcategoryIds"
>;

const maxLength = 34;

// One fact per SKU from the published /products showcases or the SKU's Warehouse card.
const highlights = new Map([
  ["G106698", "ชาร์จได้ ไม่ต้องซื้อถ่าน"],
  ["G106582", "ชั่งสินค้าได้ถึง 30 กก."],
  ["G106483", "เตือนเมื่อชั่งขาดหรือเกิน"],
  ["G106094", "ชั่งได้ถึง 30 กก."],
  ["G106315", "ตัวเลขสีแดง อ่านได้ไกล 5 เมตร"],
  ["G106193", "ต่อลิ้นชักเก็บเงินได้"],
  ["G106681", "ชั่งละเอียด 1 กรัม"],
  ["G106131", "จอแสดงผลแยกจากถาดชั่ง"],
  ["G106285", "ตวงนมในโหมดมิลลิลิตร"],
  ["G106124", "ปุ่มคำสั่งภาษาไทย"],
  ["G106391", "ชั่งและพิมพ์ฉลากสินค้า"],
  ["G106827", "ชั่งและพิมพ์ฉลากสินค้า"],
  ["G106353", "ชั่งได้ถึง 10 กก."],
  ["G106377", "ต่อเครื่องพิมพ์ผ่านพอร์ต RS232"],
  ["G106643", "ชั่งละเอียด 0.01 กรัม"],
  ["G106742", "เตือนเมื่อชั่งขาดหรือเกิน"],
  ["G106650", "นับจำนวนชิ้นงานได้"],
  ["G106537", "จอแสดงผลแยกจากแท่นชั่ง"],
  ["G106803", "ชั่งได้ถึง 3 กก."],
  ["G106308", "ชั่งบนแท่นได้ถึง 60 กก."],
  ["G106810", "ชั่งละเอียด 0.01 กรัม"],
  ["G106322", "ชั่งบนโต๊ะได้ถึง 30 กก."],
  ["G106674", "ชั่งละเอียด 0.01 กรัม"],
  ["G106469", "ชั่งกาแฟพร้อมจับเวลา"],
  ["G106186", "คำนวณราคาจากน้ำหนัก"],
  ["G106179", "ชั่งส่วนผสมได้ถึง 5 กก."],
  ["G106209", "คำนวณราคาจากน้ำหนัก"],
  ["G106254", "ชั่งละเอียด 0.1 กรัม"],
  ["G106216", "จอบนเสา เห็นราคาฝั่งลูกค้า"],
  ["G106292", "ชั่งวัตถุดิบได้ถึง 15 กก."],
  ["G108562", "จอสองด้าน เห็นราคาทั้งคู่"],
  ["G107770", "จอ LCD อ่านได้ไกล 4 เมตร"],
  ["G107787", "จอ LED อ่านได้ไกล 8 เมตร"],
  ["G107794", "หัวอ่านกันน้ำกันฝุ่น IP67"],
  ["G107800", "หัวอ่านกันน้ำกันฝุ่น IP67"],
  ["G107534", "โครงแท่นเหล็กคาร์บอน"],
  ["G107589", "แท่นชั่งพร้อมเสาติดหัวอ่าน"],
  ["G107268", "เครื่องพิมพ์สำหรับจุดขาย"],
  ["G107282", "พิมพ์สติกเกอร์คู่กับ AW31"],
  ["G107305", "แบตเตอรี่ในตัว ชาร์จไฟได้"],
  ["G108012", "ระบบ Windows 10 Pro"],
  ["G108029", "จอสัมผัส 15.6 นิ้ว"],
  ["G108050", "จอสัมผัส 12.5 นิ้ว"],
  ["G108043", "พิมพ์สลิปขนาด 80 มม."],
  // Exact component lists for these Warehouse SKUs.
  ["11", "ใช้กับอะแดปเตอร์"],
  ["G106155", "มีแบตเตอรี่เป็นส่วนประกอบ"],
]);

const categoryFacts = new Map([
  ["scales", "ชั่งน้ำหนักสินค้า"],
  ["indicators", "อ่านค่าน้ำหนักจากแท่นชั่ง"],
  ["platforms", "แท่นสำหรับวางของขณะชั่ง"],
  ["pos", "สำหรับงานขายหน้าร้าน"],
  ["accessories", "อุปกรณ์สำหรับใช้งานร่วมกัน"],
]);

const materials = new Map([
  ["platform-carbon-steel", "โครงแท่นเหล็กคาร์บอน"],
  ["platform-sus304", "โครงแท่นสเตนเลส SUS304"],
  ["platform-sus201", "โครงแท่นสเตนเลส SUS201"],
]);

type Rule = readonly [evidence: RegExp, copy: string];

const scaleFeatures: readonly Rule[] = [
  [/^จอ\s*(?:LCD|LED).{0,40}(?:2 ด้าน|สองด้าน)/i, "แสดงผลทั้งสองด้าน"],
  [/^(?:แจ้งเตือน|เตือน)(?:เมื่อชั่ง|ช่วง)?\s*น้ำหนักขาด.{0,5}เกิน/, "เตือนเมื่อชั่งขาดหรือเกิน"],
  [/^(?:สามารถ)?\s*นับจำนวน(?:ชิ้น|ได้)|^แสดงจำนวนนับชิ้นงาน/, "นับจำนวนชิ้นงานได้"],
  [/^แบตเตอรี่ลิเธียม|^ใช้แบตเตอรี่ลิเธียม/, "ใช้แบตเตอรี่ลิเธียม"],
  [/^หักน้ำหนักภาชนะ/, "หักน้ำหนักภาชนะได้"],
  [/^ส่งข้อมูลผ่านพอ(?:ร์|ร)ท?\s*RS[\s-]?232/i, "ส่งข้อมูลผ่านพอร์ต RS232"],
];

const scaleNames: readonly Rule[] = [
  [
    /^จัดชุด.*พร้อมเครื่องพิมพ์|^พร้อมเครื่องพิมพ์|^SUNFORD .+ with LP5[01] Printer/i,
    "ชุดเครื่องชั่งพร้อมเครื่องพิมพ์",
  ],
  [/^จัดชุด.*พร้อมจอเสริม|^พร้อมจอเสริม/i, "ชุดเครื่องชั่งพร้อมจอเสริม"],
  [/^จัดชุด.*พร้อม Floor pole/i, "ชุดเครื่องชั่งพร้อมเสา"],
  [/checkweigher/i, "สำหรับตรวจสอบน้ำหนัก"],
  [/Fitdays Smart Scale/i, "เครื่องชั่งระบบ Fitdays"],
  [/\(3 buttons\)/i, "แผงควบคุม 3 ปุ่ม"],
  [/^SUNFORD .+ Poleless$/i, "รุ่นไม่มีเสา"],
  [/^แท่นชั่งพร้อมโหลดเซล(?:ล์|ส์)(?=\s|$)/, "แท่นชั่งพร้อมเซนเซอร์รับน้ำหนัก"],
  [/^แท่น(?:แสตน|สแตน|สเตน)เลสทรงเก้าอี้/, "แท่นสเตนเลสทรงเก้าอี้"],
  [
    /^(?:พร้อม Certificate of calibration|.*\(Free Certificate of calibration\))/i,
    "มาพร้อมใบรับรองการสอบเทียบ",
  ],
  [/เครื่องชั่ง[- ]?นับจำนวน/, "นับจำนวนชิ้นงานได้"],
  [/เครื่องชั่งค(?:ำนวณ|ำนวน)ราคา/, "คำนวณราคาจากน้ำหนัก"],
  [/เครื่องชั่ง.*ชาร์จไฟได้/, "ชาร์จไฟได้"],
  [/เครื่องชั่ง.*มีอ่าง/, "มาพร้อมอ่างชั่ง"],
  [/^มีเสา(?=\s|$)/, "มาพร้อมเสาสำหรับหัวอ่าน"],
  [/^ไม่มีเสา(?=\s|$)/, "รุ่นไม่มีเสา"],
  [/^แท่นเหล็ก เสาเหล็ก/, "แท่นชั่งเหล็กพร้อมเสา"],
  [/^แท่นเหล็ก เสาสแตนเลส/, "แท่นเหล็กพร้อมเสาสเตนเลส"],
  [/^แท่นแสตนเลส[\sท]/, "แท่นชั่งทำจากสเตนเลส"],
  [/^SUNFORD .+ - Stainless Steel SUS304/i, "โครงแท่นสเตนเลส SUS304"],
  [/^SUNFORD .+ - Stainless Steel SUS201/i, "โครงแท่นสเตนเลส SUS201"],
];

const accessoryNames: readonly Rule[] = [
  [/จอแสดงผล C1\/C5(?=\s|$)/i, "จอเสริมสำหรับรุ่น C1/C5"],
  [/ลิ้นชักไฟฟ้า/, "ลิ้นชักเก็บเงินระบบไฟฟ้า"],
  [/กล้องถ่ายภาพ AI\b/i, "กล้องสำหรับถ่ายภาพ"],
  [/^Accessory for POS - Basic$/i, "อุปกรณ์ต่อพ่วงสำหรับ POS"],
  [/^(?:ล้อ PU 2"|ล้อแท่นชั่ง พียูดำ 2นิ้ว)/i, "ล้อพียูขนาด 2 นิ้ว"],
  [/ลูกตุ้มน้ำหนัก/, "ตุ้มน้ำหนักสำหรับงานชั่ง"],
  [/สแกนเนอร์.*(?:1D|1 มิติ).*ไร้สาย/i, "อ่านบาร์โค้ด 1 มิติแบบไร้สาย"],
  [/สแกนเนอร์.*(?:1D|1 มิติ).*มีสาย/i, "อ่านบาร์โค้ด 1 มิติแบบมีสาย"],
  [/คีย์บอร์ดและเม้าส์\s*ไร้สาย/, "ชุดคีย์บอร์ดและเมาส์ไร้สาย"],
  [/ไฟเตือน.*ไม่มีเสียง/, "ไฟเตือนแบบไม่มีเสียง"],
  [/ไฟเตือน.*มีเสียง|^R-Pole 12V มีเสียง/i, "ไฟเตือนพร้อมเสียง"],
  [/data cable RS232-USB SERIAL/i, "สาย RS232 เป็น USB แบบ Serial"],
  [/data cable RS232-USB HID/i, "สาย RS232 เป็น USB แบบ HID"],
  [/สายนำสัญญาณ RS232/i, "สายสัญญาณพอร์ต RS232"],
  [/ล้อ.*ชุดละ 4 ล้อ.*ล็อ[กค] 2/, "ชุด 4 ล้อ มีตัวล็อก 2 ล้อ"],
  [/จานชั่งลูกกลิ้งลำเลียง/, "จานชั่งพร้อมลูกกลิ้งลำเลียง"],
  [/คอเสากลมสแตนเลส ปรับองศา/, "คอเสาสเตนเลสปรับมุมได้"],
  [/คอเสากลมสแตนเลส ไม่ปรับองศา/, "คอเสาสเตนเลสแบบมุมคงที่"],
  [/คอเสากลมพลาสติก/, "คอเสากลมผลิตจากพลาสติก"],
  [/ขาตั้งโต๊ะสแตนเลสเสากลม/, "ขาตั้งสเตนเลสแบบเสากลม"],
  [/ขาตั้งโต๊ะสแตนเลสเสาเหลี่ยม/, "ขาตั้งสเตนเลสแบบเสาเหลี่ยม"],
  [/หน้าโต๊ะสแตนเลส/, "พื้นโต๊ะทำจากสเตนเลส"],
  [/ขาเกลียวปรับระดับ/, "ปรับระดับด้วยเกลียว"],
  [/Loadcell Cable/i, "สายสำหรับโหลดเซลล์"],
  [/Cable connector \(1 คู่\)/i, "หัวต่อสาย 1 คู่"],
  [/สติ๊กเกอร์เลเบล \(กันน้ำ\)/, "ฉลากสติกเกอร์ชนิดกันน้ำ"],
  [/กระดาษความร้อน/, "กระดาษสำหรับพิมพ์ความร้อน"],
  [/อุปกรณ์ส่งสัญญาณ บลูทูธ/i, "ส่งสัญญาณแบบ Bluetooth"],
  [/ส่วนขยายวงจร บลูทูธ/i, "วงจรเสริม Bluetooth"],
  [/จอแสดงผล LED-/i, "จอแสดงผลชนิด LED"],
  [/^จอแสดงผล SUNFORD LCD-/i, "จอแสดงผลชนิด LCD"],
  [/^SUNFORD WT10 - Industrial tablet/i, "แท็บเล็ตสำหรับงานอุตสาหกรรม"],
  [/^แท่นเหล็ก เสาเหล็ก/, "แท่นชั่งเหล็กพร้อมเสา"],
  [/ชิ้นส่วน - Adapter$/i, "อะแดปเตอร์สำหรับจ่ายไฟ"],
  [/ชิ้นส่วน - Battery$/i, "แบตเตอรี่สำหรับเปลี่ยน"],
  [/ชิ้นส่วน - Floor pole$/i, "เสาติดตั้งแบบตั้งพื้น"],
  [/ชิ้นส่วน - Load cell$/i, "เซนเซอร์รับน้ำหนัก"],
  [/ชิ้นส่วน - PCB$/i, "แผงวงจรอะไหล่"],
  [/หน้าปัดและแผงปุ่มกด/, "หน้าปัดพร้อมแผงปุ่มควบคุม"],
  [/ชิ้นส่วน - ชุดสายไฟ/, "ชุดสายสำหรับจ่ายไฟ"],
  [/ชิ้นส่วน - จอแสดงผล$/, "อะไหล่จอแสดงผล"],
  [/^จานชั่งแสตนเลส/, "จานชั่งทำจากสเตนเลส"],
  [/ชิ้นส่วน - จานชั่ง$/, "จานสำหรับวางสิ่งที่ชั่ง"],
  [/แผ่นครอบใส/, "แผ่นครอบแบบใส"],
  [/ขาตั้งเครื่องพิมพ์/, "ขาตั้งสำหรับเครื่องพิมพ์"],
  [/ชิ้นส่วน - RAMP\s/i, "ทางลาดสำหรับขึ้นแท่นชั่ง"],
  [/วงจรแท่นชั่งเทอร์มินอล/, "วงจรสำหรับแท่นชั่งเทอร์มินอล"],
  [/อะไหล่เพื่องานซ่อม|อะไหล่เบ็ดเตล็ด/, "อะไหล่สำหรับงานซ่อม"],
  [/^เสาแสตนเลส$/, "เสาทำจากสเตนเลส"],
];

const materialNames: readonly Rule[] = [
  [/\bM\d+\s+ถุงใส/u, "ถุงใสสำหรับบรรจุ"],
  [/\bM\d+\s+ถุงพิมพ์สี/u, "ถุงบรรจุแบบพิมพ์สี"],
  [/\bM\d+\s+ยางหุ้ม/u, "ยางสำหรับหุ้มชิ้นส่วน"],
  [/\bM\d+\s+ยางวง/u, "ยางรัดแบบวง"],
  [/\bM\d+\s+กล่องกระดาษ/u, "กล่องกระดาษสำหรับบรรจุ"],
];

function matchingCopy(rules: readonly Rule[], evidence: readonly string[]) {
  return rules.find(([pattern]) => evidence.some((line) => pattern.test(line)))?.[1];
}

const units = new Map([
  ["g", "กรัม"],
  ["ก.", "กรัม"],
  ["กรัม", "กรัม"],
  ["mg", "มก."],
  ["มก.", "มก."],
  ["มิลลิกรัม", "มก."],
  ["kg", "กก."],
  ["กก.", "กก."],
  ["กิโลกรัม", "กก."],
]);

const connectionFacts: readonly Rule[] = [
  [/^ส่งข้อมูลผ่าน Bluetooth(?=\s|$)/i, "ส่งข้อมูลผ่าน Bluetooth"],
  [/^ส่งข้อมูลผ่านพอ(?:ร์ต|ร์ท|รท)\s*RS[- ]?232(?=\s|$)/i, "ส่งข้อมูลผ่านพอร์ต RS232"],
  [/^มีพอ(?:ร์ต|ร์ท|รท)\s*RS[- ]?232(?=\s|$)/i, "มีพอร์ต RS232"],
];

function statedCapacity(capacity: string) {
  const match = /^(\d+(?:\.\d+)?)\s*(kg|g|กก\.|กิโลกรัม|กรัม)$/i.exec(capacity.trim());
  if (!match || Number(match[1]) <= 0) return;
  const unit = units.get(match[2].toLowerCase());
  if (unit === "กรัม" && Number(match[1]) >= 1_000)
    return "ชั่งได้ถึง " + Number(match[1]) / 1_000 + " กก.";
  if (unit) return "ชั่งได้ถึง " + match[1] + " " + unit;
}

function scaleCopy(product: LineupProduct, name: string, lines: string[]) {
  const copy = matchingCopy(scaleNames, [name, ...lines]) ?? matchingCopy(scaleFeatures, lines);
  if (copy) return copy;
  const groups = product.warehouseSubcategoryIds ?? [];
  if (groups.includes("scale-price")) return "คำนวณราคาจากน้ำหนัก";
  const measure = /^(\d+(?:\.\d+)?)\s*(g|kg|mg|ก\.|กก\.|มก\.|กรัม|กิโลกรัม|มิลลิกรัม)$/i.exec(
    product.readability.trim(),
  );
  if (measure && Number(measure[1]) > 0) {
    return "ชั่งละเอียด " + measure[1] + " " + units.get(measure[2].toLowerCase());
  }
  // A capacity must have a unit and be labeled, or be part of the published capacity/readability pair.
  const explicitSpecs = [name, ...lines];
  const capacityValue = explicitSpecs
    .map((line) => {
      const paired = /(?:^|[ (])(\d+(?:\.\d+)?)\s*(?:kg|กก\.|กิโลกรัม)(?=\s*\/)/i.exec(line);
      const labeled = /พิกัด\s*(\d+(?:\.\d+)?)\s*(?:kg|กก\.|กิโลกรัม)(?=\s|$)/i.exec(line);
      return paired?.[1] ?? labeled?.[1];
    })
    .find(Boolean);
  if (capacityValue && Number(capacityValue) > 0) return "ชั่งได้ถึง " + capacityValue + " กก.";
  const display =
    /\(จอ\s*(LCD|LED)\)/i.exec(name) ??
    lines.map((line) => /^\d+(?:\.\d+)?kg_(LCD|LED)(?=\s|$)/i.exec(line)).find(Boolean);
  if (display) return "จอแสดงผลชนิด " + display[1].toUpperCase();
  const fact =
    matchingCopy(connectionFacts, [product.connection.trim()]) ?? statedCapacity(product.capacity);
  if (fact) return fact;
  if (groups.includes("scale-analytical")) return "สำหรับงานชั่งในห้องปฏิบัติการ";
  if (groups.includes("scale-benchtop")) return "สำหรับชั่งแบบตั้งโต๊ะ";
  if (groups.includes("scale-floor")) return "สำหรับชั่งแบบตั้งพื้น";
}

function indicatorCopy(lines: string[]) {
  const display = lines
    .map((line) =>
      /^(?:หัวอ่าน(?:น้ำ|นำ)หนัก\s+)?จอ\s*(LCD|LED)\s*ระยะมองเห็น\s*(\d+)\s*เมตร/i.exec(line),
    )
    .find(Boolean);
  if (display) return "จอ " + display[1].toUpperCase() + " อ่านได้ไกล " + display[2] + " เมตร";
  return matchingCopy(
    [
      [/^(?:หัวอ่านน้ำหนัก )?จอ\s*LED\b/i, "จอแสดงผลชนิด LED"],
      [/^(?:หัวอ่านน้ำหนัก )?จอ\s*LCD\b/i, "จอแสดงผลชนิด LCD"],
    ],
    lines,
  );
}

function posCopy(product: LineupProduct, name: string, lines: string[]) {
  const pack = lines
    .map((line) => /^แพ[็กค]+เกจ\s*(\d+)\s*เดือน(?=\s|$)/u.exec(line))
    .find(Boolean);
  if (pack) return "สิทธิ์ใช้งาน " + pack[1] + " เดือน";
  const copy = matchingCopy(
    [
      [/^Set\b.*Drawer/i, "ชุดขายพร้อมลิ้นชักเก็บเงิน"],
      [/^Set SUNFORD POS1100[AB] P1$/i, "ชุด POS พร้อมเครื่องชั่ง"],
      [/^Set SUNFORD POS P1$/i, "ชุดขายระบบ Android"],
      [/^Set SUNFORD POS P4$/i, "ชุด POS พร้อมจอสัมผัส"],
      [/^Set SUNFORD POS P2$/i, "ชุดระบบขายหน้าร้าน"],
      [/^.*ชุดโปรแกรมจัดการขาย\s*พร้อมเครื่องชั่งดิจิตอล/, "ชุดโปรแกรมขายพร้อมเครื่องชั่ง"],
      [/Connect POS/i, "โปรแกรมระบบขาย POS"],
      [/WEWEIGH\s*(?:2\s*)?WORK\s*ST(?:A|S)T/i, "เวิร์กสเตชันระบบ WeWeigh"],
      [/เครื่องบันทึกเงินสด/, "สำหรับบันทึกรายการขาย"],
    ],
    [name, ...lines],
  );
  if (copy) return copy;
  const groups = product.warehouseSubcategoryIds ?? [];
  if (groups.includes("pos-android")) return "ใช้กับระบบ Android";
  if (groups.includes("pos-windows")) return "ใช้กับระบบ Windows";
}

function accessoryCopy(name: string, lines: string[]) {
  if (/Cash Drawer/i.test(name)) {
    if (lines.some((line) => /^ดำ-SUNFORDDRW350-B$/i.test(line))) return "ลิ้นชักเก็บเงินสีดำ";
    if (lines.some((line) => /^ขาว-SUNFORDDRW350-W$/i.test(line))) return "ลิ้นชักเก็บเงินสีขาว";
  }
  const carton = lines
    .map((line) => /(?:^|[\s(])1\s*ลัง\s*(?:=|\()\s*(\d+)\s*ม้วน/.exec(line))
    .find(Boolean);
  if (carton) return "ลังละ " + carton[1] + " ม้วน";
  const consumable = [name, ...lines].find((line) => /กระดาษความร้อน|สติ๊กเกอร์เลเบล/.test(line));
  const rollCount = /(?:บรรจุ|แพ[็กค]+)\s*(\d+)\s*ม้วน/u.exec(consumable ?? "")?.[1];
  if (rollCount) return "แพ็ก " + rollCount + " ม้วน";
  return matchingCopy(accessoryNames, [name, ...lines]);
}

function warehouseHighlight(product: LineupProduct) {
  const name = product.warehouseName?.trim() ?? "";
  const lines = [product.subtitle, product.description]
    .flatMap((evidence) => evidence.split(/\r?\n+/))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
  switch (product.warehouseCategoryId) {
    case "scales":
      return scaleCopy(product, name, lines);
    case "indicators":
      return indicatorCopy(lines) ?? matchingCopy(connectionFacts, [product.connection.trim()]);
    case "platforms":
      if (/ชิ้นส่วน - Platform Terminal\b/i.test(name)) return "แท่นชั่งแบบเทอร์มินอล";
      return (
        matchingCopy([[/^แท่นแสตนเลสทางลาด/, "แท่นสเตนเลสแบบทางลาด"]], lines) ??
        product.warehouseSubcategoryIds?.map((id) => materials.get(id)).find(Boolean)
      );
    case "pos":
      return posCopy(product, name, lines);
    case "accessories":
      return accessoryCopy(name, lines);
    case "uncategorized":
      return product.warehouseGroup === "วัตถุดิบ"
        ? matchingCopy(materialNames, [name])
        : accessoryCopy(name, lines);
  }
}

const groupFacts = new Map([
  ["สินค้าจำหน่ายแบบแพ็ก", "รวมสินค้าเป็นชุด"],
  ["โปรแกรมและสิทธิ์ใช้งาน", "ซอฟต์แวร์และสิทธิ์ใช้งาน"],
  ["เครื่องพิมพ์", "สำหรับงานพิมพ์"],
  ["วัสดุสิ้นเปลือง", "วัสดุสำหรับเติมหรือเปลี่ยน"],
  ["อุปกรณ์ต่อพ่วง", "ต่อพ่วงกับอุปกรณ์หลัก"],
  ["ลูกตุ้มและตุ้มน้ำหนัก", "ตุ้มน้ำหนักสำหรับงานชั่ง"],
]);

export function lineupSalesCopy(product: LineupProduct): string {
  if (!product.warehouseSku) return "";
  const name = product.name.trim().toLocaleLowerCase("th");
  const type =
    product.warehouseGroup === "เครื่องพิมพ์" &&
    product.warehouseSubcategoryIds?.includes("accessory-pos")
      ? "พิมพ์ที่จุดขาย"
      : groupFacts.get(product.warehouseGroup ?? "");
  const alternatives = [
    highlights.get(product.warehouseSku),
    warehouseHighlight(product),
    type,
    categoryFacts.get(product.warehouseCategoryId ?? ""),
  ];
  return (
    alternatives.find(
      (copy) => copy && copy.length <= maxLength && copy.toLocaleLowerCase("th") !== name,
    ) ?? ""
  );
}
