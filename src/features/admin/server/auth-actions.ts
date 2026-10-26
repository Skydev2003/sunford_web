"use server";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema } from "../validation";
import type { ActionState } from "../types";

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const input = loginSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) return { error: "กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง" };
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword(input.data);
    if (error || !data.user)
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีไม่มีสิทธิ์แอดมิน" };
    const admin = await getPrisma().adminUser.findUnique({ where: { userId: data.user.id } });
    if (!admin) {
      await supabase.auth.signOut({ scope: "local" });
      return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือบัญชีไม่มีสิทธิ์แอดมิน" };
    }
  } catch {
    return { error: "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองอีกครั้ง" };
  }
  redirect("/admin/products");
}
export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/admin/login");
}
