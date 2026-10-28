import type { SourcePage } from "@/features/content/types";

const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];
const shortMonths = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

// Editorial summaries of the existing source articles. Titles, dates, images
// and destinations continue to come from the published content records.
const introductions: Record<string, { category: string; description: string }> = {
  "/blogs/editorial": {
    category: "เคล็ดลับธุรกิจ",
    description: "รวมความรู้ เทคนิค และเรื่องราวการใช้งานเครื่องชั่งจาก Sunford เพื่อคนทำธุรกิจ",
  },
  "/blogs/editorial/เครื่องชั่งในบ้าน_จำเป็นแค่ไหน": {
    category: "แนะนำสินค้า",
    description: "รู้จักเครื่องชั่งในบ้าน กับบทบาทในการติดตามน้ำหนักและการดูแลตัวเอง",
  },
  "/blogs/editorial/จอ_LCD_และจอ_LED_แบบไหน_จะดีกว่ากัน": {
    category: "คู่มือการเลือกซื้อ",
    description: "เปรียบเทียบจอ LCD และ LED ทั้งการแสดงผลและการใช้งาน เพื่อเลือกให้เหมาะกับคุณ",
  },
  "/blogs/editorial/เลขน้ำหนักมาได้ไง_ทั้งที่ไม่ได้ชั่ง": {
    category: "ความรู้ผลิตภัณฑ์",
    description:
      "ทำความเข้าใจอาการลมกวนที่ทำให้ตัวเลขน้ำหนักเปลี่ยน และแนวทางลดผลกระทบต่อเครื่องชั่ง",
  },
};

function publishedDate(text: string) {
  const match = text.trim().match(/^(\d{1,2})\s+(\S+)\s+(\d{4})/);
  if (!match) return undefined;
  const month = months.indexOf(match[2]);
  const year = Number(match[3]);
  if (month < 0 || year < 2400) return undefined;
  return {
    label: `${Number(match[1])} ${shortMonths[month]} ${year}`,
    iso: `${year - 543}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`,
    source: match[0],
  };
}

export function storyCardContent(page: SourcePage) {
  const date = publishedDate(page.text);
  const introduction = !page.managed ? introductions[page.path] : undefined;
  const body = page.text
    .trim()
    .replace(date?.source ?? /^$/, "")
    .replace(page.title, "")
    .split(/\n+/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .find((paragraph) => paragraph.length > 40 && !paragraph.startsWith("นอกจากข่าวและกิจกรรม"));
  return {
    category: introduction?.category ?? "ความรู้จาก Sunford",
    description:
      introduction?.description ??
      (body ? `${body.slice(0, 130)}${body.length > 130 ? "…" : ""}` : page.title),
    date,
  };
}
