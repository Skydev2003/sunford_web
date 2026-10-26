import "server-only";
import { categories } from "@/features/catalog/types";
import { getDocuments } from "./documents";
import type { Category } from "../types";

export async function getCategories(): Promise<Category[]> {
  const overrides = await getDocuments("category");
  const originals: Category[] = categories.map((category) => ({ ...category }));
  return originals
    .filter(
      (category) => !overrides.some((row) => row.id === `category:${category.id}` && row.deletedAt),
    )
    .map((category) => {
      const row = overrides.find((row) => row.id === `category:${category.id}`);
      return row
        ? { id: category.id, label: String(row.data.label), english: String(row.data.english) }
        : category;
    })
    .concat(
      overrides
        .filter(
          (row) =>
            !row.deletedAt && !originals.some((category) => row.id === `category:${category.id}`),
        )
        .map((row) => ({
          id: row.id.slice(9),
          label: String(row.data.label),
          english: String(row.data.english),
        })),
    );
}
