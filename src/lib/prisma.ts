import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseGlobal = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClientConstructor?: typeof PrismaClient;
};
export function getPrisma() {
  // A regenerated client can add models while Fast Refresh retains globalThis.
  // Reuse a connection only while it belongs to the current generated client.
  if (databaseGlobal.prisma && databaseGlobal.prismaClientConstructor === PrismaClient)
    return databaseGlobal.prisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR-PASSWORD")) {
    throw new Error("Configure DATABASE_URL with a real Supabase password first.");
  }
  const adapter = new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5000 });
  const client = new PrismaClient({ adapter });
  const previous = databaseGlobal.prisma;
  databaseGlobal.prisma = client;
  databaseGlobal.prismaClientConstructor = PrismaClient;
  if (previous) {
    void previous.$disconnect().catch(() => {
      console.warn("Could not disconnect the previous Prisma client after regeneration.");
    });
  }
  return client;
}
