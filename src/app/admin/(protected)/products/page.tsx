import { AdminProductList } from "@/features/admin/components/product-list";
import { listAdminProducts } from "@/features/admin/server/products";
export const instant = false;
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  return (
    <AdminProductList
      products={await listAdminProducts()}
      saved={(await searchParams).saved === "1"}
    />
  );
}
