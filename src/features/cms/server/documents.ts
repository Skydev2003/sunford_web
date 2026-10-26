import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { hasDatabase } from "@/lib/env";
import { getPrisma } from "@/lib/prisma";
import type { CmsData } from "../types";

export async function getDocuments(kind: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("cms");
  if (!hasDatabase()) return [];
  const rows = await getPrisma().cmsDocument.findMany({ where: { kind }, orderBy: { id: "asc" } });
  return rows.map((row) => ({
    ...row,
    data: row.data as CmsData,
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  }));
}
export async function getSettings<T>(id: string, defaults: T): Promise<T> {
  const row = (await getDocuments("settings")).find((row) => row.id === id && !row.deletedAt);
  return row ? ({ ...defaults, ...row.data } as T) : defaults;
}
