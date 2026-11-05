import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getSnapshotProducts } from "../src/features/content/data/catalog-snapshot";

config({ path: ".env.local", quiet: true });
config({ quiet: true });

const sourceIds = ["10732", "10733", "10838", "10839", "10840", "10841", "10842", "10843", "10844"];
const output = "output/legacy-content-migration-20261105";
const checksum = (value: unknown) =>
  createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function main() {
  const connectionString = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  assert(
    connectionString && !connectionString.includes("YOUR-PASSWORD"),
    "Missing database configuration",
  );
  const url = new URL(connectionString);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  try {
    await mkdir(output, { recursive: true });
    const before = await prisma.product.findMany({ orderBy: { id: "asc" } });
    const candidates = getSnapshotProducts().filter((row) =>
      sourceIds.includes(row.sourceId ?? ""),
    );
    assert.equal(
      candidates.length,
      9,
      "Merge reviewed product snapshots before importing the database",
    );
    const missing = candidates.filter((row) => !before.some((old) => old.id === row.id));
    for (const row of candidates) {
      assert(
        !before.some((old) => old.id !== row.id && old.slug === row.slug),
        "Existing slug belongs to another product",
      );
    }
    const preflight = {
      checkedAt: new Date().toISOString(),
      target: { hostname: url.hostname, database: url.pathname.slice(1) },
      totalBefore: before.length,
      publishedBefore: before.filter((row) => row.published && !row.deletedAt).length,
      insertIds: missing.map((row) => row.id),
      preservedExistingIds: candidates.filter((row) => !missing.includes(row)).map((row) => row.id),
      existingRowsChecksum: checksum(before),
    };
    await writeFile(`${output}/database-preflight.json`, JSON.stringify(preflight, null, 2));
    if (!process.argv.includes("--apply")) {
      console.log(JSON.stringify(preflight, null, 2));
      return;
    }
    const timestamp = Date.now();
    const backupPath = `${output}/database-before-${timestamp}.json`;
    await writeFile(backupPath, JSON.stringify(before, null, 2), { flag: "wx" });
    const result = await prisma.$transaction(
      async (tx) => {
        const current = await tx.product.findMany({ orderBy: { id: "asc" } });
        assert.deepEqual(
          current,
          before,
          "Product records changed after preflight; rerun without overwriting concurrent work",
        );
        if (missing.length) {
          await tx.product.createMany({
            data: missing.map((row) => ({
              id: row.id,
              slug: row.slug,
              name: row.name,
              category: "accessories" as const,
              subtitle: row.subtitle,
              description: row.description,
              image: row.image,
              capacity: row.capacity,
              readability: row.readability,
              connection: row.connection,
              badge: row.badge,
              featured: false,
              published: true,
              catalogManaged: true,
              sortOrder: row.sortOrder,
            })),
          });
        }
        const after = await tx.product.findMany({ orderBy: { id: "asc" } });
        assert.deepEqual(
          after.filter((row) => before.some((old) => old.id === row.id)),
          before,
          "Existing rows changed",
        );
        assert.equal(after.length, before.length + missing.length);
        return {
          totalAfter: after.length,
          publishedAfter: after.filter((row) => row.published && !row.deletedAt).length,
          insertedIds: missing.map((row) => row.id),
          existingRowsChecksum: checksum(before),
        };
      },
      { isolationLevel: "Serializable", timeout: 20000 },
    );
    const receipt = {
      ...preflight,
      ...result,
      checkedAt: new Date().toISOString(),
      backupPath,
      existingRowsUnchanged: true,
    };
    await writeFile(
      `${output}/database-receipt-${timestamp}.json`,
      JSON.stringify(receipt, null, 2),
    );
    console.log(
      JSON.stringify({
        insertedIds: result.insertedIds,
        totalAfter: result.totalAfter,
        publishedAfter: result.publishedAfter,
        existingRowsUnchanged: true,
      }),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof assert.AssertionError
      ? error.message
      : "Legacy product import failed; inspect database configuration and preflight. No existing records were updated.",
  );
  process.exitCode = 1;
});
