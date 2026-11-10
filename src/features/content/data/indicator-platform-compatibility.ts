export const weighingGroups = [
  {
    title: "งานผลิตและคลังสินค้า",
    purpose: "ชั่งวัตถุดิบ นับชิ้น และตรวจน้ำหนัก",
    capacity: "30–600 กก.",
    heads: "Indicator-AW31 / Indicator-AC31P",
    display: "LCD",
    functions:
      "มองเห็นได้ไกล 4 เมตร ใช้งานสูงสุด 300 ชั่วโมง หักน้ำหนักภาชนะและตั้งเตือนน้ำหนักได้",
    connection: "RS232 สองช่อง สำหรับคอมพิวเตอร์ จอเสริม LED-R5 หรือเครื่องพิมพ์ LP50",
    platforms: [
      ["ตั้งโต๊ะ · 30–60 กก.", "TMS-30-AC31S, TMS-60-AW31"],
      [
        "ตั้งพื้น · 60–150 กก. · จาน 40 × 50 ซม.",
        "FCS-60-AW31, FCS-150-AW31, TCS-150-AW31, TIS-150-AW31",
      ],
      ["ตั้งพื้น · 300–600 กก. · จาน 50 × 60 หรือ 60 × 80 ซม.", "TCS-300-AW31, TCS-600-AW31"],
    ],
  },
  {
    title: "โรงงานและสายการผลิต",
    purpose: "อ่านน้ำหนักจากจุดควบคุมหรือในพื้นที่แสงน้อย",
    capacity: "60–300 กก.",
    heads: "Indicator-SW31 / Indicator-SW31F",
    display: "LED / LCD",
    functions:
      "SW31 ใช้จอ LED สีแดง มองเห็นไกลสูงสุด 8 เมตร ส่วน SW31F ใช้จอ LCD แบตเตอรี่ใช้งานได้ 200–300 ชั่วโมงตามรุ่น",
    connection: "RS232 หนึ่งช่อง สำหรับส่งน้ำหนักเข้าโปรแกรมบันทึกข้อมูล",
    platforms: [
      ["สแตนเลส SUS304", "TSS-60-SW31S, TSS-150-SW31S, TSS-300-SW31S"],
      ["เหล็กคาร์บอนพ่นสีกันสนิม", "FCS-150-SW31, FCS-300-SW31"],
      ["ตั้งพื้นพร้อมหัวอ่าน SW31F", "TIS-150-SW31F, TCS-150-SW31F, TIS-300-SW31F"],
      ["จอแยกสำหรับติดผนังหรือวางโต๊ะ", "VCS-300-SW31S"],
    ],
  },
  {
    title: "พื้นที่เปียกชื้น",
    purpose: "ชั่งอาหารสดในตลาด แพปลา หรือโรงงานแปรรูป",
    capacity: "30–300 กก.",
    heads: "Indicator-WP31C / Indicator-WP31E / Indicator-WP31EUSB",
    display: "IP67",
    functions:
      "หัวอ่านซีลกันน้ำและฝุ่นระดับ IP67 พร้อมปุ่มยาง รุ่น WP31C ใช้จอ LCD ส่วน WP31E และ WP31EUSB ใช้จอ LED",
    connection: "พอร์ตกันน้ำ รุ่น WP31EUSB มี USB กันน้ำ",
    platforms: [
      [
        "สแตนเลส SUS304 · 30, 60, 150 และ 300 กก.",
        "TSS-30-WP31E, TSS-60-WP31E, TSS-150-WP31E, TSS-300-WP31E",
      ],
      ["โครงสร้างสแตนเลส", "CSS-150"],
    ],
  },
  {
    title: "ค้าส่งและค้าปลีก",
    purpose: "ชั่ง คิดราคา และคำนวณเงินทอนที่หน้าร้าน",
    capacity: "60–300 กก.",
    heads: "JC62Z / JE62ZR",
    display: "จอ 3 บรรทัด",
    functions:
      "JC62Z ใช้จอ LCD ส่วน JE62ZR ใช้จอ LED แสดงน้ำหนัก ราคาต่อกิโลกรัม และยอดรวม พร้อมบันทึกราคาสินค้า (PLU)",
    connection: "รวมยอดสะสมและคำนวณเงินทอนได้ที่หัวอ่าน",
    platforms: [
      ["เสาพับได้ · 60 กก.", "TCS-60-JC62Z, TCS-60-JE62ZR"],
      ["เหล็กเสาตรง · 150 กก.", "TCS-150-JC62Z, TCS-150-JE62ZR"],
      [
        "สแตนเลส SUS201 · 150 และ 300 กก.",
        "TIS-150-JC62Z, TIS-150-JE62ZR, TIS-300-JC62Z, TIS-300-JE62ZR",
      ],
      ["สแตนเลส SUS304 · 150 กก.", "CCS-150-JC62Z, DCS-150-JC62Z"],
    ],
  },
] as const;

export const weighingAccessories = [
  ["LoadcellCable", "สายโหลดเซลล์ ส่งสัญญาณน้ำหนักจากแท่นเข้าหัวอ่าน"],
  ["CableConnector", "หัวต่อเกลียวล็อก 1 คู่ สำหรับยึดสายโหลดเซลล์กับหัวอ่าน"],
  ["RS2321M2F", "สาย RS232 สำหรับต่อคอมพิวเตอร์ เครื่องพิมพ์ หรือจอเสริม"],
  ["LED-R1 / LED-R3 / LED-R5", "จอแสดงน้ำหนักระยะไกล ต่อผ่าน RS232 ของ AW31 หรือ AC31P"],
  ["NY30M12 / PU20M12", "ชุดล้อ 4 ล้อ สำหรับเคลื่อนย้ายแท่นชั่ง"],
] as const;
// Only named head/kit pairs. Group membership alone is not evidence of a pairing.
export const headPlatformPairs: Readonly<Record<string, readonly string[]>> = {
  "Indicator-AW31": [
    "TMS-60-AW31",
    "FCS-60-AW31",
    "FCS-150-AW31",
    "TCS-150-AW31",
    "TIS-150-AW31",
    "TCS-300-AW31",
    "TCS-600-AW31",
  ],
  "Indicator-AC31P": [],
  "Indicator-SW31": ["FCS-150-SW31", "FCS-300-SW31"],
  "Indicator-SW31F": ["TIS-150-SW31F", "TCS-150-SW31F", "TIS-300-SW31F"],
  "Indicator-WP31C": [],
  "Indicator-WP31E": ["TSS-30-WP31E", "TSS-60-WP31E", "TSS-150-WP31E", "TSS-300-WP31E"],
  "Indicator-WP31EUSB": [],
  JC62Z: [
    "TCS-60-JC62Z",
    "TCS-150-JC62Z",
    "TIS-150-JC62Z",
    "TIS-300-JC62Z",
    "CCS-150-JC62Z",
    "DCS-150-JC62Z",
  ],
  JE62ZR: ["TCS-60-JE62ZR", "TCS-150-JE62ZR", "TIS-150-JE62ZR", "TIS-300-JE62ZR"],
};
