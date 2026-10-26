import "dotenv/config";
import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash, randomUUID } from "node:crypto";
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
  getAdminProduct: (
    id: string,
  ) => Promise<(Product & { updatedAt: string; gallery?: string[] }) | null>;
  saveDocumentAction: (previous: ActionState, form: FormData) => Promise<ActionState>;
  deleteDocumentAction: (previous: ActionState, form: FormData) => Promise<ActionState>;
  getCategories: () => Promise<Array<{ id: string; label: string; english: string }>>;
  getContentPages: () => Promise<Array<{ path: string; title: string }>>;
  getContentPage: (
    path: string,
  ) => Promise<
    { path: string; title: string; html: string; videos?: { id: string }[] } | undefined
  >;
  getSettings: <T>(id: string, defaults: T) => Promise<T>;
  safeLink: (value: string) => boolean;
  cleanHtml: (value: string) => string;
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
    timeout: 150000,
  },
  async () => {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
    const harnessPath = resolve("node_modules/.cache", `catalog-actions-${randomUUID()}.mjs`);
    await mkdir(resolve("node_modules/.cache"), { recursive: true });
    // Exercise production actions and repositories against real PostgreSQL. Only the
    // verified auth boundary and Next's request/cache context are supplied by this harness.
    await build({
      stdin: {
        contents:
          'export * from "./src/features/admin/server/product-actions"; export * from "./src/features/catalog/server/product-repository"; export * from "./src/features/admin/server/products"; export * from "./src/features/admin/server/home-image-actions"; export * from "./src/features/home/server/home-images"; export * from "./src/features/admin/server/media"; export * from "./src/features/cms/server/actions"; export * from "./src/features/cms/server/categories"; export * from "./src/features/cms/server/documents"; export * from "./src/features/cms/server/validation"; export * from "./src/features/content/server/content-repository";',
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
              {
                filter:
                  /^(server-only|next\/cache|next\/navigation|@\/lib\/prisma|\.\/auth|@\/features\/admin\/server\/auth)$/,
              },
              (args) => ({ path: args.path, namespace: "context" }),
            );
            builder.onLoad({ filter: /.*/, namespace: "context" }, ({ path }) => {
              const contents =
                path === "server-only"
                  ? "export {};"
                  : path === "@/lib/prisma"
                    ? "export const getPrisma = () => globalThis.__catalogActionTest.db;"
                    : path === "./auth" || path === "@/features/admin/server/auth"
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
      const documentsBefore = await prisma.cmsDocument.findMany({ orderBy: { id: "asc" } });
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
            const context: TestContext = {
              db: new Proxy(tx, {
                get(target, key) {
                  return key === "$transaction"
                    ? (run: (client: typeof tx) => unknown) => run(tx)
                    : Reflect.get(target, key);
                },
              }),
              authenticated: true,
              invalidated: [],
            };
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

            // The CMS uses additive overrides. Every mutation here is rolled back.
            const documentForm = (
              id: string,
              kind: string,
              data: unknown,
              version = "",
              productVersion = "",
            ) => {
              const form = new FormData();
              form.set("id", id);
              form.set("kind", kind);
              form.set("data", JSON.stringify(data));
              form.set("version", version);
              form.set("productVersion", productVersion);
              return form;
            };
            const savedDocument = (
              id: string,
              kind: string,
              data: unknown,
              version = "",
              productVersion = "",
            ) =>
              assert.rejects(
                actions.saveDocumentAction(
                  {},
                  documentForm(id, kind, data, version, productVersion),
                ),
                /REDIRECT:\/admin\/content\//,
              );
            const live = (await actions.getProducts())[0];
            const galleryProduct = (await actions.getAdminProduct("feh5ks"))!;
            assert.equal(
              galleryProduct.gallery?.length,
              4,
              "The editor must expose all four original product images",
            );
            const replacedGallery = [...galleryProduct.gallery!];
            replacedGallery[2] = "/images/products/wps10ks.png";
            const galleryForm = makeForm({ ...galleryProduct, published: true });
            galleryForm.set("gallery", JSON.stringify(replacedGallery));
            await save(galleryForm);
            assert.deepEqual(
              (await actions.getProduct(galleryProduct.slug))?.media?.gallery.map(
                (entry) => entry.image,
              ),
              replacedGallery,
            );
            const latestGalleryProduct = (await actions.getAdminProduct("feh5ks"))!;
            const reorderedGallery = [replacedGallery[3], replacedGallery[0], replacedGallery[2]];
            const reorderForm = makeForm({
              ...latestGalleryProduct,
              published: true,
              image: reorderedGallery[0],
            });
            reorderForm.set("gallery", JSON.stringify(reorderedGallery));
            await save(reorderForm);
            assert.deepEqual((await actions.getAdminProduct("feh5ks"))?.gallery, reorderedGallery);
            assert.equal(
              (await actions.getProduct(galleryProduct.slug))?.image,
              reorderedGallery[0],
            );
            assert.match((await actions.saveProductAction({}, galleryForm)).error!, /ถูกแก้ไข/);
            const invalidGalleryForm = makeForm({
              ...(await actions.getAdminProduct("feh5ks"))!,
              published: true,
            });
            invalidGalleryForm.set("gallery", JSON.stringify(["https://evil.test/image.png"]));
            assert.match(
              (await actions.saveProductAction({}, invalidGalleryForm)).error!,
              /แกลเลอรี/,
            );
            const liveRaw = await tx.product.findUniqueOrThrow({ where: { id: live.id } });
            const hero = {
              announcement: "ประกาศทดสอบ",
              announcementLabel: "อ่านต่อ",
              announcementHref: "/about-us",
              tagline: "คำโฆษณา",
              primaryLabel: "ดูข้อมูล",
              secondaryLabel: "สินค้า",
              secondaryHref: "/products",
              slides: [
                {
                  productId: live.id,
                  title: "หัวข้อใหม่",
                  description: "คำโปรยใหม่",
                  image: "",
                  href: "",
                },
              ],
            };
            await savedDocument("hero", "settings", hero);
            assert.equal((await actions.getSettings("hero", hero)).announcement, "ประกาศทดสอบ");
            assert.match(
              (await actions.saveDocumentAction({}, documentForm("hero", "settings", hero))).error!,
              /ถูกแก้ไข/,
            );
            const unsafeHero = { ...hero, announcementHref: "javascript:alert(1)" };
            assert.match(
              (await actions.saveDocumentAction({}, documentForm("hero", "settings", unsafeHero)))
                .error!,
              /ลิงก์/,
            );
            for (const value of [
              "javascript:alert(1)",
              "//evil.test",
              "/foo/../admin/products",
              "/%61dmin/login",
              "/api/products",
              "/\\evil.test",
              "data:text/html,x",
            ])
              assert.equal(actions.safeLink(value), false, value);
            for (const value of [
              "/collections/Smart weighing",
              "/about-us",
              "#support",
              "https://line.me/R/ti/p/@sunford",
              "tel:034276999",
            ])
              assert.equal(actions.safeLink(value), true, value);
            assert.doesNotMatch(
              actions.cleanHtml(
                '<p onclick="alert(1)">text<script>alert(1)</script><a href="javascript:alert(1)">link</a><img src="https://evil.test/x.png" onerror="x"></p>',
              ),
              /script|onclick|onerror|evil.test/,
            );

            const categoryId = "category:" + randomUUID();
            await savedDocument(categoryId, "category", {
              label: "หมวดใหม่ทดสอบ",
              english: "Custom category",
            });
            const customId = categoryId.slice(9);
            await save(
              makeForm({
                ...live,
                updatedAt: liveRaw.updatedAt,
                published: true,
                category: customId,
              }),
            );
            assert.equal((await actions.getProduct(live.slug))?.category, customId);
            assert.equal(
              (await tx.product.findUniqueOrThrow({ where: { id: live.id } })).category,
              "accessories",
            );
            let categoryDoc = await tx.cmsDocument.findUniqueOrThrow({ where: { id: categoryId } });
            await savedDocument(
              categoryId,
              "category",
              { label: "ชื่อหมวดใหม่", english: "Renamed custom category" },
              categoryDoc.updatedAt.toISOString(),
            );
            assert.equal(
              (await actions.getCategories()).find((category) => category.id === customId)?.label,
              "ชื่อหมวดใหม่",
            );
            assert.equal((await actions.getProduct(live.slug))?.category, customId);
            categoryDoc = await tx.cmsDocument.findUniqueOrThrow({ where: { id: categoryId } });
            const deleteCategory = documentForm(
              categoryId,
              "category",
              {},
              categoryDoc.updatedAt.toISOString(),
            );
            assert.match(
              (await actions.deleteDocumentAction({}, deleteCategory)).error!,
              /เลือกหมวดหมู่/,
            );
            deleteCategory.set("replacement", "food");
            await assert.rejects(
              actions.deleteDocumentAction({}, deleteCategory),
              /REDIRECT:\/admin\/categories/,
            );
            assert.equal((await actions.getProduct(live.slug))?.category, "food");
            assert.equal(
              (await actions.getCategories()).some((category) => category.id === customId),
              false,
            );
            const categoryProduct = await tx.product.findUniqueOrThrow({ where: { id: live.id } });
            const invalidCategory = await actions.saveProductAction(
              {},
              makeForm({
                ...live,
                updatedAt: categoryProduct.updatedAt,
                published: true,
                category: customId,
              }),
            );
            assert.ok(invalidCategory.error);
            await savedDocument("category:food", "category", {
              label: "อาหารชื่อใหม่",
              english: "Food renamed",
            });
            assert.equal(
              (await actions.getCategories()).find((category) => category.id === "food")?.label,
              "อาหารชื่อใหม่",
            );

            const mediaId = "product-media:" + live.id;
            const media = {
              price: 1234.5,
              gallery: [
                { image: "/images/products/feh5ks.png" },
                { image: "/images/products/rls1100.png" },
              ],
              descriptionHtml: "<p>เนื้อหาใหม่<script>bad()</script></p>",
              detailsHtml: "<table><tbody><tr><td>รายละเอียด</td></tr></tbody></table>",
              specifications: [{ label: "กำลังไฟ", value: "220 V" }],
              videos: [
                { id: "https://youtu.be/abcdefghijk", image: "/images/products/feh5ks.png" },
              ],
            };
            await savedDocument(
              mediaId,
              "product-media",
              media,
              "",
              categoryProduct.updatedAt.toISOString(),
            );
            const rendered = await actions.getProduct(live.slug);
            assert.equal(rendered?.price, 1234.5);
            assert.equal(rendered?.media?.gallery.length, 2);
            assert.equal(rendered?.media?.videos[0].id, "abcdefghijk");
            assert.doesNotMatch(rendered?.media?.descriptionHtml ?? "", /script|bad/);
            assert.match(
              (
                await actions.saveDocumentAction(
                  {},
                  documentForm(
                    mediaId,
                    "product-media",
                    media,
                    "",
                    categoryProduct.updatedAt.toISOString(),
                  ),
                )
              ).error!,
              /ถูกแก้ไข/,
            );
            const mediaProduct = await tx.product.findUniqueOrThrow({ where: { id: live.id } });
            await save(
              makeForm({
                ...resolveManagedProduct(mediaProduct),
                description: "คำอธิบายที่แก้จากข้อมูลสินค้า",
                image: "/images/products/wps10ks.png",
                capacity: "99 kg",
                published: true,
              }),
            );
            const updatedMedia = (await actions.getProduct(live.slug))!.media!;
            assert.match(updatedMedia.descriptionHtml, /คำอธิบายที่แก้/);
            assert.equal(updatedMedia.gallery[0].image, "/images/products/wps10ks.png");
            assert.ok(updatedMedia.specifications.some((spec) => spec.value === "99 kg"));
            assert.equal(updatedMedia.price, 1234.5);

            const pageId =
              "page:" + createHash("sha256").update("/about-us").digest("hex").slice(0, 32);
            const pagePath = "/qa-" + randomUUID();
            const pageData = {
              sourcePath: "/about-us",
              path: pagePath,
              title: "ข่าวที่แก้ไข",
              kind: "article",
              html: "<h2>เนื้อหาข่าวที่บันทึก</h2>",
              images: [{ image: "/images/products/feh5ks.png" }],
              videos: [{ id: "abcdefghijk", image: "" }],
              productIds: [{ id: live.id }],
              published: true,
              order: 0,
            };
            await saveTarget(await targetForm("digital", "page", "/about-us"));
            await savedDocument(pageId, "page", pageData);
            assert.equal((await actions.getHomeLinkTargets()).digital?.pagePath, pagePath);
            assert.equal((await actions.getContentPage("/about-us"))?.path, pagePath);
            assert.equal((await actions.getContentPage(pagePath))?.title, "ข่าวที่แก้ไข");
            let pageDoc = await tx.cmsDocument.findUniqueOrThrow({ where: { id: pageId } });
            await savedDocument(
              pageId,
              "page",
              { ...pageData, path: pagePath + "-new" },
              pageDoc.updatedAt.toISOString(),
            );
            assert.equal((await actions.getContentPage(pagePath))?.path, pagePath + "-new");
            pageDoc = await tx.cmsDocument.findUniqueOrThrow({ where: { id: pageId } });
            await savedDocument(
              pageId,
              "page",
              { ...pageData, path: pagePath + "-new", published: false },
              pageDoc.updatedAt.toISOString(),
            );
            assert.equal(await actions.getContentPage("/about-us"), undefined);
            assert.equal((await actions.getHomeLinkTargets()).digital?.disabled, true);
            assert.equal(await actions.getContentPage(pagePath), undefined);
            assert.equal(
              (await actions.getContentPages()).some((page) => page.path === pagePath + "-new"),
              false,
            );
            pageDoc = await tx.cmsDocument.findUniqueOrThrow({ where: { id: pageId } });
            await assert.rejects(
              actions.deleteDocumentAction(
                {},
                documentForm(pageId, "page", {}, pageDoc.updatedAt.toISOString()),
              ),
              /REDIRECT:\/admin\/content/,
            );
            assert.equal(await actions.getContentPage("/about-us"), undefined);
            assert.equal((await actions.getContentPage("/contact-us"))?.path, "/contact-us");
            const collision = await actions.saveDocumentAction(
              {},
              documentForm("page:" + randomUUID(), "page", {
                ...pageData,
                sourcePath: "",
                path: pagePath,
              }),
            );
            assert.match(collision.error!, /URL/);
            context.authenticated = false;
            assert.match(
              (await actions.saveDocumentAction({}, documentForm("hero", "settings", hero))).error!,
              /เข้าสู่ระบบ/,
            );
            assert.match(
              (await actions.deleteDocumentAction({}, deleteCategory)).error!,
              /เข้าสู่ระบบ/,
            );
            context.authenticated = true;
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
          { timeout: 120000 },
        ),
        (error: unknown) => error === rollback,
      );
      assert.deepEqual(await prisma.product.findMany({ orderBy: { id: "asc" } }), before);
      assert.deepEqual(
        await prisma.cmsDocument.findMany({ orderBy: { id: "asc" } }),
        documentsBefore,
      );
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
