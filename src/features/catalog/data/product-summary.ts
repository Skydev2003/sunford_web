import { load } from "cheerio";
import type { Product } from "../types";
import { productContentRows } from "./product-content";
import { productOverview } from "./product-presentation";

const clean = (text: string) =>
  text
    .replace(/\s+/g, " ")
    .replace(/^[>•\s]+/, "")
    .trim();
const known = (text: string) => Boolean(text) && !/^[-–—]+$|^(ไม่มี|ไม่ระบุ)$/i.test(text);

function lines(html: string) {
  const $ = load(html, undefined, false);
  $("script, style").remove();
  $("br").replaceWith("\n");
  $("p, li, div, h1, h2, h3, h4, tr").append("\n");
  return $.root().text().split(/\n+/).map(clean).filter(known);
}

/** A short, source-backed preview. Full source content remains in the detail groups. */
export function productSummary(
  product: Product,
  presentation: { descriptionHtml?: string; specifications: { label: string; value: string }[] },
  detailsHtml = "",
) {
  const overview = productOverview(product, presentation.specifications).specifications;
  const capacity = overview.find((row) => row.label === "น้ำหนัก")!.value;
  const readability = overview.find((row) => row.label === "ค่าละเอียด")!.value;
  // Never infer capacity variants or treat net shipping weight as weighing capacity.
  const weighing =
    known(capacity) && known(readability) && /\d/.test(capacity) && /\d/.test(readability)
      ? { capacity, readability }
      : null;
  const rows = [
    ...presentation.specifications,
    ...productContentRows(detailsHtml, true).map((row) => ({
      label: row.label,
      value: lines(row.html).join(" · "),
    })),
  ].filter((row) => known(clean(row.value)));
  const description = presentation.descriptionHtml
    ? lines(presentation.descriptionHtml)
    : product.description.split(/\n+/).map(clean).filter(known);
  const highlights: string[] = [];
  const add = (text: string) => {
    const value = clean(text);
    if (!known(value) || value.length > 160 || highlights.length >= 6) return;
    if (highlights.some((previous) => previous.includes(value) || value.includes(previous))) return;
    highlights.push(value);
  };
  const rowText = (row: { label: string; value: string }) =>
    row.label === "คุณสมบัติ" ? row.value : `${row.label} ${row.value}`;
  const concise = (text: string) => clean(text).length <= 160;

  // The product's existing short description replaces the long, mostly empty overview.
  add(product.subtitle);
  const display = rows.filter((row) => /^(หน้าจอแสดงผล|จอแสดงผล|หน้าจอ)$/.test(row.label));
  if (display.length)
    add(`จอแสดงผล ${[...new Set(display.map((row) => clean(row.value)))].join(" · ")}`);
  const topics = [
    /หน่วยความจำ|จดจำรายการสินค้า|บันทึกข้อมูลสินค้าได้สูงสุด/,
    /พิมพ์.*(บาร์โค้ด|ฉลาก|สติกเกอร์|สลิป)/,
    /การเชื่อมต่อ|ส่งข้อมูล|เชื่อมต่อ.*(RS232|USB|Wi-Fi|Bluetooth|SUNFORD CONNECT)/i,
    /มาตรฐานกันน้ำ|มาตรฐาน.*IP\d|กันน้ำ.*IP\d/i,
    /^วัสดุจานชั่ง|^วัสดุโครงสร้าง|^วัสดุตัวเครื่อง/,
    /หักน้ำหนักภาชนะ|นับชิ้นงาน|เตือนน้ำหนักขาด|ระบบปฏิบัติการ|หน้าจอ.*นิ้ว/,
    /เลือกใช้ถ่าน|ใช้ถ่านไฟฉาย|แบตเตอรี่|พลังงาน/,
    /^ขนาดจานชั่ง|^ขนาดตัวเครื่อง/,
    /ผ่านสมาร์ทโฟน|รองรับทั้ง iOS และ Android|เชื่อมต่อ.*แอพ/i,
    /รองรับน้ำหนักสูงสุด|วิเคราะห์สมดุลโครงสร้างร่างกาย/,
    /ป้องกัน 2 ชั้น|ตัวล็อก.*จมูก|สายคล้อง.*ปรับระดับ/,
  ];
  for (const topic of topics) {
    if (highlights.some((text) => topic.test(text))) continue;
    const fact =
      rows.map(rowText).find((text) => topic.test(text) && concise(text)) ??
      description.find((text) => topic.test(text) && concise(text));
    if (fact) add(fact);
  }
  if (!weighing && known(capacity) && /\d/.test(capacity)) add(`พิกัดน้ำหนัก ${capacity}`);
  // Sparse records stay sparse instead of padding the preview with unknown claims.
  return { highlights, weighing };
}
