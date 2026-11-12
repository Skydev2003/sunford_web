import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const databaseGlobal = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaClientConstructor?: typeof PrismaClient;
  prismaConnectionString?: string;
};
export function getPrisma() {
  const connectionString = process.env.QUOTATION_DATABASE_URL?.trim();
  if (!connectionString || connectionString.includes("YOUR-PASSWORD")) {
    throw new Error("Configure QUOTATION_DATABASE_URL for the Warehouse website registry.");
  }
  // A regenerated client can add models while Fast Refresh retains globalThis.
  // Reuse a connection only while it belongs to the current generated client.
  if (
    databaseGlobal.prisma &&
    databaseGlobal.prismaClientConstructor === PrismaClient &&
    databaseGlobal.prismaConnectionString === connectionString
  )
    return databaseGlobal.prisma;
  const adapter = new PrismaPg(
    { connectionString, max: 5, connectionTimeoutMillis: 5000 },
    { schema: "ecommerce" },
  );
  const client = new PrismaClient({ adapter });
  const previous = databaseGlobal.prisma;
  databaseGlobal.prisma = client;
  databaseGlobal.prismaClientConstructor = PrismaClient;
  databaseGlobal.prismaConnectionString = connectionString;
  if (previous) {
    void previous.$disconnect().catch(() => {
      console.warn("Could not disconnect the previous Prisma client after regeneration.");
    });
  }
  return client;
}
