import { productCategoryPath } from "../data/category-paths";
import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getProductCategories } from "@/features/catalog/server/product-categories";
import { getStorefrontProducts } from "@/features/catalog/server/product-repository";
import { warehouseBlurDataURL } from "@/features/catalog/server/warehouse-image-previews";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { getPrimaryNavigationItems } from "@/features/site/data/primary-navigation";
import { getSettings } from "@/features/site/server/documents";
import { buyingGuideHref } from "@/features/content/data/buying-guides";
import { ProductCategoryMock } from "./product-category-mock";
import { ProductSubcategoryShell } from "./product-subcategory-shell";
import { chapterArtwork } from "../data/category-chapter-artwork";
import {
  getProductSubcategoryPage,
  getProductSubcategoryPageByHref,
  platformPlacementPages,
  resolveListingSubcategory,
} from "../data/product-subcategory-pages";
import { consumableSubtypeLinks } from "../data/additional-subcategory-pages";
import { getProductListingFeatures } from "../data/product-listing-features";
import { posPlatformLabels } from "../data/pos-subcategories";
import { sunford } from "@/features/home/data/brand";
import overview from "./products-overview.module.css";
import styles from "./product-directory.module.css";

const alternatives: Record<string, readonly { href: string; label: string }[]> = {
  "platform-abs": platformPlacementPages,
  "pos-ios": [
    { href: "/pos/android", label: `ระบบ POS ${posPlatformLabels.android}` },
    { href: "/pos/windows", label: `ระบบ POS ${posPlatformLabels.windows}` },
  ],
};

export async function ProductSubcategoryLayout({
  categoryId,
  children,
}: {
  categoryId: string;
  children: ReactNode;
}) {
  const [{ products, categories, readySubcategoryHrefs }, navigation] = await Promise.all([
    getProductCategories(),
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
  ]);
  const category = categories.find((item) => item.id === categoryId);
  if (!category) notFound();
  const categoryHref = productCategoryPath(categoryId);
  const categoryMenu = getPrimaryNavigationItems(
    resolveNavigationItems(navigation.items),
    readySubcategoryHrefs,
    "category-chapters",
  ).find(({ href }) => href === categoryHref);
  const chapterLinks = (categoryMenu?.links ?? []).filter(({ disabled }) => !disabled);
  const productsById = new Map(products.map((product) => [product.id, product]));
  const navigationItems = chapterLinks.map(({ href, label }) => {
    const destination = getProductSubcategoryPageByHref(href);
    const group = category.subcategories.find(({ id }) => id === destination?.id);
    const members = (group?.productIds ?? [])
      .map((id) => productsById.get(id))
      .filter((product) => product?.image || product?.fallbackImage);
    const photo = members.find((product) => product?.featured) ?? members[0];
    const artwork = chapterArtwork.get(href);
    return {
      href,
      label,
      image: artwork ?? (photo?.image || photo?.fallbackImage),
      fallbackImage: (artwork && photo?.image) || photo?.fallbackImage,
    };
  });
  return (
    <ProductSubcategoryShell
      categoryId={categoryId}
      categoryLabel={category.label}
      navigationItems={navigationItems}
    >
      {children}
    </ProductSubcategoryShell>
  );
}

export async function ProductSubcategoryPage({
  categoryId,
  subcategoryId,
  initialFeature,
}: {
  categoryId: string;
  subcategoryId: string;
  initialFeature?: string;
}) {
  const definition = getProductSubcategoryPage(subcategoryId, categoryId);
  if (!definition) notFound();
  const additional = "matches" in definition ? definition : undefined;
  const [{ products, categories, cardNames }, warehouseProducts] = await Promise.all([
    getProductCategories(),
    getStorefrontProducts(),
  ]);
  const category = categories.find((item) => item.id === categoryId);
  if (!category) notFound();
  const child = resolveListingSubcategory(definition, category, warehouseProducts);
  if (!child) notFound();
  const ids = new Set(child.productIds);
  const listingCategory = additional ? { ...category, subcategories: [child] } : category;
  const publishedProducts = products.filter(
    (product) => product.warehouseSku && ids.has(product.id),
  );
  const listingFeatures = getProductListingFeatures(
    categoryId,
    subcategoryId,
    warehouseProducts.filter(({ id, warehouseSku }) => warehouseSku && ids.has(id)),
  );
  const linkedFeature = listingFeatures.find(({ id }) => id === initialFeature)?.id;
  const initialIds =
    "entries" in child && child.entries
      ? child.entries.slice(0, 6).map(({ productId }) => productId)
      : [...publishedProducts]
          .sort((a, b) => Number(b.featured) - Number(a.featured))
          .slice(0, 6)
          .map(({ id }) => id);
  const imagePreviews = Object.fromEntries(
    publishedProducts.flatMap(({ id, image }) => {
      if (!initialIds.includes(id)) return [];
      const preview = warehouseBlurDataURL(image);
      return preview ? [[image, preview]] : [];
    }),
  );
  const relatedLinks =
    additional?.relatedLinks ??
    (subcategoryId === "accessory-consumables"
      ? consumableSubtypeLinks
      : (alternatives[subcategoryId] ?? []));
  const categoryHref = productCategoryPath(categoryId);
  const guideHref = buyingGuideHref(categoryId);
  return (
    <>
      <div className={`${overview.sectionInner} ${styles.listing}`}>
        {publishedProducts.length ? (
          <ProductCategoryMock
            key={`${subcategoryId}:${linkedFeature ?? ""}`}
            products={publishedProducts}
            categories={[listingCategory]}
            cardNames={cardNames}
            imagePreviews={imagePreviews}
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            presentation="listing"
            listingFeatures={listingFeatures}
            initialFeature={linkedFeature}
          />
        ) : (
          <section aria-labelledby="subcategory-status-title" data-subcategory-empty>
            <h2 id="subcategory-status-title">ยังไม่มีรายการสินค้าที่เผยแพร่ในหมวดนี้</h2>
            <p>สำรวจรุ่นในหมวดที่เกี่ยวข้องด้านล่าง หรือติดต่อซันฟอร์ดเพื่อสอบถามข้อมูลเพิ่มเติม</p>
          </section>
        )}
      </div>
      <nav
        className={`${overview.sectionInner} ${styles.related}`}
        aria-label="ข้อมูลที่เกี่ยวข้อง"
      >
        <Link href={categoryHref}>ดู{category.label}ทุกกลุ่ม ›</Link>
        <Link href={guideHref}>คู่มือเลือก{category.label} ›</Link>
        {relatedLinks
          .filter(({ href }) => href !== guideHref)
          .map(({ href, label }) => (
            <Link key={href} href={href}>
              {label} ›
            </Link>
          ))}
        <Link href={sunford.contact}>ปรึกษาผู้เชี่ยวชาญ ›</Link>
      </nav>
    </>
  );
}
