import type { Field } from "../types";
import { imageGuidelines } from "@/features/admin/image-guidelines";

export function editorPlacement(id: string, kind: string) {
  if (kind === "page")
    return "หน้าข้อมูล / บทความ → หัวข้อ → รูปปกแรก → เนื้อหา → สินค้าที่เชื่อมโยง (ตามประเภทหน้า) → วิดีโอ";
  if (kind === "category") return "เมนูหมวดหมู่และตัวกรองรายการสินค้า → ชื่อภาษาไทย / ภาษาอังกฤษ";
  if (kind === "product-media")
    return "หน้ารายละเอียดสินค้า → แกลเลอรีและราคา → รายละเอียดสินค้าและคุณสมบัติ → วิดีโอ";
  if (id === "hero")
    return "หน้าแรกส่วนบน → แถบประกาศ → ชื่อสินค้า → คำโฆษณาและคำโปรย → ปุ่ม → รูปสไลด์";
  if (id === "site") return "ทุกหน้า → โลโก้บนแถบนำทาง และช่องทางติดต่อ";
  if (id === "navigation") return "ทุกหน้า → เมนูหลัก → เมนูย่อย / คอลัมน์รอง ตามลำดับรายการ";
  if (id === "section:footer") return "ทุกหน้า → ส่วนท้ายเว็บไซต์ ตามลำดับข้อความและลิงก์";
  return "หน้าแรก → ส่วนนี้ตามลำดับบล็อกในหน้าจัดการหน้าแรก → ข้อความ รูปภาพ และปุ่มด้านล่าง";
}

export function guidedFields(id: string, kind: string, fields: Field[], parent = ""): Field[] {
  return fields.map((field) => {
    const text = !field.type || ["text", "textarea"].includes(field.type);
    const link = /href|path|url|email|phone|line|messenger/i.test(field.key);
    const maxLength = kind === "category" ? 150 : /path$/i.test(field.key) ? 1000 : 5000;
    const recommendedLength = link
      ? undefined
      : /title|name|label|tagline|accent|eyebrow/i.test(field.key)
        ? 60
        : /description/i.test(field.key)
          ? 160
          : undefined;
    return {
      ...field,
      ...(text ? { maxLength, recommendedLength } : {}),
      ...(field.type === "image"
        ? {
            imageSize:
              field.key === "logo"
                ? imageGuidelines.logo
                : id === "hero"
                  ? imageGuidelines.hero
                  : /รูปปก/.test(parent)
                    ? imageGuidelines.page
                    : /วิดีโอ/.test(parent)
                      ? imageGuidelines.cover
                      : imageGuidelines.product,
          }
        : {}),
      ...(field.type === "html"
        ? {
            maxLength:
              kind === "page" ? 1000000 : field.key === "descriptionHtml" ? 300000 : 500000,
          }
        : {}),
      hint: [
        field.hint,
        field.key === "title" && kind === "page"
          ? "แสดงเป็นหัวข้อหน้าและชื่อ SEO (ระบบเติมชื่อแบรนด์ให้)"
          : field.type === "html"
            ? "แสดงในส่วนเนื้อหาเว็บไซต์ตามรูปแบบที่แก้ไข ลิงก์และ HTML จะผ่านการตรวจเมื่อบันทึก"
            : text && !link
              ? `แสดงที่: ${parent ? `${parent} → ` : ""}${field.label}`
              : undefined,
      ]
        .filter(Boolean)
        .join(" · "),
      ...(field.fields ? { fields: guidedFields(id, kind, field.fields, field.label) } : {}),
    };
  });
}
