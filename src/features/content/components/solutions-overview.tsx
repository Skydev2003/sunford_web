import { ProductImage } from "@/components/ui/product-image";
import { getProducts } from "@/features/catalog/server/product-repository";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight, Factory, FlaskConical, Store } from "lucide-react";
import { getSettings } from "@/features/site/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { sunford } from "@/features/home/data/brand";
import { solutions } from "../data/solutions";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import type { SourcePage } from "../types";
import overview from "@/features/catalog/components/products-overview.module.css";
import styles from "./solutions-overview.module.css";

const businessIcons = [Store, Factory, FlaskConical];

export async function SolutionsOverview({ page }: { page: SourcePage }) {
  const products = await getProducts();
  const settings = await getSettings("navigation", {
    items: defaultNavigation,
    ...defaultNavigationExtras,
  });
  const navigation = resolveNavigationItems(settings.items).find(
    ({ href }) => href === "/solutions",
  );
  const groups = navigation?.groups ?? [];

  return (
    <main
      id="main-content"
      className={`${overview.overview} ${overview.categoryEntrance} ${styles.page}`}
      data-solutions-overview
    >
      <div className={overview.ribbon}>
        ปรึกษาผู้เชี่ยวชาญ เลือกให้ตรงกับงานของคุณ{" "}
        <Link href={sunford.contact}>ให้เราช่วยเลือก ›</Link>
      </div>

      <section
        className={overview.chapters}
        aria-labelledby="solutions-title"
        data-solutions-section="chapters"
      >
        <div className={`${overview.sectionInner} ${overview.categoryHeading}`}>
          <h1 id="solutions-title">{navigation?.label ?? "โซลูชันตามธุรกิจ"}</h1>
          <a href="#solutions-all">โซลูชันทั้งหมด</a>
        </div>
        <nav className={overview.chapterRail} aria-label="สำรวจกลุ่มธุรกิจ">
          <ul className={`${overview.chapterTrack} ${styles.chapterTrack}`}>
            {groups.map((group, index) => {
              const Icon = businessIcons[index] ?? Store;
              return (
                <li
                  key={`${index}:${group.label}`}
                  style={{ "--chapter-index": index } as CSSProperties}
                >
                  <a className={styles.chapterLink} href={`#business-${index + 1}`}>
                    <span className={styles.chapterArt}>
                      <Icon size={42} strokeWidth={1.25} aria-hidden="true" />
                    </span>
                    <span>{group.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </section>

      <section
        className={`${overview.sectionInner} ${styles.hero}`}
        aria-labelledby="solutions-hero-title"
        data-solutions-section="hero"
      >
        <div className={styles.heroCopy}>
          <h2 id="solutions-hero-title">
            เมื่อทุกอย่างเชื่อมถึงกัน<span>ธุรกิจก็ไปได้ไกลขึ้น</span>
          </h2>
          <p></p>
          <a className={overview.primaryButton} href="#solutions-all">
            โซลูชันทั้งหมด <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
        <div className={styles.heroArt}>
          <ProductImage
            src={products.find((product) => product.image)?.image ?? ""}
            alt="ภาพประกอบโซลูชันการชั่งน้ำหนักสำหรับธุรกิจ"
            fill
            sizes="(min-width: 1069px) 45vw, 88vw"
          />
        </div>
      </section>

      <section
        className={`${overview.section} ${styles.solutions}`}
        id="solutions-all"
        aria-labelledby="solutions-all-title"
        data-overview-section="lineup"
        data-solutions-section="solutions"
      >
        <div className={overview.sectionHeading}>
          <h2 id="solutions-all-title">โซลูชันทั้งหมด</h2>
          <p className={styles.introduction}>{page.text}</p>
        </div>
        <ul className={styles.solutionTrack} aria-label="โซลูชันทั้งหมด" tabIndex={0}>
          {solutions.map((item) => (
            <li key={item.id}>
              <Link
                href={item.path}
                prefetch={false}
                aria-label={item.title}
                className={styles.solutionCard}
              >
                <h3>{item.title}</h3>
                <span aria-hidden="true">
                  ดูรายละเอียด <ArrowRight size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className={`${overview.section} ${styles.businesses}`}
        aria-labelledby="businesses-title"
        data-solutions-section="businesses"
      >
        <div className={overview.sectionHeading}>
          <h2 id="businesses-title">{navigation?.submenuLabel ?? "โซลูชันสำหรับธุรกิจ"}</h2>
        </div>
        <div className={`${overview.sectionInner} ${styles.businessGrid}`}>
          {groups.map((group, index) => (
            <section
              key={`${index}:${group.label}`}
              id={`business-${index + 1}`}
              className={styles.businessCard}
              aria-labelledby={`business-${index + 1}-title`}
            >
              <h3 id={`business-${index + 1}-title`}>{group.label}</h3>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={resolveCategoryHref(link.href)} prefetch={false}>
                      {link.label}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
