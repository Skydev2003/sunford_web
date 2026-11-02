type DetailRow = { label: string; html: string };
const groups = [
  { id: "usage", title: "คุณสมบัติและการใช้งาน" },
  { id: "weighing", title: "การชั่งและการแสดงผล" },
  { id: "connectivity", title: "การเชื่อมต่อและการพิมพ์" },
  { id: "power", title: "พลังงานและแบตเตอรี่" },
  { id: "construction", title: "วัสดุ ขนาด และน้ำหนัก" },
  { id: "assurance", title: "มาตรฐานและการรับประกัน" },
] as const;
type GroupId = (typeof groups)[number]["id"];

function groupForLabel(label: string): GroupId {
  if (/มาตรฐาน|ตรวจรับรอง|รับประกัน|หลังการขาย|บาร์โค้ดผลิตภัณฑ์/.test(label)) return "assurance";
  if (/พลังงาน|แบตเตอรี่|บตเตอรี่|ถ่าน|อะแด|ชาร์จ/.test(label)) return "power";
  if (/เชื่อมต่อ|ส่งข้อมูล|พอร์[ทต]|การพิมพ์|จดจำ|หน่วยความจำ|บันทึกราคา|DPI/i.test(label))
    return "connectivity";
  if (/วัสดุ|ขนาด|น้ำหนัก(?:สุทธิ|รวม|สินค้า|เครื่อง|จอ)|^น้ำหนัก$|บรรจุ/.test(label))
    return "construction";
  if (
    /พิกัด|ค่าละเอียด|ค่าอ่านละเอียด|ความละเอียด|ค่าน้ำหนัก|น้ำหนัก(?:ชั่งขั้นต่ำ|ต่ำสุด)|จอแสดงผล|หน้าจอ|แสดง(?:น้ำหนัก|ราคา|จำนวนเงิน|หน่วย|จำนวนนับ)|เตือนน้ำหนัก/.test(
      label,
    )
  )
    return "weighing";
  return "usage";
}

/** Reorder attributes by topic while keeping their source labels and HTML intact. */
export function groupProductDetails(rows: DetailRow[]) {
  return groups
    .map((group) => ({
      ...group,
      rows: rows.filter((row) => groupForLabel(row.label) === group.id),
    }))
    .filter((group) => group.rows.length > 0);
}
