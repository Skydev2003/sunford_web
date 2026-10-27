import { connection } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET() {
  await connection();
  const headers = { "Cache-Control": "no-store" };
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return Response.json(
      {
        status: "ok",
        service: "sunford-web",
        environment:
          process.env.APP_ENV ??
          (process.env.VERCEL_ENV === "preview" ? "uat" : process.env.VERCEL_ENV) ??
          "development",
        revision: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ?? null,
      },
      { headers },
    );
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers });
  }
}
