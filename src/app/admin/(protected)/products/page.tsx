import { AdminProductList } from "@/features/admin/components/product-list";
import { listAdminProductSummaries } from "@/features/admin/server/products";
export const instant = false;
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; category?: string | string[] }>;
}) {
  const params = await searchParams;
  const categoryId = typeof params.category === "string" ? params.category : undefined;
  return (
    <AdminProductList
      key={categoryId ?? "all"}
      products={await listAdminProductSummaries()}
      saved={params.saved === "1"}
      categoryId={categoryId}
    />
  );
}
