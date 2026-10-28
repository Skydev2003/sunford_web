import type { getEditor } from "@/features/cms/server/editors";
import type { AdminProduct } from "./types";

export type AdminDetailModel =
  | { kind: "product"; product?: AdminProduct }
  | { kind: "content"; editor: NonNullable<Awaited<ReturnType<typeof getEditor>>> };

export type AdminDetailHandle = { cancel: () => Promise<boolean> | boolean };
