import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getAdminSession = cache(async () => {
  const supabase = await createSupabaseServerClient();
  // A fresh Auth lookup also rejects revoked/deleted users, unlike trusting cookie data.
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const admin = await getPrisma().adminUser.findUnique({
    where: { userId: user.id },
    select: { userId: true },
  });
  return admin ? { user, supabase } : null;
});

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
