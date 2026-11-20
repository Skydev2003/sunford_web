import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { sunford } from "@/features/home/data/brand";
import type { ClientProduct } from "../types";
import type { ProductCategory } from "../data/mock-categories";
import { catalogCardName } from "../data/catalog-card-names";
import { formatPrice } from "../data/price-format";
import { ProductsIndexRail } from "./products-index-rail";
import { ProductsIndexMotion } from "./products-index-motion";
import { ProductPhotoCard, ProductShowcaseCard } from "./scale-showcase-card";
import photoStyles from "./scale-showcase-card.module.css";
import { SmartSystemShowcaseCards } from "./software-showcase";
import { selectComponentShowcase } from "../data/component-showcase";
import { selectScaleShowcase } from "../data/scale-showcase";
import styles from "./products-index-content.module.css";

const categoryFamilies = new Set(["scales", "indicators", "platforms", "pos", "accessories"]);
const showcaseHeadings: Partial<Record<string, { lead: string; detail: string }>> = {
  scales: { lead: "เครื่องชั่ง", detail: "มาตรฐานที่ไว้วางใจ" },
  indicators: { lead: "เลือกออกแบบ", detail: "ได้ด้วยตัวคุณเอง" },
  platforms: { lead: "ระบบอัจฉริยะ", detail: " ยกระดับงานชั่ง" },
  pos: { lead: "งานบ้านก็สบาย", detail: " งานขายก็หายห่วง" },
  accessories: { lead: "เที่ยงตรง", detail: "ทั้งอุตสาหกรรมและงานวิเคราะห์" },
};

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

  return (
    <div className={styles.index} data-products-directory data-overview-section="index">
      <header className={styles.intro}>
        <ProductsIndexMotion />
        <h1 id="products-title">
          <span className={styles.accessibleTitle}>เครื่องชั่งน้ำหนักล้ำสมัย</span>
        </h1>
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
          {sections.map(({ id, label, photo }) => {
            const familyImage = categoryFamilies.has(id)
              ? `/images/products/category-families/${id}.webp`
              : undefined;
            return (
              <li key={id} className={styles.category}>
                <Link href={`/products/category/${id}`}>
                  <div className={styles.categoryImage}>
                    <ProductImage
                      placeholder="product"
                      src={familyImage ?? photo?.image}
                      fallbackSrc={
                        familyImage ? (photo?.image ?? photo?.fallbackImage) : photo?.fallbackImage
                      }
                      alt=""
                      fill
                      sizes="(max-width: 736px) 108px, 120px"
                    />
                  </div>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
          <li className={styles.category}>
            <Link href="/guides/indicator-platform-compatibility">
              <div className={`${styles.categoryImage} ${styles.categoryImagePair}`}>
                <div>
                  <Image
                    src="/images/products/component-showcase/g107770-front-4k.webp"
                    alt=""
                    fill
                    sizes="(max-width: 736px) 54px, 60px"
                  />
                </div>
                <div>
                  <Image
                    src="/images/products/component-showcase/g107534-front-4k.webp"
                    alt=""
                    fill
                    sizes="(max-width: 736px) 54px, 60px"
                  />
                </div>
              </div>
              <span>จัดสเปค</span>
            </Link>
          </li>
        </ProductsIndexRail>
      </nav>
      {sections.map(({ id, label, members }) => {
        const heading = showcaseHeadings[id];
        const title = heading ? heading.lead + heading.detail : label;
        const showcase =
          id === "indicators"
            ? selectComponentShowcase(products)
            : id === "scales" || id === "pos" || id === "accessories"
              ? selectScaleShowcase(id === "scales" ? members : products, id)
              : undefined;
        return (
          <section
            key={id}
            className={styles.section}
            data-products-category-section
            aria-labelledby={`products-category-${id}`}
          >
            <div className={styles.sectionHeading}>
              <h2 id={`products-category-${id}`} aria-label={heading ? title : undefined}>
                {heading ? (
                  <>
                    <span className={styles.headingLead}>{heading.lead}</span>
                    <span className={styles.headingDetail}>{heading.detail}</span>
                  </>
                ) : (
                  title
                )}
              </h2>
            </div>
            <ProductsIndexRail id={`products-rail-${id}`} label={id === "scales" ? label : title}>
              {id === "indicators" && (
                <li className={styles.card}>
                  <Link href={sunford.about} className={styles.aboutCard}>
                    <p>เกี่ยวกับ SUNFORD</p>
                    <h3>
                      แม่นยำ
                      <wbr />
                      <span>ในทุกน้ำหนัก</span>
                    </h3>
                    <div className={styles.aboutArt}>
                      <Image
                        src="/images/products/precision-weights.webp"
                        alt=""
                        fill
                        sizes="(max-width: 736px) 346px, 448px"
                      />
                    </div>
                    <ArrowUpRight className={styles.aboutArrow} aria-hidden="true" />
                  </Link>
                </li>
              )}
              {id === "platforms" ? (
                <SmartSystemShowcaseCards products={products} />
              ) : showcase ? (
                showcase.map((item, index) => (
                  <ProductShowcaseCard
                    key={item.product.id}
                    item={item}
                    shelf={id}
                    first={id === "scales" && index === 0}
                  />
                ))
              ) : (
                members.map((product) => {
                  const name = catalogCardName(product);
                  return (
                    <li
                      key={product.id}
                      className={photoStyles.card}
                      data-warehouse-sku={product.warehouseSku}
                    >
                      <ProductPhotoCard
                        href={`/products/${product.slug}`}
                        heading={`products-model-${product.id}`}
                        name={name}
                        image={
                          <ProductImage
                            placeholder="product"
                            src={product.image}
                            fallbackSrc={product.fallbackImage}
                            alt={name}
                            fill
                            sizes="216px"
                          />
                        }
                      >
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
                      </ProductPhotoCard>
                    </li>
                  );
                })
              )}
            </ProductsIndexRail>
          </section>
        );
      })}
      <section className={styles.section} aria-labelledby="products-calibration">
        <div className={styles.sectionHeading}>
          <h2 id="products-calibration">
            <span className={styles.headingLead}>มาตรฐานการสอบเทียบ</span>{" "}
            <span className={styles.headingDetail}>ตัวอย่างเอกสารจาก SUNFORD</span>
          </h2>
        </div>
        <ProductsIndexRail id="products-rail-calibration" label="เอกสารสอบเทียบเครื่องชั่ง">
          <li className={styles.card}>
            <a href="/documents/scale-calibration-sample.pdf" className={styles.editorialCard}>
              <p>ISO/IEC 17025 · PDF 3 หน้า</p>
              <h3>
                ใบรับรอง
                <span>การสอบเทียบเครื่องชั่ง</span>
              </h3>
              <div className={styles.editorialArt} aria-hidden="true">
                <Image
                  src="/images/imported/4c0b5961f704281476c1.webp"
                  alt=""
                  fill
                  sizes="(max-width: 369px) calc(100vw - 60px), (max-width: 736px) 309px, 400px"
                />
              </div>
              <ArrowUpRight className={styles.editorialArrow} aria-hidden="true" />
            </a>
          </li>
          <li className={styles.card}>
            <a
              href="/images/imported/19d265ccc80f5feede0c.webp"
              className={`${styles.editorialCard} ${styles.resultsCard}`}
            >
              <p>ตัวอย่างผลการวัด · หน้า 3</p>
              <h3>
                ค่าปรับแก้
                <span>และความไม่แน่นอน</span>
              </h3>
              <div className={styles.editorialArt} aria-hidden="true">
                <Image
                  src="/images/imported/19d265ccc80f5feede0c.webp"
                  alt=""
                  fill
                  sizes="(max-width: 369px) calc(100vw - 60px), (max-width: 736px) 309px, 400px"
                />
              </div>
              <ArrowUpRight className={styles.editorialArrow} aria-hidden="true" />
            </a>
          </li>
        </ProductsIndexRail>
      </section>
    </div>
  );
}
