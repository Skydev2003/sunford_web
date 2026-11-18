import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { sunford } from "@/features/home/data/brand";
import type { ClientProduct } from "../types";
import type { ProductCategory } from "../data/mock-categories";
import { catalogCardName } from "../data/catalog-card-names";
import { formatPrice } from "../data/price-format";
import { ProductsIndexRail } from "./products-index-rail";
import styles from "./products-index-content.module.css";

export function ProductsIndexContent({
  products,
  categories,
}: {
  products: ClientProduct[];
  categories: ProductCategory[];
}) {
  const sections = categories.map(({ id, label, productIds }) => {
    const members = products.filter((product) => productIds.includes(product.id));
    const photo =
      members.find((product) => product.featured && product.image) ??
      members.find((product) => product.image);
    return { id, label, members, photo };
  });
  const other = products.filter((product) => product.warehouseSku && !product.warehouseCategoryId);
  const shelves = other.length
    ? [...sections, { id: "uncategorized", label: "รายการอื่น ๆ", members: other }]
    : sections;

  return (
    <div className={styles.index} data-products-directory data-overview-section="index">
      <header className={styles.intro}>
        <h1 id="products-title">เครื่องชั่งน้ำหนักล้ำสมัย</h1>
        <div className={styles.help}>
          <p>
            ปรึกษาผู้เชี่ยวชาญ
            <br />
            เลือกให้ตรงกับงานของคุณ
          </p>
          <Link href={sunford.contact}>
            ให้เราช่วยเลือก <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>
      <nav className={styles.categoryNav} aria-label="เลือกหมวดผลิตภัณฑ์">
        <ProductsIndexRail id="products-categories" label="หมวดผลิตภัณฑ์" categoryRail>
          {sections.map(({ id, label, photo }) => (
            <li key={id} className={styles.category}>
              <Link href={`/products/category/${id}`}>
                <div className={styles.categoryImage}>
                  <ProductImage
                    placeholder="product"
                    src={photo?.image}
                    fallbackSrc={photo?.fallbackImage}
                    alt=""
                    fill
                    sizes="144px"
                  />
                </div>
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ProductsIndexRail>
      </nav>
      {shelves.map(({ id, label, members }) => (
        <section
          key={id}
          className={styles.section}
          data-products-category-section
          aria-labelledby={`products-category-${id}`}
        >
          <div className={styles.sectionHeading}>
            <h2 id={`products-category-${id}`}>{label}</h2>
            {id !== "uncategorized" && (
              <Link href={`/products/category/${id}`}>
                ดูทั้งหมด <span aria-hidden="true">›</span>
              </Link>
            )}
          </div>
          <ProductsIndexRail id={`products-rail-${id}`} label={label}>
            {members.map((product) => (
              <li
                key={product.id}
                className={styles.card}
                data-warehouse-sku={product.warehouseSku}
              >
                <Link
                  href={`/products/${product.slug}`}
                  aria-labelledby={`products-model-${product.id}`}
                >
                  <div className={styles.cardCopy}>
                    <h3 id={`products-model-${product.id}`}>{catalogCardName(product)}</h3>
                    {product.warehouseSku && (
                      <div className={styles.cardSpecs}>
                        {[
                          ["พิกัดชั่ง", product.capacity],
                          ["ความละเอียด", product.readability],
                          ["การเชื่อมต่อ", product.connection],
                        ]
                          .filter(([, value]) => value.trim() && value.trim() !== "—")
                          .slice(0, 2)
                          .map(([label, value]) => (
                            <span key={label} data-product-spec>
                              {label} {value.trim()}
                            </span>
                          ))}
                      </div>
                    )}
                    {product.price != null ? (
                      <p>{formatPrice(product.price)} บาท (ก่อน VAT)</p>
                    ) : product.warehouseSku ? (
                      <p>สอบถามราคา</p>
                    ) : null}
                  </div>
                  <div className={styles.media}>
                    <ProductImage
                      placeholder="product"
                      src={product.image}
                      fallbackSrc={product.fallbackImage}
                      alt={catalogCardName(product)}
                      fill
                      sizes="(width < 31rem) calc(78vw - 40px), (width < 64rem) 344px, 328px"
                    />
                  </div>
                  <ChevronRight className={styles.cardChevron} aria-hidden="true" strokeWidth={3} />
                </Link>
              </li>
            ))}
          </ProductsIndexRail>
        </section>
      ))}
    </div>
  );
}
