import "server-only";
import sourceProducts from "../data/products.json";
import sourcePages from "../data/pages.json";
import type { SourcePage, SourceProduct } from "../types";
import { products as curated } from "@/features/catalog/data/products";
import { productSources } from "@/features/catalog/data/product-sources";

export { getSnapshotProducts } from "../data/catalog-snapshot";

export const importedProducts = sourceProducts as SourceProduct[];
export const importedPages = sourcePages as SourcePage[];
const normalize = (value: string) => decodeURIComponent(value).replace(/\/$/, "").toLowerCase();

export function getContentPage(path: string) {
  const aliases: Record<string, string> = {
    "/product/เครื่องชั่ง": "/Product/Digital-weighing",
    "/product/ระบบชั่งควบคุมการผลิต": "/Product/MES",
    "/product/pos-เชื่อมต่อเครื่องชั่ง": "/Product/POS",
  };
  const target = aliases[normalize(path)] ?? path;
  return importedPages.find((page) => normalize(page.path) === normalize(target));
}

export function getSourceProduct(slug: string) {
  const seed = curated.find((product) => product.slug === slug || product.id === slug);
  const sourceId = seed && productSources[seed.id]?.split("/").at(-1);
  return importedProducts.find(
    (product) => product.sourceId.toLowerCase() === (sourceId ?? slug).toLowerCase(),
  );
}

export function getPageSearchIndex() {
  return importedPages
    .filter((page) => page.kind !== "product" && page.path !== "/")
    .map(({ path, title, kind }) => ({ path, title, kind }));
}
