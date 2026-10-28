import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID, createHash } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import dotenv from "dotenv";
import { build } from "esbuild";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { productTableSchema } from "../../src/features/admin/product-table-schema";
import { resolveManagedProduct } from "../../src/features/catalog/data/managed-products";
import type { ActionState } from "../../src/features/admin/types";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });
const version = { id: "example", updatedAt: "2026-10-27T00:00:00.000Z" };
test("table commands reject duplicates, invalid versions and arbitrary field changes", () => {
  for (const input of [
    { type: "delete", items: [] },
    { type: "hide", items: [version, version] },
    { type: "update", items: [version], changes: {} },
    { type: "update", items: [version], changes: { name: "Unrequested overwrite" } },
    { type: "update", items: [version], changes: { sortOrder: -1 } },
    { type: "update", items: [{ ...version, updatedAt: "invalid" }], changes: { published: true } },
    { type: "update", items: [version, { ...version, id: "other" }], changes: { featured: true } },
  ])
    assert.equal(productTableSchema.safeParse(input).success, false);
  assert.equal(
    productTableSchema.safeParse({ type: "category", items: [version], categoryId: "food" })
      .success,
    true,
  );
});

test(
  "real transaction: quick edits, atomic bulk actions, categories, ranks and legacy preservation",
  {
    skip: !process.env.DATABASE_URL,
    timeout: 90000,
  },
  async () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });
    const file = resolve("node_modules/.cache", `table-actions-${randomUUID()}.mjs`);
    await mkdir(resolve("node_modules/.cache"), { recursive: true });
    await build({
      stdin: {
        contents:
          'export {manageProductsAction} from "./src/features/admin/server/product-table-actions";',
        resolveDir: process.cwd(),
        loader: "ts",
      },
      outfile: file,
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      plugins: [
        {
          name: "transaction-boundary",
          setup(builder) {
            builder.onResolve(
              { filter: /^(server-only|next\/cache|@\/lib\/prisma|\.\/auth)$/ },
              ({ path }) => ({ path, namespace: "context" }),
            );
            builder.onLoad({ filter: /.*/, namespace: "context" }, ({ path }) => ({
              loader: "js",
              contents:
                path === "server-only"
                  ? "export {};"
                  : path === "@/lib/prisma"
                    ? "export const getPrisma=()=>globalThis.__tableTest.db;"
                    : path === "./auth"
                      ? "export const getAdminSession=async()=>globalThis.__tableTest.authenticated?{user:{id:'table-test',email:'table@example.test'}}:null;"
                      : "export const revalidatePath=p=>globalThis.__tableTest.invalidated.push(p);export const updateTag=t=>globalThis.__tableTest.invalidated.push(t);",
            }));
          },
        },
      ],
    });
    const digest = (value: unknown) =>
      createHash("sha256").update(JSON.stringify(value)).digest("hex");
    const before = await prisma.product.findMany({ orderBy: { id: "asc" } });
    const documents = await prisma.cmsDocument.findMany({ orderBy: { id: "asc" } });
    const rollback = new Error("ROLLBACK_TABLE_TEST");
    const globals = globalThis as typeof globalThis & {
      __tableTest?: { db: unknown; authenticated: boolean; invalidated: string[] };
    };
    try {
      const { manageProductsAction: run } = (await import(pathToFileURL(file).href)) as {
        manageProductsAction: (input: unknown) => Promise<ActionState>;
      };
      await assert.rejects(
        prisma.$transaction(
          async (tx) => {
            const context = {
              authenticated: true,
              invalidated: [] as string[],
              db: new Proxy(tx, {
                get(target, key) {
                  return key === "$transaction"
                    ? (callback: (db: typeof tx) => unknown) => callback(tx)
                    : Reflect.get(target, key);
                },
              }),
            };
            globals.__tableTest = context;
            const base = {
              category: "food" as const,
              subtitle: "Transaction fixture",
              description: "Not committed",
              image: "",
              capacity: "10 kg",
              readability: "1 g",
              connection: "USB",
              published: false,
              featured: false,
              sortOrder: 90000,
              catalogManaged: true,
            };
            const a = await tx.product.create({
              data: {
                ...base,
                id: randomUUID(),
                slug: `bulk-qa-${randomUUID()}`,
                name: "Bulk fixture A",
              },
            });
            const b = await tx.product.create({
              data: {
                ...base,
                id: randomUUID(),
                slug: `bulk-qa-${randomUUID()}`,
                name: "Bulk fixture B",
              },
            });
            const items = async () =>
              (
                await tx.product.findMany({
                  where: { id: { in: [a.id, b.id] } },
                  orderBy: { name: "asc" },
                })
              ).map(({ id, updatedAt }) => ({ id, updatedAt: updatedAt.toISOString() }));
            context.authenticated = false;
            assert.ok((await run({ type: "hide", items: await items() })).error);
            context.authenticated = true;
            assert.equal(
              (
                await run({
                  type: "update",
                  items: [{ id: a.id, updatedAt: a.updatedAt.toISOString() }],
                  changes: { published: true, featured: true, sortOrder: 33 },
                })
              ).success,
              true,
            );
            let current = await tx.product.findUniqueOrThrow({ where: { id: a.id } });
            assert.equal(current.published, true);
            assert.equal(current.featured, true);
            assert.equal(current.sortOrder, 33);
            assert.equal((await run({ type: "hide", items: await items() })).success, true);
            assert.equal(
              await tx.product.count({ where: { id: { in: [a.id, b.id] }, published: true } }),
              0,
            );
            assert.equal((await run({ type: "publish", items: await items() })).success, true);
            const fresh = await items();
            assert.ok(
              (
                await run({
                  type: "hide",
                  items: [{ id: a.id, updatedAt: a.updatedAt.toISOString() }, fresh[1]],
                })
              ).error,
            );
            assert.equal(
              await tx.product.count({ where: { id: { in: [a.id, b.id] }, published: true } }),
              2,
            );
            const categoryId = `bulk-${randomUUID()}`;
            await tx.cmsDocument.create({
              data: {
                id: `category:${categoryId}`,
                kind: "category",
                data: { label: "Transaction category", english: "Transaction category" },
              },
            });
            assert.equal(
              (await run({ type: "category", items: await items(), categoryId })).success,
              true,
            );
            current = await tx.product.findUniqueOrThrow({ where: { id: a.id } });
            assert.equal(current.categoryId, categoryId);
            assert.equal(
              (await run({ type: "category", items: await items(), categoryId: "food" })).success,
              true,
            );
            await tx.cmsDocument.update({
              where: { id: `category:${categoryId}` },
              data: { deletedAt: new Date() },
            });
            assert.ok((await run({ type: "category", items: await items(), categoryId })).error);
            assert.equal(
              (await tx.product.findUniqueOrThrow({ where: { id: a.id } })).categoryId,
              null,
            );
            const legacy = before.find((row) => !row.catalogManaged && !row.deletedAt);
            if (legacy) {
              const expected = resolveManagedProduct(legacy);
              assert.equal(
                (
                  await run({
                    type: "update",
                    items: [{ id: legacy.id, updatedAt: legacy.updatedAt.toISOString() }],
                    changes: { featured: !expected.featured },
                  })
                ).success,
                true,
              );
              const after = resolveManagedProduct(
                await tx.product.findUniqueOrThrow({ where: { id: legacy.id } }),
              );
              for (const key of [
                "slug",
                "name",
                "category",
                "subtitle",
                "description",
                "image",
                "capacity",
                "readability",
                "connection",
                "badge",
                "sortOrder",
                "published",
              ] as const)
                assert.deepEqual(after[key], expected[key], `Legacy ${key} preserved`);
              assert.equal(after.featured, !expected.featured);
            }
            const active = (await tx.product.findMany({ where: { deletedAt: null } })).sort(
              (left, right) =>
                resolveManagedProduct(left).sortOrder - resolveManagedProduct(right).sortOrder ||
                left.name.localeCompare(right.name),
            );
            const ai = active.findIndex((row) => row.id === a.id);
            const bi = active.findIndex((row) => row.id === b.id);
            [active[ai], active[bi]] = [active[bi], active[ai]];
            const order = active.map(({ id, updatedAt }) => ({
              id,
              updatedAt: updatedAt.toISOString(),
            }));
            assert.equal((await run({ type: "reorder", items: order })).success, true);
            assert.equal(
              (await tx.product.findUniqueOrThrow({ where: { id: a.id } })).sortOrder,
              bi,
            );
            assert.equal(
              (await tx.product.findUniqueOrThrow({ where: { id: b.id } })).sortOrder,
              ai,
            );
            assert.ok((await run({ type: "reorder", items: order.slice(1) })).error);
            assert.equal((await run({ type: "delete", items: await items() })).success, true);
            const deleted = await tx.product.findMany({ where: { id: { in: [a.id, b.id] } } });
            assert.ok(deleted.every((row) => row.deletedAt && !row.published));
            assert.ok(context.invalidated.includes("/admin/categories"));
            throw rollback;
          },
          { timeout: 60000, isolationLevel: "Serializable" },
        ),
        (error) => error === rollback,
      );
      assert.equal(
        digest(await prisma.product.findMany({ orderBy: { id: "asc" } })),
        digest(before),
      );
      assert.equal(
        digest(await prisma.cmsDocument.findMany({ orderBy: { id: "asc" } })),
        digest(documents),
      );
    } finally {
      delete globals.__tableTest;
      await prisma.$disconnect();
      await unlink(file);
    }
  },
);
