import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductCategories } from "@/features/catalog/server/product-categories";
import { getStorefrontProducts } from "@/features/catalog/server/product-repository";
import { ProductCategoryMock } from "./product-category-mock";
import { getProductSubcategoryPage } from "../data/product-subcategory-pages";
import { consumableSubtypeLinks } from "../data/additional-subcategory-pages";
import { sunford } from "@/features/home/data/brand";
import overview from "./products-overview.module.css";
import styles from "./product-directory.module.css";

export async function ProductSubcategoryPage({
  categoryId,
  subcategoryId,
}: {
  categoryId: string;
  subcategoryId: string;
}) {
  const definition = getProductSubcategoryPage(subcategoryId, categoryId);
  if (!definition) notFound();
  const additional = "matches" in definition ? definition : undefined;
  const [{ products, categories, cardNames }, warehouseProducts] = await Promise.all([
    getProductCategories(),
    additional ? getStorefrontProducts() : [],
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
  const ids = new Set(child.productIds);
  const listingCategory = additional ? { ...category, subcategories: [child] } : category;
  const relatedLinks =
    additional?.relatedLinks ??
    (subcategoryId === "accessory-consumables" ? consumableSubtypeLinks : []);
  const titleId = `${categoryId === "scales" ? "" : `${categoryId}-`}${definition.slug}-title`;
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
        <Link href={`/products/category/${categoryId}`}>{category.label}</Link>
        <span aria-current="page">{child.label.replace(/^เครื่องชั่ง/, "")}</span>
      </nav>
      <section className={overview.chapters} aria-labelledby={titleId}>
        <div className={`${overview.sectionInner} ${overview.categoryHeading}`}>
          <h1 id={titleId}>{definition.title}</h1>
        </div>
      </section>
      <div className={`${overview.sectionInner} ${styles.listing}`}>
        <ProductCategoryMock
          key={subcategoryId}
          products={products.filter((product) => ids.has(product.id))}
          categories={[listingCategory]}
          cardNames={cardNames}
          categoryId={categoryId}
          subcategoryId={subcategoryId}
          presentation="listing"
        />
      </div>
      <nav
        className={`${overview.sectionInner} ${styles.related}`}
        aria-label="ข้อมูลที่เกี่ยวข้อง"
      >
        <Link href={`/products/category/${categoryId}`}>ดู{category.label}ทุกกลุ่ม ›</Link>
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
