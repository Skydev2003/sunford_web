import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { mkdir, unlink } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { resolveManagedProduct } from "../../src/features/catalog/data/managed-products";
import { categories } from "../../src/features/catalog/types";
import { importCatalog } from "../../prisma/catalog-import";
import type { ActionState } from "../../src/features/admin/types";
import type { Product } from "../../src/features/catalog/types";
import { homeImageSlots, type HomeImages } from "../../src/features/home/data/image-slots";
import { resolveHomeLink, type HomeLinkTargets } from "../../src/features/home/data/link-targets";

type Harness = {
  saveProductAction: (previous: ActionState, form: FormData) => Promise<ActionState>;
  deleteProductAction: (form: FormData) => Promise<ActionState>;
  getProducts: () => Promise<Product[]>;
  getProduct: (slug: string) => Promise<Product | undefined>;
  listAdminProducts: () => Promise<Array<Product & { updatedAt: string }>>;
  saveHomeImageAction: (previous: ActionState, form: FormData) => Promise<ActionState>;
  getHomeImages: () => Promise<HomeImages>;
  getHomeLinkTargets: () => Promise<HomeLinkTargets>;
  removeUnusedImage: (service: unknown, image: string) => Promise<void>;
};
type TestContext = { db: unknown; authenticated: boolean; invalidated: string[] };
const globals = globalThis as typeof globalThis & { __catalogActionTest?: TestContext };

