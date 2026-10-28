import { z } from "zod";
import { versionSchema } from "./validation";

const items = z
  .array(versionSchema)
  .min(1)
  .max(5000)
  .refine((rows) => new Set(rows.map((row) => row.id)).size === rows.length, "รายการสินค้าซ้ำกัน");
const changes = z
  .strictObject({
    published: z.boolean().optional(),
    featured: z.boolean().optional(),
    sortOrder: z.number().int().min(0).max(99999).optional(),
  })
  .refine((value) => Object.keys(value).length > 0);

export const productTableSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("update"),
    items: items.refine((rows) => rows.length === 1),
    changes,
  }),
  z.strictObject({ type: z.enum(["hide", "publish", "delete"]), items }),
  z.strictObject({ type: z.literal("category"), items, categoryId: z.string().min(1).max(100) }),
  z.strictObject({ type: z.literal("reorder"), items }),
]);

export type ProductTableCommand = z.infer<typeof productTableSchema>;
