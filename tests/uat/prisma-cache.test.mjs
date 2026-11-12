import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { build } from "esbuild";

test("Prisma cache replaces an old client after generation and reuses unchanged clients", async () => {
  const result = await build({
    entryPoints: ["src/lib/prisma.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins: [
      {
        name: "database-runtime-fixture",
        setup(builder) {
          builder.onResolve(
            { filter: /^(server-only|@\/generated\/prisma\/client|@prisma\/adapter-pg)$/ },
            ({ path }) => ({ path, namespace: "fixture" }),
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            contents:
              path === "server-only"
                ? "export {};"
                : path === "@prisma/adapter-pg"
                  ? "export class PrismaPg { constructor(config, options={}) { this.connectionString=config.connectionString; this.schema=options.schema; } }"
                  : "export const PrismaClient = globalThis.currentClientConstructor;",
            loader: "js",
          }));
        },
      },
    ],
  });
  let legacyDisconnects = 0;
  let disconnects = 0;
  let created = 0;
  const legacy = {
    $disconnect: async () => {
      legacyDisconnects++;
    },
  };
  class CurrentClient {
    constructor(options) {
      created++;
      this.adapter = options.adapter;
    }
    cmsDocument = { findMany: async () => [{ id: "hero" }] };
    async $disconnect() {
      disconnects++;
    }
  }
  const context = createContext({
    prisma: legacy,
    currentClientConstructor: CurrentClient,
    process: {
      env: {
        DATABASE_URL: "postgresql://old:unused@old.invalid/postgres",
        QUOTATION_DATABASE_URL: "postgresql://writer:secret@warehouse.invalid/warehouse_db",
      },
    },
    console,
  });
  const loadModule = () =>
    runInContext(
      `(() => {
    const module = { exports: {} };
    ${result.outputFiles[0].text}
    return module.exports;
  })()`,
      context,
    );

  const firstModule = loadModule();
  const current = firstModule.getPrisma();
  assert.notEqual(current, legacy, "a cached client without the CMS model must be discarded");
  assert.deepEqual(await current.cmsDocument.findMany(), [{ id: "hero" }]);
  assert.equal(legacyDisconnects, 1);
  assert.equal(firstModule.getPrisma(), current);
  assert.equal(loadModule().getPrisma(), current, "unrelated module reloads must keep the pool");
  assert.equal(created, 1);
  assert.equal(
    current.adapter.connectionString,
    "postgresql://writer:secret@warehouse.invalid/warehouse_db",
  );
  assert.equal(current.adapter.schema, "ecommerce");

  context.currentClientConstructor = class RegeneratedClient extends CurrentClient {};
  const nextModule = loadModule();
  const regenerated = nextModule.getPrisma();
  assert.notEqual(regenerated, current, "regenerating the client must replace the pool");
  assert.equal(disconnects, 1);
  assert.equal(created, 2);
  assert.equal(nextModule.getPrisma(), regenerated);
  assert.deepEqual(await regenerated.cmsDocument.findMany(), [{ id: "hero" }]);
  context.process.env.QUOTATION_DATABASE_URL =
    "postgresql://writer:secret@replacement.invalid/warehouse_db";
  const replacement = nextModule.getPrisma();
  assert.notEqual(replacement, regenerated, "a connection change must discard the old pool");
  assert.equal(replacement.adapter.connectionString, context.process.env.QUOTATION_DATABASE_URL);
  assert.equal(created, 3);
  assert.equal(disconnects, 2);
  delete context.process.env.QUOTATION_DATABASE_URL;
  assert.throws(() => nextModule.getPrisma(), /QUOTATION_DATABASE_URL/);
});

test("legacy CMS credentials alone never enable the quotation registry", async () => {
  const result = await build({
    entryPoints: ["src/lib/env.ts"],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
  });
  const context = createContext({
    module: { exports: {} },
    process: { env: { DATABASE_URL: "postgresql://old:unused@old.invalid/postgres" } },
  });
  runInContext(result.outputFiles[0].text, context);
  assert.equal(context.module.exports.hasDatabase(), false);
  context.process.env.QUOTATION_DATABASE_URL =
    "postgresql://writer:secret@warehouse.invalid/warehouse_db";
  assert.equal(context.module.exports.hasDatabase(), true);
  context.process.env.QUOTATION_DATABASE_URL = " ";
  assert.equal(context.module.exports.hasDatabase(), false);
});
