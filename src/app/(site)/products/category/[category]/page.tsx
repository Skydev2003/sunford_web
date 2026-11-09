import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productCategoryDefinitions } from "@/features/catalog/data/mock-categories";
import { getProductCategories } from "@/features/catalog/server/product-categories";
import { ProductCategoryMock } from "@/features/catalog/components/product-category-mock";
import { ScalesOverview } from "@/features/catalog/components/scales-overview";
import { IndicatorsOverview } from "@/features/catalog/components/indicators-overview";
import { PlatformsOverview } from "@/features/catalog/components/platforms-overview";
import { POSOverview } from "@/features/catalog/components/pos-overview";
import { AccessoriesOverview } from "@/features/catalog/components/accessories-overview";

type Props = { params: Promise<{ category: string }> };

export const ensureStatic = "navigation";

export function generateStaticParams() {
  return productCategoryDefinitions.map(({ id }) => ({ category: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const definition = productCategoryDefinitions.find(({ id }) => id === category);
  if (!definition) notFound();
  return { title: definition.label };
}

export default async function ProductCategoryPage({ params }: Props) {
  const { category: categoryId } = await params;
  if (!productCategoryDefinitions.some(({ id }) => id === categoryId)) notFound();
  if (categoryId === "scales") return <ScalesOverview />;
  if (categoryId === "indicators") return <IndicatorsOverview />;
  if (categoryId === "platforms") return <PlatformsOverview />;
  if (categoryId === "pos") return <POSOverview />;
  if (categoryId === "accessories") return <AccessoriesOverview />;
  const { products, categories, cardNames } = await getProductCategories();
  const category = categories.find(({ id }) => id === categoryId)!;
  const productIds = new Set(category.productIds);
  return (
    <main id="main-content">
      <ProductCategoryMock
        key={category.id}
        products={products.filter(({ id }) => productIds.has(id))}
        categories={[category]}
        cardNames={cardNames}
        categoryId={category.id}
        presentation="category"
      />
    </main>
  );
}
