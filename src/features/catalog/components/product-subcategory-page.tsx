import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductCategories } from "@/features/catalog/server/product-categories";
import { getStorefrontProducts } from "@/features/catalog/server/product-repository";
import { warehouseBlurDataURL } from "@/features/catalog/server/warehouse-image-previews";
import { ProductCategoryMock } from "./product-category-mock";
import { getProductSubcategoryPage } from "../data/product-subcategory-pages";
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
