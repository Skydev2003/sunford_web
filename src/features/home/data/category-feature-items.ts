import { load } from "cheerio";
import type { Product } from "@/features/catalog/types";
import type { SourcePage } from "@/features/content/types";

export type CategoryFeatureEntry = {
  id: string;
  title: string;
  image: string;
  fallbackImage?: string;
  href: string;
};

export function productFeatureEntries(products: Product[]): CategoryFeatureEntry[] {
  return products
    .filter((product) => product.image)
    .map((product) => ({
      id: product.id,
      title: product.name,
      image: product.image,
      fallbackImage: product.fallbackImage,
      href: `/products/${product.slug}`,
    }));
}

export function pageFeatureEntries(
  page: SourcePage | undefined,
  products: Product[],
): CategoryFeatureEntry[] {
  if (!page) return [];
  const ids = new Set(page.productIds ?? []);
  const handles = new Set(page.productHandles);
  const members = products.filter(
    (product) => ids.has(product.id) || handles.has(product.sourceId ?? ""),
  );
  if (ids.size || handles.size) return productFeatureEntries(members);

  // Software landing pages contain solution cards rather than catalogue products.
  const $ = load(page.html);
  const entries = new Map<string, CategoryFeatureEntry>();
  $("a[href]").each((_, element) => {
    const card = $(element).parent().parent();
    const title = card.find("h2").first().text().trim();
    const image = card.find("img").first().attr("src");
    const href = $(element).attr("href");
    const local = (value: string) =>
      value.startsWith("/") &&
      !value.startsWith("//") &&
      !/[\\\r\n]/.test(value) &&
      !/^\/(admin|api)(\/|$)/i.test(value);
    if (title && image && href && local(image) && local(href))
      entries.set(href, { id: href, title, image, href });
  });
  return [...entries.values()];
}
