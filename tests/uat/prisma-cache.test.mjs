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
                  ? "export class PrismaPg {}"
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
    constructor() {
      created++;
    }
    cmsDocument = { findMany: async () => [{ id: "hero" }] };
    async $disconnect() {
      disconnects++;
    }
  }
  const context = createContext({
    prisma: legacy,
    currentClientConstructor: CurrentClient,
    process: { env: { DATABASE_URL: "postgresql://local.invalid/test" } },
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

  context.currentClientConstructor = class RegeneratedClient extends CurrentClient {};
  const nextModule = loadModule();
  const regenerated = nextModule.getPrisma();
  assert.notEqual(regenerated, current, "regenerating the client must replace the pool");
  assert.equal(disconnects, 1);
  assert.equal(created, 2);
  assert.equal(nextModule.getPrisma(), regenerated);
  assert.deepEqual(await regenerated.cmsDocument.findMany(), [{ id: "hero" }]);
});
