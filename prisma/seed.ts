import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { importCatalog } from "./catalog-import";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir, tmpdir } from "node:os";

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes("YOUR-PASSWORD")) {
    throw new Error("Set a valid DIRECT_URL or DATABASE_URL before seeding.");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    const backupRoot =
      process.env.VERCEL === "1" ? tmpdir() : (process.env.LOCALAPPDATA ?? homedir());
    const backupDirectory = join(backupRoot, "Sunford", "backups");
    await mkdir(backupDirectory, { recursive: true });
    const backupPath = join(backupDirectory, `products-${Date.now()}.json`);
    await writeFile(backupPath, JSON.stringify(await prisma.product.findMany(), null, 2), {
      flag: "wx",
    });
    const result = await importCatalog(prisma);
    console.info(
      `Imported ${result.imported} missing products; ${result.total} active products. Existing rows preserved. Backup: ${backupPath}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}
main().catch(() => {
  console.error("Seeding failed. Check your database configuration and schema.");
  process.exitCode = 1;
});
