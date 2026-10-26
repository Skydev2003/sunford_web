import { ProductForm } from "@/features/admin/components/product-form";
import { requireAdmin } from "@/features/admin/server/auth";
export const instant = false;
export default async function NewProductPage() {
  await requireAdmin();
  return <ProductForm />;
}
