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

const analyticalUse =
  /^(?:(?:รองรับ|เหมาะสำหรับ|สำหรับ)\s*)?(?:งานวิเคราะห์(?:ความแม่นยำสูง)?|(?:งาน(?:ใน)?)?ห้องปฏิบัติการ|analytical(?: weighing)?|laboratory(?: weighing)?)$/i;
const enclosureScope = /^(?:ทั้ง\s*)?ตัวเครื่อง(?:\s*อินดิเคเตอร์)?(?:\s*ทั้งหมด)?$/;
const enclosureIp = /^IP\s*(?:67|68)$/i;
const coatedFrame =
  /^(?:(?:ตัวโครง|โครงแท่น|โครงสร้าง)\s*พ่นอบสี\s*กันสนิม|พ่นอบสี\s*กันสนิม\s*ที่\s*(?:ตัวโครง|โครงแท่น|โครงสร้าง))\.?$/;
const toughFrame =
  /^(?:(?:ตัวโครง|โครงแท่น|โครงสร้าง)\s*(?:พลาสติก\s*)?(?:ABS\s*)?เหนียวพิเศษ|ความเหนียวพิเศษของ(?:ตัวโครง|โครงแท่น|โครงสร้าง|โครง))\.?$/i;
const iosVersion = /^iOS(?:\s+\d+(?:\.\d+)*(?:\s*(?:ขึ้นไป|\+))?)?$/i;

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
    const priceCalculation = fact("คำนวณราคาสินค้า");
    const alternatePriceName =
      !priceCalculation.trim() &&
      /เครื่องชั่ง\s*คำนวนราคา/.test(name.split(/พร้อม|\bwith\b/i)[0]) &&
      !/ไม่(?:รองรับ|สามารถ|คำนวน|คำนวณ)/.test(name);
    if (/คำนวณราคา/.test(identity) || supported(priceCalculation) || alternatePriceName)
      add("scale-price", priceCalculation || identity);
    const industrialUse =
      prose.match(/[^\n]*?(?:อุตสาหกรรม|โรงงาน|งานผลิต)[^\n]*/)?.[0] ??
      highlights.match(/^เหมาะกับงานชั่งในกระบวนการผลิตเชิงธุรกิจ\s*$/m)?.[0]?.trim();
    if (industrialUse) add("scale-industrial", industrialUse);
    const use = fact("โหมดการใช้งานเฉพาะทาง").trim();
    if (use.split(/[,/\r\n;]+|และ|หรือ/).every((value) => analyticalUse.test(value.trim())))
      add("scale-analytical", use);
    const kitchenUse =
      prose.match(/[^\n]*?(?:งานครัว|กาแฟ|เบเกอรี่|ในครัว|ประกอบอาหาร|ส่วนผสมอาหาร)[^\n]*/)?.[0] ??
      highlights
        .split(/\r?\n/)
        .find(
          (line) =>
            /^ออกแบบเพื่อการชั่งน้ำหนักวัตถุดิบอาหาร(?:จำพวก\s+.*)?$/.test(line.trim()) &&
            !/ไม่(?:ได้|รองรับ|เหมาะ)/.test(line),
        );
    if (kitchenUse) add("scale-kitchen", kitchenUse);
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
    const assembly = name + " " + description;
    const includesFloorPole =
      /พร้อม\s+Floor pole\s*$/i.test(name) &&
      !/ไม่มีเสา|poleless|(?:no|without)\s+(?:a\s+)?floor pole/i.test(assembly);
    if (
      includesFloorPole ||
      (!/ไม่มีเสา|poleless/i.test(identity) && /มีเสา|พร้อมเสา/.test(assembly))
    )
      add("scale-pole", assembly);
  }
  if (categoryId === "indicators") {
    const display = fact("ชนิดหน้าจอ") || name.match(/\b(?:LCD|LED)\b/i)?.[0] || "";
    if (/LCD/i.test(display) && !/LED/i.test(display)) add("indicator-lcd", display);
    if (/LED/i.test(display) && !/LCD/i.test(display)) add("indicator-led", display);
    const rating = fact("ระดับการป้องกัน IP").trim();
    const scope = fact("ส่วนที่กันน้ำ").trim();
    if (enclosureIp.test(rating) && enclosureScope.test(scope))
      add("indicator-waterproof", `${rating} ${scope}`);
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
    const wrongScope = /ไม่ใช่|ไม่ได้ใช้|เฉพาะ\s*(?:จาน|เสา|ชิ้นส่วน)|\bnot\b/i.test(material);
    if (matches.length === 1 && !wrongScope) {
      const [id] = matches[0];
      const requiredHighlight =
        id === "platform-carbon-steel" ? coatedFrame : id === "platform-abs" ? toughFrame : null;
      const feature = requiredHighlight
        ? highlights.split(/[\r\n;；]+/).find((line) => requiredHighlight.test(line.trim()))
        : undefined;
      if (!requiredHighlight || feature)
        add(id, [material, feature?.trim()].filter(Boolean).join(" · "));
    }
    if (matches.length > 1)
      reviewReasons.push("ข้อมูลวัสดุโครงระบุหลายชนิด ขอวัสดุของโครงแท่นที่ส่งมอบจริง");
  }
  if (categoryId === "pos") {
    const osWithVersion = fact("ระบบปฏิบัติการและเวอร์ชัน").trim();
    const osFamily = fact("ระบบปฏิบัติการ").trim();
    const os = osWithVersion || osFamily;
    const operatingSystems = [
      ["pos-android", /\bAndroid\b/i],
      ["pos-windows", /\bWindows\b/i],
      ["pos-ios", /\biOS\b/i],
    ] as const;
    const matches = operatingSystems.filter(([, pattern]) =>
      pattern.test(os || name + " " + description),
    );
    if (matches.length === 1) {
      const [id] = matches[0];
      if (id !== "pos-ios" || (iosVersion.test(os) && (!osFamily || iosVersion.test(osFamily))))
        add(id, os || name + " " + description);
    }
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
