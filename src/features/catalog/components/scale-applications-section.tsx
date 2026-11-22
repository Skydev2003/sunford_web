import { CatalogNavigationLink } from "./catalog-navigation-link";
import { ChevronRight } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { ProductImage } from "@/components/ui/product-image";
import { getScaleApplications } from "../server/scale-applications";
import { ProductsIndexRail } from "./products-index-rail";
import styles from "./products-overview.module.css";

function ApplicationsStatus({ children }: { children: ReactNode }) {
  return (
    <p className={styles.applicationsStatus} role="status">
      {children}
    </p>
  );
}

async function ApplicationsRail() {
  const applications = await getScaleApplications().catch(() => null);
  if (!applications) {
    return <ApplicationsStatus>เปิดข้อมูลกลุ่มการใช้งานไม่ได้ในขณะนี้</ApplicationsStatus>;
  }
  if (!applications.length) {
    return <ApplicationsStatus>ยังไม่มีกลุ่มการใช้งานที่เผยแพร่</ApplicationsStatus>;
  }
  const featured = applications.filter(({ products }) => products.length);
  const other = applications.filter(({ products }) => !products.length);
  return (
    <>
      {featured.length > 0 && (
        <div className={styles.gallery}>
          <ProductsIndexRail
            id="products-applications"
            label="กลุ่มการใช้งานเครื่องชั่ง"
            returnKey="scales.applications"
            trackClassName={styles.galleryTrack}
            controlsClassName={styles.galleryControls}
            prepareImages
            revealTabFocus
          >
            {featured.map(({ slug, label, products }) => {
              const example = products.find(({ image }) => image);
              return (
                <li className={styles.applicationTile} key={slug}>
                  <CatalogNavigationLink
                    href={`/products/category/scales/applications/${slug}`}
                    prefetch={false}
                  >
                    <h3>{label}</h3>
                    {example && (
                      <div className={styles.applicationArt}>
                        <ProductImage
                          src={example.image}
                          alt=""
                          fill
                          sizes="(width < 48rem) min(calc(78vw - 44px), 236px), 308px"
                        />
                      </div>
                    )}
                    <span className={styles.applicationLink}>
                      ดูรุ่นที่เกี่ยวข้อง
                      <ChevronRight size={16} aria-hidden="true" />
                    </span>
                  </CatalogNavigationLink>
                </li>
              );
            })}
          </ProductsIndexRail>
        </div>
      )}
      {other.length > 0 && (
        <div className={styles.applicationTopics}>
          <h3>{featured.length ? "กลุ่มการใช้งานอื่น" : "กลุ่มการใช้งาน"}</h3>
          {!featured.length && <p>ยังไม่มีรุ่นที่ยืนยันสำหรับกลุ่มเหล่านี้</p>}
          <ul>
            {other.map(({ slug, label }) => (
              <li key={slug}>
                <CatalogNavigationLink
                  href={`/products/category/scales/applications/${slug}`}
                  prefetch={false}
                >
                  {label} <ChevronRight size={14} aria-hidden="true" />
                </CatalogNavigationLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

export function ScaleApplicationsSection() {
  return (
    <section
      className={`${styles.section} ${styles.applications}`}
      aria-labelledby="products-applications-title"
      data-overview-section="applications"
    >
      <div className={styles.sectionHeading}>
        <h2 id="products-applications-title">เลือกเครื่องชั่งตามการใช้งาน</h2>
        <CatalogNavigationLink
          href="/products/category/scales/applications"
          className={styles.textLink}
        >
          ดูทุกกลุ่มการใช้งาน <ChevronRight size={16} aria-hidden="true" />
        </CatalogNavigationLink>
      </div>
      <Suspense fallback={<ApplicationsStatus>กำลังโหลดกลุ่มการใช้งาน…</ApplicationsStatus>}>
        <ApplicationsRail />
      </Suspense>
    </section>
  );
}
