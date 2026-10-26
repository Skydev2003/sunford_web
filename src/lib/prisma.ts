import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseGlobal = globalThis as unknown as { prisma?: PrismaClient };
export function getPrisma() {
  if (databaseGlobal.prisma) return databaseGlobal.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR-PASSWORD")) {
    throw new Error("Configure DATABASE_URL with a real Supabase password first.");
  }
  const adapter = new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5000 });
  const client = new PrismaClient({ adapter });
  databaseGlobal.prisma = client;
  return client;
}
