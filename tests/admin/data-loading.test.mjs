import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdir, unlink } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import React from "react";
import { renderToReadableStream } from "next/dist/compiled/react-server-dom-webpack/server.node.js";

const output = resolve("node_modules/.cache", `admin-loading-${randomUUID()}.cjs`);
let server;
let context;

before(async () => {
  await mkdir(resolve("node_modules/.cache"), { recursive: true });
  await build({
    stdin: {
      contents:
        'export * from "./src/features/admin/server/auth"; export * from "./src/features/admin/server/products"; export * from "./src/features/admin/server/detail-actions"; export * from "./src/features/cms/server/editors"; export * from "./src/features/catalog/data/managed-products"; export {getSnapshotProducts} from "./src/features/content/data/catalog-snapshot";',
      resolveDir: process.cwd(),
      loader: "ts",
    },
    outfile: output,
    bundle: true,
    platform: "node",
    format: "cjs",
    packages: "external",
    jsx: "automatic",
    plugins: [
      {
        name: "request-boundary",
        setup(builder) {
          const mocks = {
            "server-only": "export {};",
            "@/lib/prisma": "export const getPrisma=()=>globalThis.__adminLoadingTest.db;",
            "@/lib/supabase/server":
              "export const createSupabaseServerClient=async()=>({auth:{getUser:async()=>{const c=globalThis.__adminLoadingTest;c.authCalls++;return {data:{user:c.user},error:c.authError};}}});",
            "next/navigation": 'export const redirect=(url)=>{throw Error("REDIRECT:"+url)};',
            "next/cache": "export const cacheLife=()=>{};export const cacheTag=()=>{};",
            "@/features/home/components/sections":
              'import React from "react";const section=()=>React.createElement("section",null,React.createElement("h2",null,"Example"));export const BusinessSolutionsTemplate=section;export const BrandStoryTemplate=section;export const SupportSectionTemplate=section;',
            "@/components/layout/footer":
              'import React from "react";export const FooterTemplate=()=>React.createElement("footer",null,"Example");',
          };
          builder.onResolve({ filter: /.*/ }, ({ path }) =>
            path in mocks ? { path, namespace: "fixture" } : undefined,
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            contents: mocks[path],
            loader: "js",
            resolveDir: process.cwd(),
          }));
        },
      },
    ],
  });
  server = createRequire(resolve("package.json"))(output);
});
after(async () => {
  await unlink(output);
  delete globalThis.__adminLoadingTest;
});

function reset({
  user = { id: "admin-test" },
  allowed = true,
  authError = null,
  products = [],
} = {}) {
  const calls = [];
  const record = (model, method, result) => async (args) => {
    calls.push({ model, method, args });
    const value = typeof result === "function" ? result(args) : result;
    return value;
  };
  context = {
    user,
    authError,
    authCalls: 0,
    calls,
    db: {
      adminUser: {
        findUnique: record("adminUser", "findUnique", allowed ? { userId: "admin-test" } : null),
      },
      product: {
        findMany: record("product", "findMany", (args) =>
          products
            .filter((row) => !row.deletedAt)
            .map((row) =>
              args.select
                ? Object.fromEntries(Object.keys(args.select).map((key) => [key, row[key]]))
                : row,
            ),
        ),
        findFirst: record(
          "product",
          "findFirst",
          (args) => products.find((row) => row.id === args.where.id && !row.deletedAt) ?? null,
        ),
      },
      cmsDocument: {
        findUnique: record("cmsDocument", "findUnique", null),
        findMany: record("cmsDocument", "findMany", []),
      },
    },
  };
  globalThis.__adminLoadingTest = context;
  return context;
}

async function render(run) {
  let value;
  let failure;
  const stream = renderToReadableStream(
    React.createElement(async function Root() {
      value = await run();
      return null;
    }),
    {},
    {
      onError: (error) => {
        failure = error;
      },
    },
  );
  await new Response(stream).text();
  if (failure) throw failure;
  return value;
}

test("one server render shares fresh authentication across layout and data loaders", async () => {
  reset();
  await render(async () => {
    await server.requireAdmin();
    await Promise.all([
      server.requireAdmin(),
      server.getEditor("site"),
      server.listAdminProducts(),
    ]);
  });
  assert.equal(context.authCalls, 1);
  assert.equal(context.calls.filter((call) => call.model === "adminUser").length, 1);
  await render(() => server.requireAdmin());
  assert.equal(context.authCalls, 2);
  context.user = null;
  await assert.rejects(
    render(() => server.requireAdmin()),
    /REDIRECT:\/admin\/login/,
  );
  assert.equal(context.authCalls, 3);
});

