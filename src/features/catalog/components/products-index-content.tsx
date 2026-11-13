import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { ProductsIndexCarousel } from "./products-index-carousel";
import type { ClientProduct } from "../types";
import type { ProductCategory } from "../data/mock-categories";
import { catalogCardName } from "../data/catalog-card-names";
import curatedCarousel from "../data/products-index-carousel.json";
import styles from "./products-index-content.module.css";

export function ProductsIndexContent({
  products,
  categories,
}: {
  products: ClientProduct[];
  categories: ProductCategory[];
}) {
  const otherIds = products
    .filter((p) => p.warehouseSku && !p.warehouseCategoryId)
    .map((p) => p.id);
  const sections = otherIds.length
    ? [...categories, { id: "uncategorized", label: "รายการอื่น ๆ", productIds: otherIds }]
    : categories;
  const carousel = curatedCarousel.products.flatMap((item) => {
    const current = products.find(
      (product) =>
        product.id === item.id || (item.warehouseSku && product.warehouseSku === item.warehouseSku),
    );
    if (!current?.image.trim()) return [];
    return [
      {
        id: item.id,
        categoryId: item.categoryId,
        categoryLabel: item.categoryLabel,
        model: current.name,
        subtitle: current.subtitle ?? "",
        capacity: current.capacity ?? "",
        readability: current.readability ?? "",
        connection: current.connection ?? "",
        image: current.image,
        href: `/products/${current.slug}`,
      },
    ];
  });
  const carouselCategories = curatedCarousel.categories.filter((category) =>
    carousel.some((product) => product.categoryId === category.id),
  );
  return (
    <div className={styles.index} data-products-directory aria-labelledby="products-title">
      <h1 id="products-title" className={styles.pageTitle}>
        ผลิตภัณฑ์ทั้งหมด
      </h1>
      <ProductsIndexCarousel products={carousel} categories={carouselCategories} />
      {sections.map((category) => {
        const members = products.filter((product) => category.productIds.includes(product.id));
        return (
          <section
            key={category.id}
            className={styles.section}
            data-products-category-section
            aria-labelledby={`products-category-${category.id}`}
          >
            <div className={styles.sectionHeading}>
              <h2 id={`products-category-${category.id}`}>{category.label}</h2>
              <span>{members.length} รายการ</span>
              {category.id !== "uncategorized" && (
                <Link href={`/products/category/${category.id}`}>ดูทั้งหมด</Link>
              )}
            </div>
            <ul className={styles.rail} tabIndex={0} aria-label={category.label}>
              {members.map((product, index) => (
                <li
                  key={product.id}
                  className={`${styles.card} ${index === 0 ? styles.leadCard : ""}`}
                  data-warehouse-sku={product.warehouseSku}
                >
                  <Link href={`/products/${product.slug}`} className={styles.media}>
                    <ProductImage
                      src={product.image}
                      fallbackSrc={product.fallbackImage}
                      alt={catalogCardName(product)}
                      fill
                      sizes="(max-width: 600px) 80vw, 400px"
                    />
                  </Link>
                  <div className={styles.cardCopy}>
                    <Link href={`/products/${product.slug}`}>
                      <h3>{catalogCardName(product)}</h3>
                    </Link>
                    {product.price != null ? (
                      <p>
                        {product.price.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        บาท (ก่อน VAT)
                      </p>
                    ) : product.warehouseSku ? (
                      <p>สอบถามราคา</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
