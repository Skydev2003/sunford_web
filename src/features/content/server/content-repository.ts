import "server-only";
import sourceProducts from "../data/products.json";
import sourcePages from "../data/pages.json";
import type { SourcePage, SourceProduct } from "../types";
import { products as curated } from "@/features/catalog/data/products";
import { productSources } from "@/features/catalog/data/product-sources";
import { getDocuments } from "@/features/cms/server/documents";
import { publicPath } from "../data/public-paths.mjs";

export { getSnapshotProducts } from "../data/catalog-snapshot";

export const importedProducts = sourceProducts as SourceProduct[];
export const importedPages = sourcePages as SourcePage[];
const normalize = (value: string) => publicPath(value).replace(/\/$/, "").toLowerCase();

function mergePages(documents: Awaited<ReturnType<typeof getDocuments>>): SourcePage[] {
  const visible = documents.filter((row) => !row.deletedAt && row.data.published !== false);
  const originals = importedPages.filter(
    (page) =>
      !documents.some(
        (row) =>
          row.data.sourcePath && normalize(String(row.data.sourcePath)) === normalize(page.path),
      ),
  );
  const edited = visible.map((row): SourcePage => {
    const data = row.data;
    const original = importedPages.find((page) => page.path === data.sourcePath);
    const images = (data.images as { image: string }[]).map((image) => image.image);
    return {
      ...original,
      path: String(data.path),
      title: String(data.title),
      kind: data.kind as SourcePage["kind"],
      sourceUrl: original?.sourceUrl ?? String(data.path),
      html: String(data.html),
      text: String(data.html).replace(/<[^>]*>/g, " "),
      images,
      videos: data.videos as SourcePage["videos"],
      productIds: (data.productIds as { id: string }[]).map((product) => product.id),
      productHandles: [],
      collectionIds: original?.collectionIds ?? [],
      hasSourcePlaceholder: false,
      managed: true,
    };
  });
  return [
    ...edited.sort(
      (a, b) =>
        Number(visible.find((row) => row.data.path === a.path)?.data.order ?? 0) -
        Number(visible.find((row) => row.data.path === b.path)?.data.order ?? 0),
    ),
    ...originals,
  ];
}
export async function getContentPages(): Promise<SourcePage[]> {
  return mergePages(await getDocuments("page"));
}
export async function getContentPageIndex(): Promise<Record<string, SourcePage>> {
  const documents = await getDocuments("page");
  const pages = mergePages(documents);
  const index: Record<string, SourcePage> = {};
  for (const page of pages) {
    const key = normalize(page.path);
    if (!index[key]) index[key] = page;
  }
  for (const document of documents) {
    if (document.deletedAt || document.data.published === false) continue;
    const page = index[normalize(String(document.data.path))];
    if (!page) continue;
    for (const alias of [
      String(document.data.sourcePath ?? ""),
      ...((document.data.aliases as string[] | undefined) ?? []),
    ])
      if (alias) index[normalize(alias)] = page;
  }
  const aliases: Record<string, string> = {
    "/product/scales": "/Product/Digital-weighing",
    "/product/production-weighing-systems": "/Product/MES",
    "/product/pos-scale-integration": "/Product/POS",
  };
  for (const [alias, target] of Object.entries(aliases))
    if (index[normalize(target)]) index[normalize(alias)] = index[normalize(target)];
  return index;
}
export async function getContentPage(path: string) {
  return (await getContentPageIndex())[normalize(path)] as SourcePage | undefined;
}

export function getSourceProduct(slug: string) {
  const seed = curated.find((product) => product.slug === slug || product.id === slug);
  const sourceId = seed && productSources[seed.id]?.split("/").at(-1);
  return importedProducts.find(
    (product) => product.sourceId.toLowerCase() === (sourceId ?? slug).toLowerCase(),
  );
}

export async function getPageSearchIndex() {
  return (await getContentPages())
    .filter((page) => page.kind !== "product" && page.path !== "/")
    .map(({ path, title }) => ({ path, title }));
}
