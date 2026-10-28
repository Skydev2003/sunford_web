"use server";

import { getAdminSession } from "./auth";
import { getAdminProduct } from "./products";
import { getEditor } from "@/features/cms/server/editors";
import type { AdminDetailModel } from "../detail-types";

export async function loadAdminDetail(
  kind: "product" | "content",
  id: string,
): Promise<AdminDetailModel | { error: string }> {
  const session = await getAdminSession();
  if (!session) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง" };
  if (typeof id !== "string" || !id || id.length > 200) return { error: "ข้อมูลรายการไม่ถูกต้อง" };
  try {
    if (kind === "product") {
      if (id === "new") return { kind, product: undefined };
      const product = await getAdminProduct(id, session);
      return product ? { kind, product } : { error: "ไม่พบสินค้านี้ อาจถูกลบไปแล้ว" };
    }
    if (kind === "content") {
      const editor = await getEditor(id, session);
      return editor ? { kind, editor } : { error: "ไม่พบส่วนที่ต้องการแก้ไข" };
    }
    return { error: "ประเภทข้อมูลไม่ถูกต้อง" };
  } catch {
    return { error: "โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง" };
  }
}
