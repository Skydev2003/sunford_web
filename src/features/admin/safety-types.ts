export type TrashItem = {
  id: string;
  kind: "product" | "page" | "category";
  title: string;
  deletedAt: string;
  updatedAt: string;
  category?: string;
};
export const safetyLabels: Record<string, string> = {
  product: "สินค้า",
  page: "หน้าข้อมูล / บทความ",
  category: "หมวดหมู่",
  settings: "ตั้งค่าเว็บไซต์",
  "product-media": "เนื้อหาสินค้า",
  "home-image": "รูปหน้าแรก",
  create: "เพิ่มข้อมูล",
  update: "แก้ไขข้อมูล",
  delete: "ย้ายไปถังขยะ",
  restore: "กู้คืนข้อมูล",
  hide: "ซ่อนสินค้า",
  publish: "เผยแพร่สินค้า",
  reorder: "เรียงลำดับ",
  move: "ย้ายหมวดหมู่",
  reset: "ใช้ค่าเดิม",
  name: "ชื่อสินค้า",
  slug: "URL สินค้า",
  categoryId: "หมวดหมู่",
  subtitle: "คำโปรย",
  description: "รายละเอียด",
  image: "รูปหลัก",
  gallery: "แกลเลอรี",
  capacity: "พิกัดน้ำหนัก",
  readability: "ความละเอียด",
  connection: "การเชื่อมต่อ",
  badge: "ป้ายสินค้า",
  featured: "สินค้าแนะนำ",
  published: "สถานะเผยแพร่",
  sortOrder: "ลำดับ",
  title: "หัวข้อ",
  html: "เนื้อหา",
  path: "URL หน้า",
  label: "ชื่อหมวดหมู่",
  english: "ชื่อภาษาอังกฤษ",
  deletedAt: "สถานะในถังขยะ",
  targetProductId: "สินค้าปลายทาง",
  targetPagePath: "หน้าปลายทาง",
};
