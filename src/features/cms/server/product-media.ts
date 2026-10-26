import "server-only";
import type { Product } from "@/features/catalog/types";
import type { ProductMedia } from "../types";
import { importedPages, getSourceProduct } from "@/features/content/server/content-repository";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { productPresentation } from "@/features/catalog/data/product-presentation";
export function productMediaDefaults(product: Product): ProductMedia {
  const snapshot = getSnapshotProducts().find((row) => row.id === product.id);
  const source = getSourceProduct(product.sourceId ?? snapshot?.sourceId ?? product.slug);
  const presentation = productPresentation(product, snapshot, source);
  return {
    price: product.price ?? source?.price ?? snapshot?.price ?? null,
    gallery: presentation.images.map((image) => ({ image })),
    descriptionHtml:
      presentation.descriptionHtml ??
      `<p>${product.description.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>`,
    detailsHtml: source?.detailsHtml ?? "",
    specifications: presentation.specifications,
    videos: importedPages.find((page) => page.path === source?.path)?.videos ?? [],
  };
}
