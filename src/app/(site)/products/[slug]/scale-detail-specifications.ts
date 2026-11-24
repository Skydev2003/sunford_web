import { catalogFieldValue } from "@/features/catalog/data/catalog-decision-facts";
import { groupProductDetails } from "@/features/catalog/data/product-detail-groups";

type SourceRow = { label: string; html: string };
type Row = SourceRow | { label: string; value: string };
type Group = { id: string; title: string; rows: Row[] };

export function scaleWeight(value?: string) {
  const match = value?.match(/^([\d,.]+)\s*(kg|g|กก\.?|กิโลกรัม|กรัม)$/i);
  return match
    ? { amount: match[1], unit: /^(?:g|กรัม)$/i.test(match[2]) ? "กรัม" : "กิโลกรัม" }
    : { amount: value, unit: "" };
}

function dimensions(values: (string | undefined)[]) {
  const parts = values.map((value) => value?.match(/^(\d+(?:\.\d+)?)\s*(mm|cm)$/i));
  if (!parts.every((part) => part !== undefined && part !== null)) return;
  return (
    parts
      .map((part) => String(Number(part[1]) / (part[2].toLowerCase() === "mm" ? 10 : 1)))
      .join(" × ") + " ซม."
  );
}

function weighingRanges(value?: string) {
  if (!value) return [];
  const pattern =
    /ช่วง\s*([\d.]+)\s*[-–]\s*([\d.]+)\s*(กิโลกรัม|กรัม|kg|g)\s*ขึ้นทีละ\s*([\d.]+)\s*(กิโลกรัม|กรัม|kg|g)/gi;
  const matches = [...value.matchAll(pattern)];
  if (matches.length < 2 || value.replace(pattern, "").replace(/หรือ|[\s,;]/g, "")) return [];
  return matches.map(([, from, to, unit, step, stepUnit]) => ({
    label: `ช่วง ${from}–${to} ${/^(?:kg|กิโลกรัม)$/i.test(unit) ? "กก." : "กรัม"}`,
    value: `ละเอียด ${step} ${/^(?:kg|กิโลกรัม)$/i.test(stepUnit) ? "กิโลกรัม" : "กรัม"}`,
  }));
}

