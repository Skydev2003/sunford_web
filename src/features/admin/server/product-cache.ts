import "server-only";
import { revalidatePath, updateTag } from "next/cache";

export function invalidateProducts(...slugs: string[]) {
  updateTag("products");
  updateTag("cms");
  revalidatePath("/", "page");
  revalidatePath("/products");
  revalidatePath("/api/products");
  revalidatePath("/(site)/[...path]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin/products/new");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/trash");
  revalidatePath("/admin/audit");
  slugs.forEach((slug) => revalidatePath(`/products/${slug}`));
}
