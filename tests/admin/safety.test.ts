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
import importedPages from "../../src/features/content/data/pages.json";
import type { ActionState } from "../../src/features/admin/types";
import type { TrashItem } from "../../src/features/admin/safety-types";

dotenv.config({ path: ".env.local", quiet: true });
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
type Actions = {
  saveProductAction: (state: ActionState, form: FormData) => Promise<ActionState>;
  deleteProductAction: (form: FormData) => Promise<ActionState>;
  manageProductsAction: (input: unknown) => Promise<ActionState>;
  saveDocumentAction: (state: ActionState, form: FormData) => Promise<ActionState>;
  deleteDocumentAction: (state: ActionState, form: FormData) => Promise<ActionState>;
  saveHomeImageAction: (state: ActionState, form: FormData) => Promise<ActionState>;
  restoreItemAction: (input: unknown) => Promise<ActionState>;
  listTrash: () => Promise<TrashItem[]>;
  listAudit: (
    page: number,
    type?: string,
    id?: string,
  ) => Promise<{
    count: number;
    current: number;
    rows: { actorId: string; actorEmail: string; action: string }[];
  }>;
  sourcePageId: (path: string) => string;
};
function form(values: Record<string, unknown>) {
  const data = new FormData();
  Object.entries(values).forEach(([key, value]) => data.set(key, String(value)));
  return data;
}

