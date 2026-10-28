import type { Product } from "@/features/catalog/types";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};
export type AdminProduct = {
  id: string;
  slug: string;
  name: string;
  category: Product["category"];
  subtitle: string;
  description: string;
  image: string;
  capacity: string;
  readability: string;
  connection: string;
  badge: string | null;
  featured: boolean;
  published: boolean;
  sortOrder: number;
  updatedAt: string;
  gallery?: string[];
};

export type AdminProductSummary = Pick<
  AdminProduct,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "image"
  | "featured"
  | "published"
  | "sortOrder"
  | "updatedAt"
>;
