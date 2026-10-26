import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error("Usage: npm run admin:create -- admin@example.com");
  process.exit(1);
}
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!secret) {
  console.error("Set SUPABASE_SECRET_KEY in .env first. Never put it in browser code.");
  process.exit(1);
}
const pool = new pg.Pool({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
});
try {
  const existing = await pool.query("SELECT id FROM auth.users WHERE lower(email) = $1", [email]);
  let userId = existing.rows[0]?.id;
  if (!userId) {
    process.stdout.write("Password (hidden): ");
    const muted = new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    const reader = createInterface({
      input: process.stdin,
      output: muted,
      terminal: Boolean(process.stdin.isTTY),
    });
    const password = await reader.question("");
    reader.close();
    process.stdout.write("\n");
    if (password.length < 6) throw new Error("PASSWORD_TOO_SHORT");
    const supabase = createClient(process.env.SUPABASE_URL, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !data.user) {
      console.error(`Auth user creation failed (${error?.code || "unknown"}).`);
      process.exitCode = 1;
    } else userId = data.user.id;
  }
  if (userId) {
    await pool.query(
      "INSERT INTO public.admin_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING",
      [userId],
    );
    console.info(`Admin access is ready for ${email}. Existing account passwords are not changed.`);
  }
} catch (error) {
  console.error(
    `Admin setup failed (${error.code || (error.message === "PASSWORD_TOO_SHORT" ? error.message : error.name)}).`,
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
