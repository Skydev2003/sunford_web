import "server-only";
import { createClient } from "@supabase/supabase-js";

// Optional integration for Storage. Product reads use Prisma.
export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Configure SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY first.");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
