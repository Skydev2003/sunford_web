import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import type { ProductCategorySlug } from "../data/category-paths";
import { productSubcategoryPages } from "../data/product-subcategory-pages";
import { primaryScaleGroups } from "../data/scale-subcategory-pages";
import { ProductSubcategoryLayout, ProductSubcategoryPage } from "./product-subcategory-page";
import styles from "./product-directory.module.css";
import overview from "./products-overview.module.css";

type Props = {
  params: Promise<{ group: string }>;
  searchParams: Promise<{ feature?: string | string[] }>;
};

export function categoryListingRoute(categoryId: ProductCategorySlug) {
  const pages = productSubcategoryPages.filter((page) => page.categoryId === categoryId);
  const getDefinition = async (params: Props["params"]) => {
    const { group } = await params;
    return pages.find(({ slug }) => slug === group);
  };

  async function ListingContent({ params, searchParams }: Props) {
    const definition = await getDefinition(params);
    if (!definition) notFound();
    const { feature } = await searchParams;
    return (
      <ProductSubcategoryPage
        categoryId={categoryId}
        subcategoryId={definition.id}
        initialFeature={typeof feature === "string" ? feature : undefined}
      />
    );
  }

  return {
    generateStaticParams: () =>
      pages
        .filter(({ slug }) => categoryId !== "scales" || !primaryScaleGroups.includes(slug))
        .map(({ slug }) => ({ group: slug })),
    async generateMetadata({ params }: Props): Promise<Metadata> {
      const definition = await getDefinition(params);
      if (!definition) return { title: "ไม่พบข้อมูล" };
      return {
        title: definition.title,
        alternates: { canonical: `https://sunford-web.vercel.app${definition.href}` },
      };
    },
    Page(props: Props) {
      return (
        <Suspense
          fallback={
            <p role="status" className={`${overview.sectionInner} ${styles.listingLoading}`}>
              กำลังโหลดรายการสินค้า…
            </p>
          }
        >
          <ListingContent {...props} />
        </Suspense>
      );
    },
  };
}

export function primaryScaleListingRoute(group: string) {
  const route = categoryListingRoute("scales");
  const params = Promise.resolve({ group });
  return {
    generateMetadata: () => route.generateMetadata({ params, searchParams: Promise.resolve({}) }),
    Page({ searchParams }: { searchParams: Props["searchParams"] }) {
      return <route.Page params={params} searchParams={searchParams} />;
    },
  };
}

export function CategoryListingLayout({
  categoryId,
  children,
}: {
  categoryId: ProductCategorySlug;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <ProductSubcategoryLayout categoryId={categoryId}>{children}</ProductSubcategoryLayout>
    </Suspense>
  );
}
