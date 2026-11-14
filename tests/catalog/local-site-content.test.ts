import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";

async function localModule(entry: string) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: "node",
    format: "cjs",
    plugins: [
      {
        name: "reject-cms-access",
        setup(builder) {
          builder.onResolve(
            {
              filter:
                /^(server-only|next\/cache|@\/lib\/(prisma|env)|@\/features\/services\/(?:warehouse-product.server|warehouse-postgres))$/,
            },
            ({ path }) => ({ path, namespace: "fixture" }),
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            loader: "js",
            contents:
              path === "server-only"
                ? "export {};"
                : path === "next/cache"
                  ? "export const cacheLife=()=>{}, cacheTag=()=>{};"
                  : path === "@/lib/env"
                    ? "export const hasDatabase=()=>true;"
                    : path === "@/lib/prisma"
                      ? "export const getPrisma=()=>{throw Error('Legacy CMS database accessed')};"
                      : "export const getOfficialProducts=async()=>({items:[{sku:'G106308',product_name:'Warehouse source',unit:'เครื่อง',sale_price:100,image_url:'/image?v=current'}],facts:[{sku:'G106308',title:'พิกัดชั่งสูงสุด',value_text:null,value_number:'100',unit:'kg'}],components:[{root_sku:'G106308',sku:'PART',quantity:'2'}],readAt:'2026-11-11T00:00:00Z'}); export const savedWarehouseImage=()=>null; export const readWarehouseCardFacts=async()=>{throw Error('Unexpected separate fact read')}; export const readWarehouseComponents=async()=>{throw Error('Unexpected separate component read')};",
          }));
        },
      },
    ],
  });
  const context = {
    module: { exports: {} },
    process: { env: { DATABASE_URL: "postgresql://unused.invalid/cms" } },
    console,
    URL,
  };
  runInNewContext(result.outputFiles[0].text, context);
  return context.module.exports as {
    getSettings: <T>(id: string, defaults: T) => Promise<T>;
    getDocuments: (kind: string) => Promise<{ id: string; data: Record<string, unknown> }[]>;
    getCurrentProducts: () => Promise<{
      products: {
        warehouseSku: string;
        warehouseName: string;
        name: string;
        price: number;
        image: string;
        fallbackImage?: string;
        warehouseSpecifications?: { label: string; value: string }[];
        warehouseComponents?: { sku: string; quantity: number }[];
      }[];
    }>;
  };
}

test("site settings are preserved locally even when a legacy CMS URL is configured", async () => {
  const site = await localModule("src/features/site/server/documents.ts");
  const settings = await site.getSettings("site", { name: "SUNFORD", logo: "missing" });
  assert.equal(settings.logo, "/images/sunford-logo.png");
  const documents = await site.getDocuments("settings");
  assert.equal(new Set(documents.map((row) => row.id)).size, documents.length);
  assert(documents.some((row) => row.id === "navigation"));
  assert.deepEqual(await site.getSettings("unconfigured-section", { retained: true }), {
    retained: true,
  });
});

test("the product repository uses Warehouse prices and local content without any CMS access", async () => {
  const repository = await localModule("src/features/catalog/server/product-repository.ts");
  const { products } = await repository.getCurrentProducts();
  assert.equal(products.length, 1);
  assert.equal(products[0].warehouseSku, "G106308");
  assert.equal(products[0].name, "Warehouse source");
  assert.equal(products[0].warehouseName, "Warehouse source");
  assert.equal(products[0].price, 100);
  assert.match(products[0].image, /^\/api\/products\/G106308\/image\?v=current$/);
  assert.equal(products[0].fallbackImage, undefined);
  assert.equal(products[0].warehouseSpecifications?.length, 1);
  assert.equal(products[0].warehouseSpecifications?.[0].label, "พิกัดชั่งสูงสุด");
  assert.equal(products[0].warehouseSpecifications?.[0].value, "100 kg");
  assert.equal(products[0].warehouseComponents?.length, 1);
  assert.equal(products[0].warehouseComponents?.[0].sku, "PART");
  assert.equal(products[0].warehouseComponents?.[0].quantity, 2);
});
