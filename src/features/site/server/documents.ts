import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import documents from "../../../../data/site/content.json";
import type { ContentData, SiteDocument } from "../types";
import { publicContent } from "@/features/content/data/public-paths.mjs";

export async function getDocuments(kind: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("site-content");
  return (documents as unknown as SiteDocument[])
    .filter((row) => row.kind === kind)
    .map((row) => ({
      ...row,
      data: publicContent(row.data) as ContentData,
      deletedAt: row.deletedAt ?? null,
    }));
}
export async function getSettings<T>(id: string, defaults: T): Promise<T> {
  const row = (await getDocuments("settings")).find((row) => row.id === id && !row.deletedAt);
  return row ? ({ ...defaults, ...row.data } as T) : defaults;
}
