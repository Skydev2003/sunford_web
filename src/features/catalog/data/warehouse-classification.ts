import type { Product } from "../types";

export type WarehouseClassification = {
  categoryId: string | undefined;
  subcategoryIds: string[];
  evidence: string[];
  reviewReasons: string[];
};

const outsideGroups = new Set([
  "ค่าบริการ",
  "ค่าขนส่ง",
  "ส่วนลด",
  "บัตรกำนัล",
  "วัตถุดิบ",
  "ถุงมือและอุปกรณ์ป้องกัน",
]);

export function classifyWarehouseProduct(
  product: Product,
  catalog: Product[] = [],
): WarehouseClassification {
  const name = product.warehouseName ?? "";
  const description = product.description ?? "";
  const group = product.warehouseGroup ?? "";
  const specifications = product.warehouseSpecifications ?? [];
  const fact = (label: string) => specifications.find((row) => row.label === label)?.value ?? "";
  const evidence: string[] = [];
  const reviewReasons: string[] = [];
  const subcategoryIds: string[] = [];
  const result = (categoryId?: string) => ({ categoryId, subcategoryIds, evidence, reviewReasons });

  if (outsideGroups.has(group)) {
    evidence.push(`Warehouse ระบุกลุ่ม ${group}`);
    reviewReasons.push(
      `กลุ่ม ${group} ไม่มีหมวดตรงในห้าหมวดสินค้าเดิม ต้องการคงในรายการอื่น ๆ หรือกำหนดแนวทางใด?`,
    );
    return result();
  }

  // Inspect the main item before names of accessories included with it.
  const identity = [name, description].map((text) => text.split(/พร้อม|\bwith\b/i)[0]).join(" ");
  const platform =
    /\bPlatform\b|โครงสร้างแท่นชั่ง|แท่นเปล่า|แท่นชั่ง(?:พร้อม|หร้อม)โหลดเซล[ลส]์?/i.test(
      name + " " + description,
    );
  const family = [
    { id: "platforms", matches: platform },
    { id: "scales", matches: /เครื่องชั่ง|\bCHECKWEIGHER\b/i.test(identity) },
    { id: "indicators", matches: /\bIndicator\b|หัวอ่าน|อินดิเคเตอร์/i.test(identity) },
    {
      id: "pos",
      matches:
        !/Accessory for POS/i.test(name) &&
        /เครื่องบันทึกเงินสด|\bPOS\b|\bWORKST[AS]TION\b/i.test(identity),
    },
    { id: "scales", matches: group === "เครื่องชั่ง" },
    { id: "pos", matches: /ระบบขาย|เวิร์กสเตชัน|โปรแกรม|สิทธิ์ใช้งาน/.test(group) },
    {
      id: "accessories",
      matches: /ชิ้นส่วน|อุปกรณ์|วัสดุสิ้นเปลือง|เครื่องพิมพ์|ลูกตุ้ม/.test(group),
    },
  ].find((entry) => entry.matches);
  let categoryId = family?.id;
  if (!categoryId && group === "สินค้าจำหน่ายแบบแพ็ก") {
    const reference = catalog.find((candidate) => {
      if (candidate.warehouseGroup !== "เครื่องชั่ง") return false;
      const model = candidate.warehouseSpecifications?.find(
        (row) => row.label === "รุ่นสินค้า",
      )?.value;
      if (!model || model.length < 3) return false;
      const escaped = model.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(?:^|[^A-Z0-9-])${escaped}(?=$|[^A-Z0-9-])`, "i").test(identity);
    });
    if (reference) {
      categoryId = "scales";
      evidence.push(
        `เครื่องหลักในชุดตรงรุ่นสินค้า verified ของ Warehouse SKU ${reference.warehouseSku}`,
      );
    }
  }
  if (!categoryId) {
    evidence.push(`ชื่อ ${name}; กลุ่ม Warehouse ${group || "ว่าง"}`);
    reviewReasons.push("ขอชื่อหรือประเภทเครื่องหลักของ SKU นี้ เพื่อเลือกหมวดจากห้าหมวดเดิม");
    return result();
  }
  evidence.push(`ชื่อ/คำอธิบายเครื่องหลักและกลุ่ม Warehouse ${group || "ว่าง"}`);
  const add = (id: string, value: string) => {
    subcategoryIds.push(id);
    evidence.push(`${id}: ${value}`);
  };
  const normalized = (text: string) => text.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const modelPattern =
    /\b(?:TCS|TMS|TIS|TSS|FCS|VCS|ACS)[-\s]?\d+[-\s]?(?:AW31S?|SW31S?|AC31[SP]?|JC91S?|JE62ZR|JC62Z)/gi;
  const namedModels = name.match(modelPattern) ?? [];
  const describedModels = description.match(modelPattern) ?? [];
  if (
    namedModels.length &&
    describedModels.length &&
    !namedModels.some((named) =>
      describedModels.some((described) => normalized(named) === normalized(described)),
    )
  ) {
    reviewReasons.push(
      `ชื่อขายระบุ ${namedModels.join(", ")} แต่คำอธิบายระบุ ${describedModels.join(", ")} ขอรุ่นของชุดที่ส่งมอบจริง`,
    );
  }
  let highlights = fact("จุดเด่นสินค้า");
  const subjects = [...highlights.matchAll(/(?:SUNFORD|ซันฟอร์ด)\s+([A-Z][A-Z\d-]+)/g)].map(
    (match) => match[1],
  );
  const conflicts = subjects.filter((subject) => !normalized(name).includes(normalized(subject)));
  if (conflicts.length) {
    reviewReasons.push(
      `จุดเด่นสินค้าอ้างชื่อรุ่น ${conflicts.join(", ")} ซึ่งต่างจากชื่อขาย ขอข้อมูลจุดเด่นของ SKU นี้`,
    );
    highlights = "";
  }
  const prose = name + "\n" + description + "\n" + highlights;
  const supported = (value: string) => /^(รองรับ|ใช่|yes|true)$/i.test(value.trim());
  if (categoryId === "scales") {
    if (/คำนวณราคา/.test(identity) || supported(fact("คำนวณราคาสินค้า")))
      add("scale-price", fact("คำนวณราคาสินค้า") || identity);
    if (/อุตสาหกรรม|โรงงาน|งานผลิต/.test(prose))
      add(
        "scale-industrial",
        prose.match(/[^\n]*?(?:อุตสาหกรรม|โรงงาน|งานผลิต)[^\n]*/)?.[0] ?? name,
      );
    if (/ห้องปฏิบัติการ|งานวิเคราะห์ความแม่นยำสูง/.test(prose) || /วิเคราะห์/.test(identity))
      add("scale-analytical", identity);
    if (/งานครัว|กาแฟ|เบเกอรี่|ในครัว|ประกอบอาหาร|ส่วนผสมอาหาร/.test(prose))
      add(
        "scale-kitchen",
        prose.match(
          /[^\n]*?(?:งานครัว|กาแฟ|เบเกอรี่|ในครัว|ประกอบอาหาร|ส่วนผสมอาหาร)[^\n]*/,
        )?.[0] ?? name,
      );
    if (
      !/ไม่กันน้ำ/.test(identity) &&
      (/กันน้ำ/.test(identity) ||
        /ตัวเครื่องกันน้ำ|เครื่องชั่งกันน้ำ|\bIP\s*(?:67|68)\b/i.test(highlights))
    )
      add("scale-water-dust", identity + " " + highlights);
    if (/ตั้งโต๊ะ/.test(identity) || /(?:แบบ|เครื่องชั่ง)ตั้งโต๊ะ/.test(highlights))
      add("scale-benchtop", identity + " " + highlights);
    if (/ตั้งพื้น/.test(identity) || /(?:แบบ|เครื่องชั่ง)ตั้งพื้น/.test(highlights))
      add("scale-floor", identity + " " + highlights);
    if (!/ไม่มีเสา|poleless/i.test(identity) && /มีเสา|พร้อมเสา/.test(name + " " + description))
      add("scale-pole", name + " " + description);
  }
  if (categoryId === "indicators") {
    const display = fact("ชนิดหน้าจอ") || name.match(/\b(?:LCD|LED)\b/i)?.[0] || "";
    if (/LCD/i.test(display) && !/LED/i.test(display)) add("indicator-lcd", display);
    if (/LED/i.test(display) && !/LCD/i.test(display)) add("indicator-led", display);
    if (/กันน้ำ/.test(name) || /ตัวเครื่องกันน้ำ|\bIP\s*(?:67|68)\b/i.test(highlights))
      add("indicator-waterproof", name + " " + highlights);
  }
  if (categoryId === "platforms") {
    const material = fact("วัสดุโครงสร้าง");
    const materials = [
      ["platform-carbon-steel", /Carbon Steel|เหล็กคาร์บอน/i],
      ["platform-sus304", /SUS\s*304/i],
      ["platform-sus201", /SUS\s*201/i],
      ["platform-abs", /\bABS\b/i],
    ] as const;
    const matches = materials.filter(([, pattern]) => pattern.test(material));
    if (matches.length === 1) add(matches[0][0], material);
    if (matches.length > 1)
      reviewReasons.push("ข้อมูลวัสดุโครงระบุหลายชนิด ขอวัสดุของโครงแท่นที่ส่งมอบจริง");
  }
  if (categoryId === "pos") {
    const os = fact("ระบบปฏิบัติการและเวอร์ชัน") || fact("ระบบปฏิบัติการ");
    const operatingSystems = [
      ["pos-android", /\bAndroid\b/i],
      ["pos-windows", /\bWindows\b/i],
      ["pos-ios", /\biOS\b/i],
    ] as const;
    const matches = operatingSystems.filter(([, pattern]) =>
      pattern.test(os || name + " " + description),
    );
    if (matches.length === 1) add(matches[0][0], os || name + " " + description);
    if (matches.length > 1)
      reviewReasons.push(
        "ข้อมูลระบุหลายระบบปฏิบัติการ ขอระบบของเครื่องหรือสิทธิ์ใช้งานที่ขายตาม SKU นี้",
      );
  }
  if (categoryId === "accessories") {
    if (/จอแสดง|ไฟเตือน|ไฟสัญญาณ|\bLCD.?C1.?C5\b/i.test(name + " " + description))
      add("accessory-displays", name);
    if (/เครื่องพิมพ์|ลิ้นชัก|สแกน|คีย์บอร์ด|เม[้า]+ส์|Accessory for POS/i.test(name))
      add("accessory-pos", name);
    else if (
      /สาย(?:สัญญาณ|นำสัญญาณ|ส่งข้อมูล|ไฟ)|ชุดสาย|หัวต่อ|\bConnector\b|\bCable\b|RS232/i.test(name)
    )
      add("accessory-cables", name);
    if (
      /จานชั่ง|ทางลาด|ขาเกลียว|คอเสา|ขาตั้งโต๊ะ|หน้าโต๊ะ|Floor pole|RAMP|(?:^|[\s-])ล้อ/i.test(
        name + " " + description,
      )
    )
      add("accessory-mechanical", name + " " + description);
    if (group === "วัสดุสิ้นเปลือง") add("accessory-consumables", group);
  }
  const model = fact("รุ่นสินค้า");
  if (
    model &&
    normalized(model) !== normalized(product.warehouseSku ?? "") &&
    !normalized(name).includes(normalized(model))
  )
    reviewReasons.push(
      `รุ่นสินค้าใน verified fact เป็น "${model}" แต่ชื่อขายระบุ "${name}" ขอชื่อรุ่นที่ยืนยันแล้ว`,
    );
  if (!subcategoryIds.length) {
    const questions: Record<string, string> = {
      scales:
        "ขอรูปแบบการตั้งเครื่องหรือการใช้งานที่ยืนยันของรุ่นนี้ (ตั้งโต๊ะ ตั้งพื้น มีเสา งานผลิต วิเคราะห์ ครัว หรือกันน้ำ)",
      indicators: "ขอชนิดจอ LCD/LED หรือระดับการกันน้ำของหัวอ่านรุ่นที่ขาย",
      platforms:
        "ขอวัสดุโครงแท่นและเกรด (เหล็กคาร์บอน SUS304 SUS201 หรือ ABS) แยกจากวัสดุจานและเสา",
      pos: "ขอระบบปฏิบัติการของเครื่องหรือแพ็กเกจที่ขาย (Android Windows หรือ iOS)",
      accessories: "ขอหน้าที่ของชิ้นส่วนและรุ่นที่ใช้ร่วมกัน เพื่อเลือกหมวดย่อยเดิมให้ตรง",
    };
    reviewReasons.push(questions[categoryId]);
  }
  return result(categoryId);
}
