import { Suspense, type ReactNode } from "react";
import { ProductSubcategoryLayout } from "@/features/catalog/components/product-subcategory-page";
import { SiteLoading } from "@/features/site/components/site-loading";

type Props = { params: Promise<{ category: string }>; children: ReactNode };

async function ListingLayoutContent({ params, children }: Props) {
  const { category } = await params;
  return <ProductSubcategoryLayout categoryId={category}>{children}</ProductSubcategoryLayout>;
}

export default function ListingLayout(props: Props) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <ListingLayoutContent {...props} />
    </Suspense>
  );
}