export function scaleDetailSpecifications(
  source: SourceRow[],
  specifications: { label: string; value: string }[],
  description: string,
  capacity?: string,
) {
  const groups: Group[] = [
    { id: "weighing", title: "การชั่งและการขาย", rows: [] },
    { id: "display", title: "หน้าจอและปุ่มควบคุม", rows: [] },
    { id: "construction", title: "ขนาดและวัสดุ", rows: [] },
    { id: "power", title: "แบตเตอรี่และการแจ้งเตือน", rows: [] },
  ];
  const [weighing, display, construction, power] = groups;
  const facts = new Map(
    specifications.map(({ label, value }) => [label, catalogFieldValue(value)]),
  );
  const consumed = new Set<string>();
  const fact = (label: string) => facts.get(label) ?? undefined;
  const supported = (label: string) => fact(label) === "รองรับ";
  const add = (group: Group, label: string, value?: string, labels: string[] = []) => {
    if (!value) return;
    group.rows.push({ label, value });
    for (const key of labels) consumed.add(key);
  };
  const minimum = scaleWeight(fact("พิกัดชั่งต่ำสุด"));
  add(weighing, "พิกัดชั่งต่ำสุด", [minimum.amount, minimum.unit].filter(Boolean).join(" "), [
    "พิกัดชั่งต่ำสุด",
  ]);
  const ranges = weighingRanges(fact("ช่วงน้ำหนักและค่าละเอียด"));
  if (ranges.length) {
    weighing.rows.push(...ranges);
    consumed.add("ช่วงน้ำหนักและค่าละเอียด");
    const step = scaleWeight(fact("ค่าละเอียดการชั่ง"));
    if (ranges.some(({ value }) => value === `ละเอียด ${step.amount} ${step.unit}`))
      consumed.add("ค่าละเอียดการชั่ง");
  }
  const weighingFeatures = ["ตั้งศูนย์", "หักน้ำหนักภาชนะ"];
  if (weighingFeatures.every(supported))
    add(weighing, "ฟังก์ชันการชั่ง", "ตั้งศูนย์และหักน้ำหนักภาชนะ", weighingFeatures);
  if (supported("รวมเงินหลายรายการ"))
    add(weighing, "รวมยอดสินค้า", "รวมได้หลายรายการ", ["รวมเงินหลายรายการ"]);

  const screen = fact("ชนิดหน้าจอ");
  const backlit = /(?:backlight\s+lcd|lcd\s+backlight)/i.test(description);
  add(display, "หน้าจอ", screen === "LCD" && backlit ? "LCD มีไฟพื้นหลัง" : screen, ["ชนิดหน้าจอ"]);
  const screens = description.match(
    /(?:ด้านหน้าและหลัง|ทั้งสองด้าน|แสดงผลมี\s*2\s*ด้าน)\s*ด้านละ\s*(\d+)\s*จอ/i,
  );
  if (screens) add(display, "การแสดงผล", `หน้าและหลัง ด้านละ ${screens[1]} จอ`);
  if (/ปุ่ม(?:สั่งงาน|ควบคุม)ภาษาไทย/.test(description)) add(display, "ปุ่มควบคุม", "ภาษาไทย");
  const memory = description.match(/บันทึกราคาที่ใช้บ่อยได้\s*(\d+)\s*หน่วยความจำ/);
  if (memory) add(display, "ปุ่มบันทึกราคา", `${memory[1]} ปุ่ม`);

  const pan = ["ความกว้างจาน / แท่นชั่ง", "ความลึกจาน / แท่นชั่ง"];
  add(construction, "ขนาดจานชั่ง (กว้าง × ลึก)", dimensions(pan.map(fact)), pan);
  const body = ["ความกว้างตัวเครื่อง", "ความลึกตัวเครื่อง", "ความสูงตัวเครื่อง"];
  add(construction, "ขนาดตัวเครื่อง (กว้าง × ลึก × สูง)", dimensions(body.map(fact)), body);
  const material = "วัสดุจาน / แท่นชั่ง";
  add(construction, /จานชั่ง/.test(description) ? "วัสดุจานชั่ง" : material, fact(material), [
    material,
  ]);
  if (/จานชั่ง[^\n]{0,65}ถอดทำความสะอาดได้/.test(description))
    add(construction, "ทำความสะอาด", "ถอดจานชั่งได้");

  const hours = description.match(/สูงสุด\s*(\d+(?:\.\d+)?)\s*ชั่วโมงต่อการชาร์จ/);
  if (hours) add(power, "ใช้งานต่อการชาร์จ", `สูงสุด ${hours[1]} ชั่วโมง`);
  const battery = fact("ชนิดแบตเตอรี่");
  const volts = fact("แรงดันแบตเตอรี่");
  if (battery === "Lead-acid" && volts)
    add(power, "แบตเตอรี่ในตัว", `ตะกั่วกรด ${volts}`, ["ชนิดแบตเตอรี่", "แรงดันแบตเตอรี่"]);
  if (/อ[ะแ]ดปเตอร์สำหรับชาร์จไฟฟ้าในชุด/.test(description))
    add(power, "อะแดปเตอร์ชาร์จ", "มีให้ในชุด");
  const batteryCapacity = fact("ความจุแบตเตอรี่");
  add(
    power,
    "ความจุแบตเตอรี่",
    batteryCapacity?.replace(/^(\d+)\b/, (digits) => Number(digits).toLocaleString("en-US")),
    ["ความจุแบตเตอรี่"],
  );
  if (supported("ประหยัดพลังงานอัตโนมัติ"))
    add(power, "ประหยัดพลังงาน", "อัตโนมัติ", ["ประหยัดพลังงานอัตโนมัติ"]);
  const warnings = ["เตือนเมื่อชั่งเกินพิกัด", "เตือนแบตเตอรี่อ่อน"];
  if (warnings.every(supported))
    add(power, "การแจ้งเตือน", "ชั่งเกินพิกัดหรือแบตเตอรี่ต่ำ", warnings);

  if (capacity) consumed.add("พิกัดชั่งสูงสุด");
  const remaining = source.filter(({ label }) => !consumed.has(label));
  const isDisplay = (label: string) => /(?:หน้าจอ|จอแสดงผล|แสงพื้นหลัง|ปุ่ม)/.test(label);
  display.rows.push(...remaining.filter(({ label }) => isDisplay(label)));
  const additional = groupProductDetails(remaining.filter(({ label }) => !isDisplay(label)));
  for (const group of additional) {
    const existing = groups.find(({ id }) => id === group.id);
    if (existing) existing.rows.push(...group.rows);
    else groups.push(group);
  }
  return groups.filter(({ rows }) => rows.length > 0);
}
