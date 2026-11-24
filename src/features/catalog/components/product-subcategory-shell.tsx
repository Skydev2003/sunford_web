"use client";

import { createContext, useContext, type ComponentProps, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useReturnState } from "@/features/site/history/return-state";
import { sunford } from "@/features/home/data/brand";
import { getProductSubcategoryPageByHref } from "../data/product-subcategory-pages";
import { productListingAnchor } from "../data/catalog-submenu-destinations";
import { CatalogSearchField } from "./catalog-search-field";
import { ProductSubcategoryNavigation } from "./product-subcategory-navigation";
import { useCatalogAnchor } from "./use-catalog-anchor";
import overview from "./products-overview.module.css";
import styles from "./product-directory.module.css";

const ListingSearchContext = createContext<{
  query: string;
  revision: number;
  setQuery: (query: string) => void;
} | null>(null);

export const useListingSearch = () => useContext(ListingSearchContext);

export function ProductSubcategoryShell({
  categoryId,
  categoryLabel,
  navigationItems,
  children,
}: {
  categoryId: string;
  categoryLabel: string;
  navigationItems: ComponentProps<typeof ProductSubcategoryNavigation>["items"];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const definition = getProductSubcategoryPageByHref(pathname);
  const anchor = productListingAnchor(categoryId);
  useCatalogAnchor(anchor);
  const [search, setSearch] = useReturnState("product-subcategory.search", {
    query: "",
    revision: 0,
  });
  if (!definition || definition.categoryId !== categoryId) return children;

  const setQuery = (query: string) => setSearch({ query, revision: search.revision + 1 });
  const scales = categoryId === "scales";
  const titleId = `${scales ? "" : `${categoryId}-`}${definition.slug}-title`;
  const hasCategoryPrefix = definition.title === `${categoryLabel} ${definition.label}`;
  return (
    <main
      id="main-content"
      className={`${overview.overview} ${overview.categoryEntrance}`}
      data-product-subcategory-page={definition.id}
      data-scale-subcategory-page={scales ? definition.id : undefined}
      data-indicator-subcategory-page={categoryId === "indicators" ? definition.id : undefined}
      data-industrial-scales-page={definition.id === "scale-industrial" || undefined}
    >
      <div className={overview.ribbon}>
        ปรึกษาผู้เชี่ยวชาญ เลือกให้ตรงกับงานของคุณ{" "}
        <Link href={sunford.contact}>ให้เราช่วยเลือก ›</Link>
      </div>
      <nav className={`${overview.sectionInner} ${styles.breadcrumb}`} aria-label="เส้นทางนำทาง">
        <Link href="/products">ผลิตภัณฑ์ทั้งหมด</Link>
        <Link href={`/products/category/${categoryId}`}>{categoryLabel}</Link>
        <span aria-current="page">{definition.label.replace(/^เครื่องชั่ง/, "")}</span>
      </nav>
      <header className={`${overview.sectionInner} ${styles.listingHeader}`}>
        <h1 id={titleId}>
          {hasCategoryPrefix ? (
            <>
              <span>{categoryLabel}</span> <span>{definition.label}</span>
            </>
          ) : (
            definition.title
          )}
        </h1>
      </header>
      <div className={`${overview.sectionInner} ${styles.listingControls}`}>
        <CatalogSearchField value={search.query} onChange={setQuery} />
        <ProductSubcategoryNavigation items={navigationItems} currentHref={definition.href} />
      </div>
      <ListingSearchContext.Provider value={{ ...search, setQuery }}>
        <div id={anchor} tabIndex={-1}>
          {children}
        </div>
      </ListingSearchContext.Provider>
    </main>
  );
}
