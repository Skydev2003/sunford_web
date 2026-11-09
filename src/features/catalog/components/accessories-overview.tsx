import Link from "next/link";
import { ProductsOverview } from "./products-overview";
import { getProductCategories } from "../server/product-categories";
import { buyingGuides } from "@/features/content/data/buying-guides";
import { getSettings } from "@/features/cms/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/cms/data/navigation";
import { defaultSite } from "@/features/cms/data/settings";
import { sunford } from "@/features/home/data/brand";
import styles from "./products-overview.module.css";

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function AccessoriesOverview() {
  const { products: catalogProducts, categories, cardNames } = await getProductCategories();
  const category = categories.find(({ id }) => id === "accessories")!;
  const ids = new Set(category.productIds);
  const products = catalogProducts.filter(({ id }) => ids.has(id));
  const images = [
    ...products.filter((product) => product.featured && product.image),
    ...products.filter((product) => !product.featured && product.image),
  ];
  const guide = buyingGuides.find(({ slug }) => slug === "accessories")!;
  const categoryHref = "/products/category/accessories";
  const localHref = (href: string) => (href === "/product/scale-accessories" ? categoryHref : href);
  const stories = guide.sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    introduction: section.paragraphs[0],
    image: images[index].image,
    href: "/guides/accessories",
    content: (
      <div className={styles.storyBlocks}>
        <section>
          {section.paragraphs.slice(1).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.links.map((link) => (
            <Link key={link.href} href={localHref(link.href)}>
              {link.label} ›
            </Link>
          ))}
        </section>
      </div>
    ),
  }));
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
      content: <p>{guide.introduction}</p>,
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
      href: categoryHref,
      content: <p>{guide.sections[2].paragraphs[1]}</p>,
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
  ];
  const accordion = guide.sections.map((section, index) => ({
    title: section.title,
    image: stories[index].image,
    content: (
      <>
        <p>{section.paragraphs[0]}</p>
        <Link href="/guides/accessories">ดูเพิ่มเติม ›</Link>
      </>
    ),
  }));
  const [navigation, site, copyrightYear] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
    getCopyrightYear(),
  ]);
  return (
    <ProductsOverview
      products={products}
      categories={[category]}
      cardNames={cardNames}
      categoryId="accessories"
      navigation={resolveNavigationItems(navigation.items)}
      site={site}
      copyrightYear={copyrightYear}
      stories={stories}
      services={services}
      accordion={accordion}
    />
  );
}
