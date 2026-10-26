import "server-only";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminSession() {
  const supabase = await createSupabaseServerClient();
  // A fresh Auth lookup also rejects revoked/deleted users, unlike trusting cookie data.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const admin = await getPrisma().adminUser.findUnique({ where: { userId: user.id } });
  return admin ? { user, supabase } : null;
}
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
