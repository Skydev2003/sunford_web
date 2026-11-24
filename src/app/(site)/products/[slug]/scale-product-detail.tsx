import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { ProductReturnLink } from "@/features/catalog/components/product-return-link";
import { formatCatalogCardPrice } from "@/features/catalog/data/price-format";
import { sunford } from "@/features/home/data/brand";
import { ScaleCompactHeading, ScaleSpecificationsLink } from "./scale-detail-scroll";
import { scaleWeight, type scaleDetailSpecifications } from "./scale-detail-specifications";
import styles from "./scale-product-detail.module.css";

type Props = {
  name: string;
  category?: string;
  subtitle?: string;
  capacity?: string;
  sku?: string;
  price?: number | null;
  inquiryHref: string;
  gallery: ReactNode;
  actions: ReactNode;
  groups: ReturnType<typeof scaleDetailSpecifications>;
};

export function ScaleProductDetail({
  name,
  category,
  subtitle,
  capacity,
  sku,
  price,
  inquiryHref,
  gallery,
  actions,
  groups,
}: Props) {
  const weight = scaleWeight(capacity);
  const hasSpecs = groups.length > 0;

  return (
    <section id="product-overview" className={styles.overview} aria-label="ภาพรวมเครื่องชั่ง">
      <div className={styles.back}>
        <Suspense fallback={<Link href="/products">กลับไปที่ร้าน</Link>}>
          <ProductReturnLink label="กลับไปที่ร้าน" />
        </Suspense>
      </div>
      <div className={styles.layout}>
        <div className={styles.media}>
          {gallery}
          <div className={styles.purchase}>
            <div className={styles.buttons}>
              <p className="detail-price">{formatCatalogCardPrice(price)}</p>
              <a
                href={inquiryHref}
                target="_blank"
                rel="noreferrer"
                className={`button button-red detail-inquiry ${styles.inquiry}`}
              >
                สอบถามรุ่นนี้
              </a>
              {hasSpecs && <ScaleSpecificationsLink />}
            </div>
            <Link className={styles.warranty} href={sunford.warrantyPolicy}>
              การรับประกันและบริการ
            </Link>
          </div>
        </div>
        <div
          id="scale-detail-scroll"
          className={`detail-copy ${styles.details}`}
          role="region"
          aria-label="รายละเอียดเครื่องชั่ง"
        >
          {hasSpecs && <ScaleCompactHeading name={name} />}
          <div className={styles.intro}>
            {category && <p className={styles.category}>{category}</p>}
            <h1>{name}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {weight.amount && (
              <dl className={styles.capacity}>
                <dt>พิกัดชั่งสูงสุด</dt>
                <dd>
                  {weight.amount}
                  {weight.unit && <span> {weight.unit}</span>}
                </dd>
              </dl>
            )}
          </div>
          {hasSpecs && (
            <section
              id="product-specifications"
              className={styles.groups}
              aria-label="สเปกสินค้า"
              tabIndex={-1}
            >
              {groups.map((group) => (
                <section
                  className={styles.group}
                  key={group.id}
                  aria-labelledby={`scale-${group.id}`}
                >
                  <h2 id={`scale-${group.id}`}>{group.title}</h2>
                  <dl>
                    {group.rows.map((row) => (
                      <div key={row.label}>
                        <dt>{row.label}</dt>
                        {"html" in row ? (
                          <dd
                            className="product-attribute-content"
                            dangerouslySetInnerHTML={{ __html: row.html }}
                          />
                        ) : (
                          <dd>{row.value}</dd>
                        )}
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </section>
          )}
          {(sku || actions) && (
            <div className={styles.more}>
              {sku && <p className={styles.sku}>รหัสสินค้า {sku}</p>}
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
