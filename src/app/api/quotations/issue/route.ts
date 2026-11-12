import { join } from "node:path";
import { hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import { issuePostgres } from "@/features/catalog/server/quotation-issues";

export async function POST(request: Request) {
  const key = request.headers.get("Idempotency-Key");
  if (!key || !/^[0-9a-f]{32}$/.test(key))
    return Response.json({ error: "คำขอออกเลขเอกสารไม่ถูกต้อง" }, { status: 400 });
  try {
    let issue;
    if (hasDatabase()) {
      issue = await issuePostgres(getPrisma(), key);
    } else if (process.env.NODE_ENV === "development" && !process.env.VERCEL) {
      const { issueLocal } = await import("@/features/catalog/server/quotation-issues-local.mjs");
      issue = issueLocal(join(process.cwd(), ".local", "quotation-issues.sqlite"), key);
    } else {
      throw new Error("Quotation registry unavailable");
    }
    return Response.json(issue, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "ออกเลขเอกสารไม่ได้ในขณะนี้ กรุณาลองอีกครั้ง" }, { status: 503 });
  }
}