test(
  "safety actions: atomic audit, soft delete, recovery, stale versions and authorization",
  { skip: !process.env.DATABASE_URL, timeout: 120000 },
  async () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
    });
    const file = resolve("node_modules/.cache", `safety-${randomUUID()}.mjs`);
    await mkdir(resolve("node_modules/.cache"), { recursive: true });
    await build({
      stdin: {
        contents:
          'export * from "./src/features/admin/server/product-actions";export * from "./src/features/admin/server/product-table-actions";export * from "./src/features/admin/server/restore-actions";export * from "./src/features/admin/server/safety";export * from "./src/features/admin/server/home-image-actions";export * from "./src/features/cms/server/actions";export * from "./src/features/cms/server/identity";',
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
          name: "safety-context",
          setup(builder) {
            builder.onResolve(
              {
                filter:
                  /^(server-only|next\/cache|next\/navigation|@\/lib\/prisma|\.\/auth|@\/features\/admin\/server\/auth)$/,
              },
              ({ path }) => ({ path, namespace: "context" }),
            );
            builder.onLoad({ filter: /.*/, namespace: "context" }, ({ path }) => ({
              loader: "js",
              contents:
                path === "server-only"
                  ? "export {};"
                  : path === "@/lib/prisma"
                    ? "export const getPrisma=()=>globalThis.__safetyTest.db;"
                    : path.includes("auth")
                      ? "export const getAdminSession=async()=>globalThis.__safetyTest.authenticated?{user:{id:'trusted-admin',email:'admin@example.test'},supabase:{}}:null;export const requireAdmin=async()=>{const session=await getAdminSession();if(!session)throw Error('Unauthorized');return session;};"
                      : path === "next/navigation"
                        ? "export const redirect=url=>{throw Error('REDIRECT:'+url)};"
                        : "export const cacheLife=()=>{};export const cacheTag=()=>{};export const revalidatePath=()=>{};export const updateTag=()=>{};",
            }));
          },
        },
      ],
    });
    const snapshot = async () => ({
      products: await prisma.product.findMany({ orderBy: { id: "asc" } }),
      documents: await prisma.cmsDocument.findMany({ orderBy: { id: "asc" } }),
      images: await prisma.homepageImage.findMany({ orderBy: { slot: "asc" } }),
      audit: await prisma.auditLog.findMany({ orderBy: { id: "asc" } }),
    });
    const before = digest(await snapshot());
    const globals = globalThis as typeof globalThis & {
      __safetyTest?: { db: unknown; authenticated: boolean; failAudit: boolean };
    };
    const rollback = new Error("ROLLBACK_SAFETY_TEST");
    try {
      const actions = (await import(pathToFileURL(file).href)) as Actions;
      await assert.rejects(
        prisma.$transaction(
          async (tx) => {
            let savepoint = 0;
            const context = { authenticated: true, failAudit: false, db: null as unknown };
            const guarded = new Proxy(tx, {
              get(target, key) {
                if (key === "$transaction")
                  return async (callback: (db: typeof tx) => unknown) => {
                    const name = `safety_${++savepoint}`;
                    await tx.$executeRawUnsafe(`SAVEPOINT ${name}`);
                    try {
                      const result = await callback(guarded);
                      await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`);
                      return result;
                    } catch (error) {
                      await tx.$executeRawUnsafe(`ROLLBACK TO SAVEPOINT ${name}`);
                      await tx.$executeRawUnsafe(`RELEASE SAVEPOINT ${name}`);
                      throw error;
                    }
                  };
                if (key === "auditLog" && context.failAudit)
                  return new Proxy(target.auditLog, {
                    get(model, method) {
                      if (method === "create" || method === "createMany")
                        return () => {
                          throw Error("Simulated audit failure");
                        };
                      return Reflect.get(model, method);
                    },
                  });
                return Reflect.get(target, key);
              },
            });
            context.db = guarded;
            globals.__safetyTest = context;
            const base = {
              category: "food" as const,
              subtitle: "Safety fixture",
              description: "Rollback only",
              image: "",
              capacity: "10 kg",
              readability: "1 g",
              connection: "USB",
              published: true,
              featured: false,
              sortOrder: 90000,
              catalogManaged: true,
            };
            const a = await tx.product.create({
              data: { ...base, id: randomUUID(), slug: `safety-${randomUUID()}`, name: "Safety A" },
            });
            const b = await tx.product.create({
              data: { ...base, id: randomUUID(), slug: `safety-${randomUUID()}`, name: "Safety B" },
            });
            const productForm = form({
              ...a,
              updatedAt: a.updatedAt.toISOString(),
              gallery: "[]",
              published: "on",
              featured: "",
              detail: "1",
              name: "Safety edited",
              actorId: "forged-actor",
            });
            assert.equal((await actions.saveProductAction({}, productForm)).success, true);
            const saved = await tx.product.findUniqueOrThrow({ where: { id: a.id } });
            const media = await tx.cmsDocument.findUniqueOrThrow({
              where: { id: `product-media:${a.id}` },
            });
            const edit = await tx.auditLog.findFirstOrThrow({
              where: { entityType: "product", entityId: a.id },
            });
            assert.equal(edit.actorId, "trusted-admin");
            assert.equal(edit.actorEmail, "admin@example.test");
            assert.equal(edit.action, "update");
            assert(edit.fields.includes("name"));
            const items = [saved, b].map(({ id, updatedAt }) => ({
              id,
              updatedAt: updatedAt.toISOString(),
            }));
            assert.equal(
              (await actions.manageProductsAction({ type: "delete", items })).success,
              true,
            );
            assert.equal(
              await tx.product.count({
                where: { id: { in: [a.id, b.id] }, deletedAt: { not: null }, published: false },
              }),
              2,
            );
            assert.equal(
              await tx.auditLog.count({
                where: { entityId: { in: [a.id, b.id] }, action: "delete" },
              }),
              2,
            );
            assert.equal(
              digest((await tx.cmsDocument.findUniqueOrThrow({ where: { id: media.id } })).data),
              digest(media.data),
            );
            const removed = await tx.product.findUniqueOrThrow({ where: { id: a.id } });
            const restore = {
              kind: "product",
              id: a.id,
              updatedAt: removed.updatedAt.toISOString(),
              category: "food",
            };
            context.authenticated = false;
            assert((await actions.restoreItemAction(restore)).error);
            await assert.rejects(actions.listTrash(), /Unauthorized/);
            await assert.rejects(actions.listAudit(1), /Unauthorized/);
            context.authenticated = true;
            assert((await actions.restoreItemAction({ ...restore, actorId: "forged" })).error);
            assert((await actions.restoreItemAction({ ...restore, category: "all" })).error);
            assert(
              (
                await actions.restoreItemAction({
                  ...restore,
                  updatedAt: new Date(0).toISOString(),
                })
              ).error,
            );
            assert.equal((await actions.restoreItemAction(restore)).success, true);
            const restored = await tx.product.findUniqueOrThrow({ where: { id: a.id } });
            assert.equal(restored.deletedAt, null);
            assert.equal(restored.published, false);
            assert((await actions.restoreItemAction(restore)).error);
            const custom = await tx.cmsDocument.create({
              data: {
                id: `category:${randomUUID()}`,
                kind: "category",
                data: { label: `Recovery ${randomUUID()}`, english: "Recovery" },
              },
            });
            await tx.product.update({
              where: { id: a.id },
              data: { categoryId: custom.id.slice(9) },
            });
            assert.equal(
              (
                await actions.deleteDocumentAction(
                  {},
                  form({
                    id: custom.id,
                    kind: "category",
                    version: custom.updatedAt.toISOString(),
                    replacement: "food",
                    detail: "1",
                  }),
                )
              ).success,
              true,
            );
            const deletedCategory = await tx.cmsDocument.findUniqueOrThrow({
              where: { id: custom.id },
            });
            assert.equal(
              (await tx.product.findUniqueOrThrow({ where: { id: a.id } })).categoryId,
              "food",
            );
            assert.equal(
              (
                await actions.restoreItemAction({
                  kind: "category",
                  id: custom.id,
                  updatedAt: deletedCategory.updatedAt.toISOString(),
                })
              ).success,
              true,
            );
            assert.equal(
              (await tx.product.findUniqueOrThrow({ where: { id: a.id } })).categoryId,
              "food",
            );
            const duplicate = await tx.cmsDocument.create({
              data: {
                id: `category:${randomUUID()}`,
                kind: "category",
                data: custom.data!,
                deletedAt: new Date(),
              },
            });
            assert.match(
              (
                await actions.restoreItemAction({
                  kind: "category",
                  id: duplicate.id,
                  updatedAt: duplicate.updatedAt.toISOString(),
                })
              ).error!,
              /มีอยู่แล้ว/,
            );
            const pageId = `page:${randomUUID()}`;
            const pageData = {
              sourcePath: "",
              path: `/recovery-${randomUUID()}`,
              title: "Recovery page",
              kind: "page",
              html: "<p>Original retained content</p>",
              images: [],
              videos: [],
              productIds: [],
              published: true,
              order: 0,
            };
            assert.equal(
              (
                await actions.saveDocumentAction(
                  {},
                  form({
                    id: pageId,
                    kind: "page",
                    version: "",
                    data: JSON.stringify(pageData),
                    detail: "1",
                  }),
                )
              ).success,
              true,
            );
            const page = await tx.cmsDocument.findUniqueOrThrow({ where: { id: pageId } });
            assert.equal(
              (
                await actions.deleteDocumentAction(
                  {},
                  form({
                    id: pageId,
                    kind: "page",
                    version: page.updatedAt.toISOString(),
                    detail: "1",
                  }),
                )
              ).success,
              true,
            );
            const deletedPage = await tx.cmsDocument.findUniqueOrThrow({ where: { id: pageId } });
            assert.equal(
              (
                await actions.restoreItemAction({
                  kind: "page",
                  id: pageId,
                  updatedAt: deletedPage.updatedAt.toISOString(),
                })
              ).success,
              true,
            );
            const recoveredPage = await tx.cmsDocument.findUniqueOrThrow({ where: { id: pageId } });
            assert.deepEqual(recoveredPage.data, { ...pageData, aliases: [], published: false });
            const used = new Set(
              (await tx.cmsDocument.findMany({ select: { id: true } })).map(({ id }) => id),
            );
            const original = importedPages.find(
              (item) =>
                item.kind !== "product" &&
                item.path !== "/" &&
                !used.has(actions.sourcePageId(item.path)),
            )!;
            const tombstone = await tx.cmsDocument.create({
              data: {
                id: actions.sourcePageId(original.path),
                kind: "page",
                data: { sourcePath: original.path },
                deletedAt: new Date(),
              },
            });
            assert.equal(
              (
                await actions.restoreItemAction({
                  kind: "page",
                  id: tombstone.id,
                  updatedAt: tombstone.updatedAt.toISOString(),
                })
              ).success,
              true,
            );
            const imported = (
              await tx.cmsDocument.findUniqueOrThrow({ where: { id: tombstone.id } })
            ).data as { title: string; html: string; published: boolean };
            assert.equal(imported.title, original.title);
            assert.equal(imported.html, original.html);
            assert.equal(imported.published, false);
            const current = await tx.product.findUniqueOrThrow({ where: { id: a.id } });
            const audits = await tx.auditLog.count();
            context.failAudit = true;
            assert(
              (
                await actions.deleteProductAction(
                  form({ id: a.id, updatedAt: current.updatedAt.toISOString() }),
                )
              ).error,
            );
            context.failAudit = false;
            assert.equal(
              digest(await tx.product.findUniqueOrThrow({ where: { id: a.id } })),
              digest(current),
            );
            assert.equal(await tx.auditLog.count(), audits);
            const trash = await actions.listTrash();
            assert(trash.some((item) => item.id === b.id));
            assert(!trash.some((item) => item.id === a.id));
            const history = await actions.listAudit(1, "product", a.id);
            assert(history.rows.some((item) => item.action === "restore"));
            assert(history.rows.every((item) => item.actorId === "trusted-admin"));
            const permissions = await tx.$queryRaw<
              { readable: boolean }[]
            >`SELECT has_table_privilege('anon','public.audit_logs','SELECT') AS readable`;
            assert.equal(permissions[0].readable, false);
            throw rollback;
          },
          { timeout: 110000 },
        ),
        (error) => error === rollback,
      );
      assert.equal(digest(await snapshot()), before);
    } finally {
      delete globals.__safetyTest;
      await prisma.$disconnect();
      await unlink(file);
    }
  },
);
