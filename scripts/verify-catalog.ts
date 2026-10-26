import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getSnapshotProducts } from "../src/features/content/data/catalog-snapshot";
import { resolveManagedProduct } from "../src/features/catalog/data/managed-products";
import pg from "pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  const rows = await prisma.product.findMany();
  const snapshot = getSnapshotProducts();
  const backupPath = process.argv[2];
  if (backupPath) {
    const original = JSON.parse(await readFile(backupPath, "utf8")) as Array<
      Record<string, unknown>
    >;
    // Match the backup driver's timestamp parsing; Prisma treats timestamp-without-
    // timezone as UTC whereas pg uses the host timezone.
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000,
    });
    await client.connect();
    let stored: Array<Record<string, unknown>>;
    try {
      stored = (await client.query("SELECT * FROM products")).rows;
    } finally {
      await client.end();
    }
    for (const before of original) {
      const after = stored.find((row) => row.id === before.id);
      assert.ok(after, `Missing original product ${before.id}`);
      const serialized = JSON.parse(JSON.stringify(after)) as Record<string, unknown>;
      for (const [key, value] of Object.entries(before))
        assert.deepEqual(serialized[key], value, `Original field changed: ${before.id}.${key}`);
    }
    console.info(
      `All original fields and timestamps unchanged across ${original.length} existing records.`,
    );
  }
  for (const product of snapshot) {
    const row = rows.find((item) => item.id === product.id);
    assert.ok(row, `Missing imported product ${product.id}`);
    const effective = resolveManagedProduct(row);
    for (const key of Object.keys(product) as Array<keyof typeof product>) {
      assert.deepEqual(
        effective[key],
        product[key],
        `Initial public content changed: ${product.id}.${key}`,
      );
    }
  }
  console.info(
    `Verified ${snapshot.length} products retain every original public field, source ID, URL and price.`,
  );
}
main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Catalogue verification failed.");
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
