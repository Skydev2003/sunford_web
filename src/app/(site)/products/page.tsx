import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductsOverview } from "@/features/catalog/components/products-overview";
import { ProductsIndexContent } from "@/features/catalog/components/products-index-content";
import { getProductCategories } from "@/features/catalog/server/product-categories";
import { buyingGuides } from "@/features/content/data/buying-guides";
import { getSettings } from "@/features/site/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { defaultSite } from "@/features/site/data/settings";
import { sunford } from "@/features/home/data/brand";
import styles from "@/features/catalog/components/products-overview.module.css";
export const metadata: Metadata = { title: "ผลิตภัณฑ์ทั้งหมด" };
async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}
export default function ProductsPage() {
  return (
    <Suspense fallback={<p role="status">กำลังโหลดสินค้า…</p>}>
      <ProductsContent />
    </Suspense>
  );
}

async function ProductsContent() {
  const { products: clientProducts, categories, cardNames } = await getProductCategories();
  const [navigation, site, copyrightYear] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
    getCopyrightYear(),
  ]);
  const photos = new Map<string, string>(
    categories.map((category) => {
      const members = category.productIds
        .map((id) => clientProducts.find((product) => product.id === id))
        .filter((product) => product?.image);
      const representative = members.find((product) => product?.featured) ?? members[0];
      return [category.id, representative?.image ?? ""];
    }),
  );
  const guideBody = (guide: (typeof buyingGuides)[number]) => (
    <div className={styles.storyBlocks}>
      {guide.sections.map((section) => (
        <section key={section.id}>
          <h3>{section.title}</h3>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.links.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label} ›
            </Link>
          ))}
        </section>
      ))}
    </div>
  );
  const stories = [
    ...buyingGuides.map((guide) => ({
      id: guide.slug,
      title: guide.title,
      introduction: guide.introduction,
      image: photos.get(guide.slug) ?? "",
      href: `/guides/${guide.slug}`,
      content: guideBody(guide),
    })),
    {
      id: "software",
      title: "แอปพลิเคชันและซอฟต์แวร์",
      introduction: "",
      image:
        clientProducts.find(
          (product) => product.warehouseGroup === "โปรแกรมและสิทธิ์ใช้งาน" && product.image,
        )?.image ?? "",
      href: sunford.software,
      content: (
        <div className={styles.storyBlocks}>
          <section>
            <h3>เชื่อมต่อเครื่องชั่ง ข้อมูล และการทำงาน</h3>
            <p>ให้ทุกขั้นตอนของธุรกิจเป็นเรื่องง่าย</p>
            <Link href={sunford.downloads}>ดาวน์โหลดซอฟต์แวร์ ›</Link>
          </section>
          <section>
            <h3>เมื่อทุกอย่างเชื่อมถึงกัน ธุรกิจก็ไปได้ไกลขึ้น</h3>
            <p></p>
            <Link href="/products/pos1100">ค้นพบ SUNFORD POS ›</Link>
          </section>
        </div>
      ),
    },
  ];
  const services = [
    {
      title: "จัดส่งถึงคุณ.",
      detail: "ครอบคลุมทั่วประเทศไทย",
      href: sunford.contact,
      content: <p>จัดส่งทั่วประเทศไทย พร้อมทีมดูแล และให้คำปรึกษา</p>,
    },
    {
      title: "ปรึกษาผู้เชี่ยวชาญ.",
      detail: "เลือกให้ตรงกับงานของคุณ",
      href: sunford.contact,
      content: <p>{buyingGuides[0].introduction}</p>,
    },
    {
      title: "ดูแลหลังการขาย.",
      detail: "พร้อมข้อมูลการรับประกัน",
      href: sunford.warrantyPolicy,
      content: (
        <p>
          <Link href={sunford.service}>บริการหลังการขาย</Link> ·{" "}
          <Link href={sunford.warranty}>ลงทะเบียนรับประกัน</Link>
        </p>
      ),
    },
    {
      title: "เปรียบเทียบก่อนเลือก.",
      detail: "ดูรายละเอียดได้สูงสุด 3 รุ่น",
      href: "/products",
      content: <p>{buyingGuides[0].sections[2].paragraphs[1]}</p>,
    },
    {
      title: "ลงทะเบียนรับประกัน",
      detail: "พร้อมข้อมูลการรับประกัน",
      href: sunford.warranty,
      content: (
        <p>
          <Link href={sunford.warrantyPolicy}>นโยบายการรับประกัน</Link> ·{" "}
          <Link href={sunford.contact}>ติดต่อฝ่ายบริการ</Link>
        </p>
      ),
    },
    {
      title: "ดาวน์โหลดซอฟต์แวร์",
      detail: "แอปพลิเคชันและซอฟต์แวร์",
      href: sunford.downloads,
      content: <p></p>,
    },
  ];
  const accordion = [
    {
      title: "แท่นชั่ง และอินดิเคเตอร์",
      image: photos.get("platforms") ?? "",
      content: (
        <>
          <p>{buyingGuides[1].sections[0].paragraphs[0]}</p>
          <Link href="/guides/indicators">ดูเพิ่มเติม ›</Link>
        </>
      ),
    },
    {
      title: "ระบบ POS และซอฟต์แวร์",
      image: clientProducts.find((product) => product.image)?.image ?? "",
      content: (
        <>
          <p>{buyingGuides[3].sections[2].paragraphs[0]}</p>
          <Link href="/guides/pos">ดูเพิ่มเติม ›</Link>
        </>
      ),
    },
    {
      title: "เครื่องชั่ง และอุปกรณ์เสริม",
      image:
        clientProducts.find(
          (product) => product.warehouseCategoryId === "accessories" && product.image,
        )?.image ?? "",
      content: (
        <>
          <p>{buyingGuides[4].sections[0].paragraphs[0]}</p>
          <Link href="/guides/accessories">ดูเพิ่มเติม ›</Link>
        </>
      ),
    },
  ];
  return (
    <ProductsOverview
      indexContent={<ProductsIndexContent products={clientProducts} categories={categories} />}
      products={clientProducts}
      categories={categories}
      cardNames={cardNames}
      site={site}
      copyrightYear={copyrightYear}
      navigation={resolveNavigationItems(navigation.items)}
      stories={stories}
      services={services}
      accordion={accordion}
    />
  );
}
