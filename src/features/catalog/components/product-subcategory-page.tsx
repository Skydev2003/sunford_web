import Link from "next/link";
import { cacheLife } from "next/cache";
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
import { ProductCategoryMock } from "./product-category-mock";
import { ProductSubcategoryNavigation } from "./product-subcategory-navigation";
import { chapterArtwork } from "../data/category-chapter-artwork";
import {
  getProductSubcategoryPage,
  getProductSubcategoryPageByHref,
} from "../data/product-subcategory-pages";
import { consumableSubtypeLinks } from "../data/additional-subcategory-pages";
import { sunford } from "@/features/home/data/brand";
import overview from "./products-overview.module.css";
import styles from "./product-directory.module.css";

const alternatives: Record<string, readonly { href: string; label: string }[]> = {
  "platform-abs": [
    { href: "/products/category/platforms/carbon-steel", label: "แท่นเหล็กคาร์บอน" },
    { href: "/products/category/platforms/sus304", label: "แท่นสแตนเลส SUS304" },
    { href: "/products/category/platforms/sus201", label: "แท่นสแตนเลส SUS201" },
  ],
  "pos-ios": [
    { href: "/products/category/pos/android", label: "ระบบ POS Android" },
    { href: "/products/category/pos/windows", label: "ระบบ POS Windows" },
  ],
};

export async function ProductSubcategoryPage({
  categoryId,
  subcategoryId,
}: {
  categoryId: string;
  subcategoryId: string;
}) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  const definition = getProductSubcategoryPage(subcategoryId, categoryId);
  if (!definition) notFound();
  const additional = "matches" in definition ? definition : undefined;
  const [
    { products, categories, cardNames, readySubcategoryHrefs },
    warehouseProducts,
    navigation,
  ] = await Promise.all([
    getProductCategories(),
    additional ? getStorefrontProducts() : [],
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
  ]);
  const category = categories.find((item) => item.id === categoryId);
  if (!category) notFound();
  const child = additional
    ? {
        id: additional.id,
        label: additional.label,
        productIds: warehouseProducts.filter(additional.matches).map(({ id }) => id),
      }
    : category.subcategories.find((item) => item.id === subcategoryId);
  if (!child) notFound();
  const categoryHref = `/products/category/${categoryId}`;
  const childLabel = child.label.replace(/^เครื่องชั่ง/, "");
  const categoryMenu = getPrimaryNavigationItems(
    resolveNavigationItems(navigation.items),
    readySubcategoryHrefs,
    "category-chapters",
  ).find(({ href }) => href === categoryHref);
  const chapterLinks = (categoryMenu?.links ?? []).filter(
    ({ href, disabled }) => !disabled || href === definition.href,
  );
  if (!chapterLinks.some(({ href }) => href === definition.href)) {
    chapterLinks.push({ href: definition.href, label: childLabel });
  }
  const productsById = new Map(products.map((product) => [product.id, product]));
  const navigationItems = chapterLinks.map(({ href, label }) => {
    const destination = getProductSubcategoryPageByHref(href);
    const group =
      href === definition.href
        ? child
        : category.subcategories.find(({ id }) => id === destination?.id);
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
  const listingNavigation = (
    <ProductSubcategoryNavigation items={navigationItems} currentHref={definition.href} />
  );
  const ids = new Set(child.productIds);
  const listingCategory = additional ? { ...category, subcategories: [child] } : category;
  const publishedProducts = products.filter(
    (product) => product.warehouseSku && ids.has(product.id),
  );
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
  const titleId = `${categoryId === "scales" ? "" : `${categoryId}-`}${definition.slug}-title`;
  const hasCategoryPrefix = definition.title === `${category.label} ${definition.label}`;
  return (
    <main
      id="main-content"
      className={`${overview.overview} ${overview.categoryEntrance}`}
      data-product-subcategory-page={subcategoryId}
      data-scale-subcategory-page={categoryId === "scales" ? subcategoryId : undefined}
      data-indicator-subcategory-page={categoryId === "indicators" ? subcategoryId : undefined}
      data-industrial-scales-page={subcategoryId === "scale-industrial" ? true : undefined}
    >
      <div className={overview.ribbon}>
        ปรึกษาผู้เชี่ยวชาญ เลือกให้ตรงกับงานของคุณ{" "}
        <Link href={sunford.contact}>ให้เราช่วยเลือก ›</Link>
      </div>
      <nav className={`${overview.sectionInner} ${styles.breadcrumb}`} aria-label="เส้นทางนำทาง">
        <Link href="/products">ผลิตภัณฑ์ทั้งหมด</Link>
        <Link href={categoryHref}>{category.label}</Link>
        <span aria-current="page">{childLabel}</span>
      </nav>
      <header className={`${overview.sectionInner} ${styles.listingHeader}`}>
        <h1 id={titleId}>
          {hasCategoryPrefix ? (
            <>
              <span>{category.label}</span> <span>{definition.label}</span>
            </>
          ) : (
            definition.title
          )}
        </h1>
      </header>
      <div className={`${overview.sectionInner} ${styles.listing}`}>
        {publishedProducts.length ? (
          <ProductCategoryMock
            key={subcategoryId}
            products={publishedProducts}
            categories={[listingCategory]}
            cardNames={cardNames}
            imagePreviews={imagePreviews}
            categoryId={categoryId}
            subcategoryId={subcategoryId}
            presentation="listing"
            listingNavigation={listingNavigation}
          />
        ) : (
          <>
            {listingNavigation}
            <section aria-labelledby="subcategory-status-title" data-subcategory-empty>
              <h2 id="subcategory-status-title">ยังไม่มีรายการสินค้าที่เผยแพร่ในหมวดนี้</h2>
              <p>
                สำรวจรุ่นในหมวดที่เกี่ยวข้องด้านล่าง หรือติดต่อซันฟอร์ดเพื่อสอบถามข้อมูลเพิ่มเติม
              </p>
            </section>
          </>
        )}
      </div>
      <nav
        className={`${overview.sectionInner} ${styles.related}`}
        aria-label="ข้อมูลที่เกี่ยวข้อง"
      >
        <Link href={categoryHref}>ดู{category.label}ทุกกลุ่ม ›</Link>
        <Link href={`/guides/${categoryId}`}>คู่มือเลือก{category.label} ›</Link>
        {relatedLinks
          .filter(({ href }) => href !== `/guides/${categoryId}`)
          .map(({ href, label }) => (
            <Link key={href} href={href}>
              {label} ›
            </Link>
          ))}
        <Link href={sunford.contact}>ปรึกษาผู้เชี่ยวชาญ ›</Link>
      </nav>
    </main>
  );
}
