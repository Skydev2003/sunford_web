import { notFound } from "next/navigation";
import { ProductForm } from "@/features/admin/components/product-form";
import { getAdminProduct } from "@/features/admin/server/products";
export const instant = false;
export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const product = await getAdminProduct((await params).id);
  if (!product) notFound();
  return <ProductForm key={`${product.id}:${product.updatedAt}`} product={product} />;
}