test("anonymous, revoked and non-admin identities cannot read protected data", async () => {
  for (const identity of [
    { user: null },
    { allowed: false },
    { authError: { message: "revoked" } },
  ]) {
    reset(identity);
    for (const read of [
      () => server.getEditor("site"),
      () => server.listAdminProducts(),
      () => server.listAdminProductSummaries(),
      () => server.getAdminCategoryCounts(),
      () => server.getAdminProduct("missing"),
    ])
      await assert.rejects(render(read), /REDIRECT:\/admin\/login/);
    assert.equal(context.calls.filter((call) => call.model !== "adminUser").length, 0);
    const result = await server.loadAdminDetail("content", "site");
    assert.ok(result.error);
    assert.equal(context.calls.filter((call) => call.model !== "adminUser").length, 0);
  }
});

test("settings skip product/category queries and picker fields select only their data", async () => {
  reset({
    products: [
      { id: "published", name: "Published", published: true },
      { id: "draft", name: "Draft", published: false },
      { id: "deleted", deletedAt: new Date() },
    ],
  });
  for (const id of [
    "site",
    "navigation",
    "section:footer",
    "section:story",
    "spotlight",
    "showcase",
    "catalog",
    "stories",
    "videos",
  ]) {
    context.calls.length = 0;
    assert.ok(await render(() => server.getEditor(id)));
    assert.equal(context.calls.filter((call) => call.model === "product").length, 0, id);
    assert.equal(
      context.calls.filter((call) => call.model === "cmsDocument" && call.method === "findMany")
        .length,
      0,
      id,
    );
  }
  const hero = await render(() => server.getEditor("hero"));
  const picker = hero.fields
    .find((field) => field.key === "slides")
    .fields.find((field) => field.key === "productId");
  assert.deepEqual(
    picker.options.map((option) => option.value),
    ["", "published"],
  );
  const call = context.calls.find((call) => call.model === "product");
  assert.deepEqual(call.args.select, { id: true, name: true, published: true });
  const page = await render(() => server.getEditor("page:new"));
  const pagePicker = page.fields.find((field) => field.key === "productIds").fields[0];
  assert.deepEqual(
    pagePicker.options.map((option) => option.value),
    ["", "published", "draft"],
  );
});

test("detail actions authenticate once while reusing the trusted server session", async () => {
  reset();
  assert.ok((await server.loadAdminDetail("content", "site")).editor);
  assert.equal(context.authCalls, 1);
  reset();
  assert.ok((await server.loadAdminDetail("product", "missing")).error);
  assert.equal(context.authCalls, 1);
});

test("category counts preserve legacy overrides, custom categories, drafts and deletions", async () => {
  const snapshot = server.getSnapshotProducts()[0];
  const products = [
    {
      ...snapshot,
      catalogManaged: false,
      category: "pos",
      categoryId: null,
      updatedAt: new Date(),
    },
    {
      ...snapshot,
      id: "custom",
      catalogManaged: true,
      categoryId: "custom-category",
      published: false,
      updatedAt: new Date(),
    },
    {
      ...snapshot,
      id: "managed",
      catalogManaged: true,
      category: "food",
      categoryId: null,
      updatedAt: new Date(),
    },
    {
      ...snapshot,
      id: "deleted",
      catalogManaged: true,
      deletedAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  reset({ products });
  const counts = await render(() => server.getAdminCategoryCounts());
  const expected = {};
  for (const product of products.filter((row) => !row.deletedAt)) {
    const category = server.resolveManagedProduct(product).category;
    expected[category] = (expected[category] ?? 0) + 1;
  }
  assert.deepEqual(counts, expected);
  assert.deepEqual(context.calls.find((call) => call.model === "product").args.select, {
    id: true,
    category: true,
    categoryId: true,
    catalogManaged: true,
  });
});

test("product summaries preserve displayed values without fetching full descriptions", async () => {
  const snapshot = server.getSnapshotProducts()[0];
  reset({
    products: [
      {
        ...snapshot,
        featured: false,
        published: true,
        catalogManaged: false,
        category: "pos",
        categoryId: null,
        updatedAt: new Date(),
      },
      {
        ...snapshot,
        id: "managed-summary",
        featured: true,
        published: false,
        catalogManaged: true,
        categoryId: "food",
        updatedAt: new Date(),
      },
    ],
  });
  const summaries = await render(() => server.listAdminProductSummaries());
  const full = await render(() => server.listAdminProducts());
  for (const summary of summaries) {
    const original = full.find((row) => row.id === summary.id);
    for (const key of Object.keys(summary)) assert.deepEqual(summary[key], original[key], key);
  }
  const query = context.calls.find((call) => call.model === "product");
  assert.equal(query.args.select.description, undefined);
  assert.equal(query.args.select.capacity, undefined);
  assert.equal(query.args.select.id, true);
  assert.equal(summaries.length, full.length);
});
