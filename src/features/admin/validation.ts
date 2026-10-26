import { z } from "zod";
import { categories } from "../catalog/types";
const text = (label: string, max = 200) =>
  z.string().trim().min(1, `กรุณากรอก${label}`).max(max, `${label}ยาวเกิน ${max} ตัวอักษร`);
export const productInputSchema = z.object({
  name: text("ชื่อสินค้า", 100),
  slug: text("URL สินค้า", 120).regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "ใช้ a-z, 0-9 และขีดกลาง เช่น wps10ks",
  ),
  category: z.enum(categories.filter((category) => category.id !== "all").map(({ id }) => id)),
  subtitle: text("คำโปรย", 200),
  description: text("รายละเอียด", 5000),
  image: text("รูปสินค้า", 2048),
  capacity: text("พิกัดน้ำหนัก"),
  readability: text("ความละเอียด"),
  connection: text("การเชื่อมต่อ"),
  badge: z
    .string()
    .trim()
    .max(50)
    .transform((value) => value || null),
  sortOrder: z.coerce.number().int().min(0).max(99999),
  published: z.boolean(),
  featured: z.boolean(),
});
export const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(256),
});
export const versionSchema = z.object({
  id: z.string().min(1).max(100),
  updatedAt: z.iso.datetime(),
});
