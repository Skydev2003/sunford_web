import type { Product } from "../types";
import { catalogProductGroup } from "./catalog-supplements";

/** Candidates must already be published by the caller. Preserve their curated order. */
export function relatedProducts(product: Product, candidates: readonly Product[]): Product[] {
  const group = catalogProductGroup(product);
  if (!group) return [];
  const ids = new Set([product.id]);
  const slugs = new Set([product.slug]);
  const selected: Product[] = [];
  for (const candidate of candidates) {
    if (
      ids.has(candidate.id) ||
      slugs.has(candidate.slug) ||
      catalogProductGroup(candidate) !== group
    )
      continue;
    ids.add(candidate.id);
    slugs.add(candidate.slug);
    selected.push(candidate);
    if (selected.length === 3) break;
  }
  return selected;
}
