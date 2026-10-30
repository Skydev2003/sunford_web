import "server-only";
import sources from "@/features/content/data/products.json";
import { classifyProductTopics } from "../data/product-topics";
import type { Product } from "../types";

export function attachProductTopics(products: Product[]): Product[] {
  return products.map((product) => {
    const source = sources.find(
      (source) => source.sourceId === product.sourceId || source.sourceUrl === product.sourceUrl,
    );
    return {
      ...product,
      topics: classifyProductTopics(
        product,
        source?.collections?.map((c) => c.path) ?? [],
        source ? `${source.description} ${source.details}` : "",
      ),
    };
  });
}
