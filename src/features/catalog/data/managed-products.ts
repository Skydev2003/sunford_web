import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import type { Product } from "../types";

const snapshots = new Map(getSnapshotProducts().map((product) => [product.id, product]));

export function resolveManagedCategory(row: {
  id: string;
  category: string;
  categoryId?: string | null;
  catalogManaged: boolean;
}) {
  return (
    row.categoryId ??
    (!row.catalogManaged ? snapshots.get(row.id)?.category : undefined) ??
    row.category
  );
}

// Preserve the current public presentation of the six legacy seed records without
// overwriting their stored values. An explicit admin save takes ownership thereafter.
export function resolveManagedProduct<
  T extends Pick<Product, "id" | "image" | "category"> & {
    catalogManaged: boolean;
    categoryId?: string | null;
  },
>(row: T): T & Partial<Product> {
  const snapshot = snapshots.get(row.id);
  const resolved = !snapshot
    ? row
    : row.catalogManaged
      ? { ...snapshot, ...row, imageOverridden: row.image !== snapshot.image }
      : { ...row, ...snapshot, imageOverridden: false };
  return { ...resolved, category: row.categoryId ?? resolved.category };
}