test(
  "real database: complete catalogue CRUD, all categories, concurrency and preserved originals",
  {
    skip: !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("YOUR-PASSWORD"),
    timeout: 90000,
  },
  async () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
    const harnessPath = resolve("test-results", `catalog-actions-${randomUUID()}.mjs`);
    await mkdir(resolve("test-results"), { recursive: true });
    // Exercise production actions and repositories against real PostgreSQL. Only the
    // verified auth boundary and Next's request/cache context are supplied by this harness.
    await build({
      stdin: {
        contents:
          'export * from "./src/features/admin/server/product-actions"; export * from "./src/features/catalog/server/product-repository"; export * from "./src/features/admin/server/products"; export * from "./src/features/admin/server/home-image-actions"; export * from "./src/features/home/server/home-images"; export * from "./src/features/admin/server/media";',
        resolveDir: process.cwd(),
        loader: "ts",
      },
      outfile: harnessPath,
      bundle: true,
      platform: "node",
      format: "esm",
      packages: "external",
      plugins: [
        {
          name: "next-test-context",
          setup(builder) {
            builder.onResolve(
              { filter: /^(server-only|next\/cache|next\/navigation|@\/lib\/prisma|\.\/auth)$/ },
              (args) => ({ path: args.path, namespace: "context" }),
            );
            builder.onLoad({ filter: /.*/, namespace: "context" }, ({ path }) => {
              const contents =
                path === "server-only"
                  ? "export {};"
                  : path === "@/lib/prisma"
                    ? "export const getPrisma = () => globalThis.__catalogActionTest.db;"
                    : path === "./auth"
                      ? "export const getAdminSession = async () => globalThis.__catalogActionTest.authenticated ? { user: { id: 'transaction-test' }, supabase: {} } : null; export const requireAdmin = async () => { const session = await getAdminSession(); if (!session) throw new Error('Unauthorized'); return session; };"
                      : path === "next/navigation"
                        ? "export const redirect = (url) => { throw new Error('REDIRECT:' + url); };"
                        : "export const cacheLife = () => {}; export const cacheTag = () => {}; export const revalidatePath = (path) => globalThis.__catalogActionTest.invalidated.push(path); export const updateTag = (tag) => globalThis.__catalogActionTest.invalidated.push(tag);";
              return { contents, loader: "js" };
            });
          },
        },
      ],
    });
    const rollback = new Error("ROLLBACK_ALL_TEST_MUTATIONS");
    try {
      const actions = (await import(pathToFileURL(harnessPath).href)) as Harness;
      const before = await prisma.product.findMany({ orderBy: { id: "asc" } });
      const homeImagesBefore = await prisma.homepageImage.findMany({ orderBy: { slot: "asc" } });
      const makeForm = (
        product: Product & { published?: boolean; updatedAt?: Date | string },
        editing = true,
      ) => {
        const form = new FormData();
        for (const field of [
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
        ] as const)
          form.set(field, String(product[field] ?? ""));
        if (product.published) form.set("published", "on");
        if (product.featured) form.set("featured", "on");
        if (editing) {
          form.set("id", product.id);
          form.set(
            "updatedAt",
            product.updatedAt instanceof Date
              ? product.updatedAt.toISOString()
              : product.updatedAt!,
          );
        }
        return form;
      };
      const save = (form: FormData) =>
        assert.rejects(actions.saveProductAction({}, form), /REDIRECT:\/admin\/products\?saved=1/);
      await assert.rejects(
        prisma.$transaction(
          async (tx) => {
            const context: TestContext = { db: tx, authenticated: true, invalidated: [] };
            globals.__catalogActionTest = context;
            const initial = await actions.getProducts();
            assert.equal(initial.length, before.filter((p) => p.published && !p.deletedAt).length);
            const adminProducts = await actions.listAdminProducts();
            assert.equal(adminProducts.length, before.filter((p) => !p.deletedAt).length);
            for (const product of initial)
              assert.equal(
                adminProducts.find((p) => p.id === product.id)?.subtitle,
                product.subtitle,
              );
            for (const stored of before.filter((p) => p.published && !p.deletedAt)) {
              const expected = resolveManagedProduct(stored);
              const product = initial.find((p) => p.id === stored.id)!;
              for (const key of [
                "slug",
                "name",
                "subtitle",
                "category",
                "image",
                "description",
                "capacity",
                "readability",
                "connection",
                "badge",
                "featured",
                "sortOrder",
                "sourceId",
                "sourceUrl",
                "price",
              ] as const)
                assert.deepEqual(product[key], expected[key]);
            }
            // Each homepage slot is independent of product images. Save/replace/reset
            // only inside this transaction, which is rolled back before finishing.
            const imageForm = (slot: string, image: string, version = "") => {
              const form = new FormData();
              form.set("slot", slot);
              form.set("image", image);
              form.set("updatedAt", version);
              return form;
            };
            for (const slot of homeImageSlots) {
              const previous = await tx.homepageImage.findUnique({ where: { slot: slot.id } });
              const stale = imageForm(
                slot.id,
                "/images/products/feh5ks.png",
                previous?.updatedAt.toISOString(),
              );
              await assert.rejects(
                actions.saveHomeImageAction(
                  {},
                  imageForm(
                    slot.id,
                    "/images/products/rls1100.png",
                    previous?.updatedAt.toISOString(),
                  ),
                ),
                /REDIRECT:\/admin\/home-images\?saved=/,
              );
              assert.equal(
                (await actions.getHomeImages())[slot.id],
                "/images/products/rls1100.png",
              );
              assert.match(
                (await actions.saveHomeImageAction({}, stale)).error!,
                /ถูกแก้ไขจากอีกหน้า/,
              );
              const saved = await tx.homepageImage.findUniqueOrThrow({ where: { slot: slot.id } });
              await assert.rejects(
                actions.saveHomeImageAction(
                  {},
                  imageForm(slot.id, "", saved.updatedAt.toISOString()),
                ),
                /REDIRECT:\/admin\/home-images\?saved=/,
              );
              assert.equal((await actions.getHomeImages())[slot.id], undefined);
            }
            if (process.env.SUPABASE_URL) {
              const sharedImage = `${process.env.SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/product-images/${randomUUID()}/${randomUUID()}.png`;
              await tx.homepageImage.create({ data: { slot: "smart", image: sharedImage } });
              let removals = 0;
              const service = {
                storage: {
                  from: () => ({
                    remove: async () => {
                      removals++;
                      return { error: null };
                    },
                  }),
                },
              };
              await actions.removeUnusedImage(service, sharedImage);
              assert.equal(
                removals,
                0,
                "Product cleanup must preserve images referenced by the homepage",
              );
              await tx.homepageImage.delete({ where: { slot: "smart" } });
              await actions.removeUnusedImage(service, sharedImage);
              assert.equal(removals, 1);
            }
            const storedProduct = await tx.product.findFirstOrThrow();
            const referenced = await tx.product.create({
              data: {
                ...storedProduct,
                id: randomUUID(),
                slug: `qa-home-link-${randomUUID()}`,
                name: "QA homepage target",
                published: true,
                deletedAt: null,
                catalogManaged: true,
              },
            });
            const targetForm = async (slot: string, type: string, value = "") => {
              const previous = await tx.homepageImage.findUnique({ where: { slot } });
              const form = imageForm(
                slot,
                previous?.image ?? "",
                previous?.updatedAt.toISOString(),
              );
              form.set("targetType", type);
              if (type === "product") form.set("targetProductId", value);
              if (type === "page") form.set("targetPagePath", value);
              return form;
            };
            const saveTarget = (form: FormData) =>
              assert.rejects(
                actions.saveHomeImageAction({}, form),
                /REDIRECT:\/admin\/home-images\?saved=/,
              );
            for (const slot of homeImageSlots) {
              await saveTarget(await targetForm(slot.id, "product", referenced.id));
              assert.equal((await actions.getHomeLinkTargets())[slot.id]?.productId, referenced.id);
              assert.equal(
                (await actions.getHomeImages())[slot.id],
                undefined,
                "Link-only settings must preserve default artwork",
              );
              assert.equal(
                resolveHomeLink(
                  slot.id,
                  (await actions.getHomeLinkTargets())[slot.id],
                  await actions.getProducts(),
                ),
                `/products/${referenced.slug}`,
              );
            }
            const renamedSlug = `qa-renamed-${randomUUID()}`;
            await tx.product.update({ where: { id: referenced.id }, data: { slug: renamedSlug } });
            assert.equal(
              resolveHomeLink(
                "digital",
                (await actions.getHomeLinkTargets()).digital,
                await actions.getProducts(),
              ),
              `/products/${renamedSlug}`,
            );
            await tx.product.update({ where: { id: referenced.id }, data: { published: false } });
            assert.equal(
              resolveHomeLink(
                "digital",
                (await actions.getHomeLinkTargets()).digital,
                await actions.getProducts(),
              ),
              undefined,
            );
            assert.ok(
              (
                await actions.saveHomeImageAction(
                  {},
                  await targetForm("digital", "product", referenced.id),
                )
              ).error,
            );
            await tx.product.delete({ where: { id: referenced.id } });
            assert.equal(
              resolveHomeLink(
                "digital",
                (await actions.getHomeLinkTargets()).digital,
                await actions.getProducts(),
              ),
              undefined,
            );
            for (const path of [
              "https://example.com",
              "//example.com",
              "/admin/login",
              "/api/products",
              "/not-a-real-public-page",
            ])
              assert.ok(
                (await actions.saveHomeImageAction({}, await targetForm("digital", "page", path)))
                  .error,
              );
            for (const slot of homeImageSlots) {
              await saveTarget(await targetForm(slot.id, "page", "/about-us"));
              assert.deepEqual((await actions.getHomeLinkTargets())[slot.id], {
                productId: null,
                pagePath: "/about-us",
              });
              const previous = await tx.homepageImage.findUniqueOrThrow({
                where: { slot: slot.id },
              });
              await saveTarget(imageForm(slot.id, "", previous.updatedAt.toISOString()));
              assert.equal(
                (await actions.getHomeLinkTargets())[slot.id]?.pagePath,
                "/about-us",
                "Resetting only the image must not reset its destination",
              );
              await saveTarget(await targetForm(slot.id, "default"));
              assert.equal((await actions.getHomeLinkTargets())[slot.id], undefined);
            }
            assert.deepEqual(await actions.getProducts(), initial);
            assert.deepEqual(await tx.product.findMany({ orderBy: { id: "asc" } }), before);
            assert.ok((await actions.saveHomeImageAction({}, imageForm("unknown", ""))).error);
            assert.ok(
              (
                await actions.saveHomeImageAction(
                  {},
                  imageForm("smart", "https://untrusted.example/image.png"),
                )
              ).error,
            );

            // Existing seed and imported records are changed only inside this uncommitted
            // transaction; other requests continue to see their original values throughout.
            for (const id of ["wps10ks", "sunford-RLS1100", "sunford-10730"]) {
              const stored = await tx.product.findUniqueOrThrow({ where: { id } });
              if (stored.deletedAt) continue;
              const effective = resolveManagedProduct(stored);
              const draft = { ...effective, subtitle: "Transactional edit", published: false };
              const stale = makeForm(effective);
              await save(makeForm(draft));
              assert.equal(await actions.getProduct(effective.slug), undefined);
              assert.match(
                (await actions.saveProductAction({}, stale)).error!,
                /ถูกแก้ไขจากอีกหน้า/,
              );
              const latest = await tx.product.findUniqueOrThrow({ where: { id } });
              await save(makeForm({ ...latest, published: true, category: "laboratory" }));
              assert.equal(
                (await actions.getProduct(effective.slug))?.subtitle,
                "Transactional edit",
              );
              assert.equal((await actions.getProduct(effective.slug))?.category, "laboratory");
              const current = await tx.product.findUniqueOrThrow({ where: { id } });
              assert.deepEqual(await actions.deleteProductAction(makeForm(current)), {});
              assert.equal(await actions.getProduct(effective.slug), undefined);
              assert.ok((await tx.product.findUniqueOrThrow({ where: { id } })).deletedAt);
              assert.equal(
                (await actions.listAdminProducts()).some((p) => p.id === id),
                false,
              );
            }
            for (const category of categories.filter((c) => c.id !== "all")) {
              const input = {
                ...getSnapshotProducts()[0],
                slug: `qa-${randomUUID()}`,
                name: `QA ${category.id}`,
                category: category.id,
                image: "",
                published: true,
              };
              await save(makeForm(input, false));
              const created = (await actions.getProducts()).find((p) => p.slug === input.slug)!;
              assert.equal(created.category, category.id);
              const stored = await tx.product.findUniqueOrThrow({ where: { id: created.id } });
              assert.deepEqual(await actions.deleteProductAction(makeForm(stored)), {});
              assert.equal(await actions.getProduct(input.slug), undefined);
            }
            context.authenticated = false;
            assert.match(
              (await actions.saveHomeImageAction({}, imageForm("spotlight", ""))).error!,
              /เข้าสู่ระบบ/,
            );
            assert.match(
              (await actions.saveProductAction({}, makeForm(getSnapshotProducts()[0], false)))
                .error!,
              /เข้าสู่ระบบ/,
            );
            assert.match((await actions.deleteProductAction(new FormData())).error!, /เข้าสู่ระบบ/);
            assert.ok(context.invalidated.includes("products"));
            assert.ok(context.invalidated.includes("home-images"));
            assert.ok(context.invalidated.includes("/api/products"));
            const changed = await tx.product.findMany({ orderBy: { id: "asc" } });
            // Seed again inside the same transaction. Archived imported records
            // must not reappear, and edits/drafts/timestamps must not be reset.
            const transactionClient = {
              $transaction: (run: (client: typeof tx) => Promise<unknown>) => run(tx),
            } as unknown as PrismaClient;
            const imported = await importCatalog(transactionClient);
            assert.equal(imported.imported, 0);
            assert.deepEqual(await tx.product.findMany({ orderBy: { id: "asc" } }), changed);
            throw rollback;
          },
          { timeout: 60000 },
        ),
        (error: unknown) => error === rollback,
      );
      assert.deepEqual(await prisma.product.findMany({ orderBy: { id: "asc" } }), before);
      assert.deepEqual(
        await prisma.homepageImage.findMany({ orderBy: { slot: "asc" } }),
        homeImagesBefore,
      );
    } finally {
      delete globals.__catalogActionTest;
      await prisma.$disconnect();
      await unlink(harnessPath);
    }
  },
);
