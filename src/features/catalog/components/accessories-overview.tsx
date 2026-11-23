import Link from "next/link";
import { ProductsOverview } from "./products-overview";
import { getProductCategories } from "../server/product-categories";
import { getStorefrontProducts } from "../server/product-repository";
import { additionalAccessorySubcategoryPages } from "../data/additional-subcategory-pages";
import { buyingGuides } from "@/features/content/data/buying-guides";
import { getSettings } from "@/features/site/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { defaultSite } from "@/features/site/data/settings";
import { sunford } from "@/features/home/data/brand";
import styles from "./products-overview.module.css";

const topics: Readonly<Record<string, { introduction: string; detail: string }>> = {
  compatibility: {
    introduction: "เทียบรุ่นเครื่องหลัก พอร์ต และขั้วต่อก่อนเลือกอุปกรณ์",
    detail: "จดชื่อรุ่นเครื่องชั่งหรือระบบ POS แล้วตรวจรายการอุปกรณ์ที่รองรับจากคู่มือของรุ่นนั้น",
  },
  printers: {
    introduction: "เลือกให้ตรงกับงานพิมพ์สลิปหรือฉลากสินค้า",
    detail: "ตรวจขนาดสลิปหรือฉลาก ช่องทางเชื่อมต่อ และซอฟต์แวร์ที่เครื่องพิมพ์รองรับ",
  },
  consumables: {
    introduction: "ตรวจขนาดม้วนและวิธีพิมพ์ให้ตรงกับเครื่อง",
    detail: "เทียบความกว้างม้วน ขนาดแกน และชนิดกระดาษหรือฉลากกับคู่มือเครื่องพิมพ์",
  },
};

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function AccessoriesOverview() {
  const {
    products: catalogProducts,
    categories,
    cardNames,
    readySubcategoryHrefs,
  } = await getProductCategories();
  const category = categories.find(({ id }) => id === "accessories")!;
  const ids = new Set(category.productIds);
  const products = catalogProducts.filter(({ id }) => ids.has(id));
  const images = [
    ...products.filter((product) => product.featured && product.image),
    ...products.filter((product) => !product.featured && product.image),
  ];
  const guide = buyingGuides.find(({ slug }) => slug === "accessories")!;
  const guideHref = "/guides/accessories";
  const stories = guide.sections.map((section, index) => ({
    id: section.id,
    title: section.title,
    introduction: topics[section.id].introduction,
    image: images[index]?.image ?? "",
    href: `${guideHref}#${section.id}`,
    content: (
      <div className={styles.storyBlocks}>
        <section>
          <p>{topics[section.id].detail}</p>
          {section.links
            .filter(({ href }) => href !== guide.productHref)
            .map(({ href, label }) => (
              <Link key={href} href={href}>
                {label} ›
              </Link>
            ))}
        </section>
      </div>
    ),
  }));
  const services = [
    {
      title: "ขอใบเสนอราคา",
      detail: "เลือกรุ่นและจำนวนที่ต้องการ",
      href: "/service/quotation",
      content: <p>เลือกรุ่นที่มีราคาในแบบฟอร์ม หรือติดต่อฝ่ายขายเพื่อสอบถามราคา</p>,
    },
    {
      title: "เลือกอุปกรณ์ที่ใช้ร่วมกัน",
      detail: "แจ้งรุ่นเครื่องชั่งหรือระบบ POS ที่ใช้อยู่",
      href: sunford.contact,
      content: <p>เตรียมชื่อรุ่นและรูปพอร์ตหรือขั้วต่อของเครื่องเดิมเพื่อสอบถามอุปกรณ์ที่รองรับ</p>,
    },
    {
      title: "บริการหลังการขาย",
      detail: "ดูขั้นตอนซ่อม เปลี่ยน เคลม และคืนสินค้า",
      href: sunford.service,
      content: (
        <p>
          <Link href={sunford.service}>บริการหลังการขาย</Link> ·{" "}
          <Link href={sunford.warranty}>ลงทะเบียนรับประกัน</Link>
        </p>
      ),
    },
    {
      title: "ดูคู่มือและสเปก",
      detail: "ตรวจข้อมูลของอุปกรณ์ก่อนเลือก",
      href: "/technical-specification",
      content: <p>ตรวจคู่มือและข้อมูลการเชื่อมต่อของอุปกรณ์ตามรุ่นที่สนใจ</p>,
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
  const accordion = stories.map((story) => ({
    title: story.title,
    image: story.image,
    content: (
      <>
        <p>{story.introduction}</p>
        <Link href={story.href}>อ่านคู่มือ ›</Link>
      </>
    ),
  }));
  const [navigation, site, copyrightYear, warehouseProducts] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
    getCopyrightYear(),
    getStorefrontProducts(),
  ]);
  const subcategories = [
    ...category.subcategories,
    ...additionalAccessorySubcategoryPages.map(({ id, label, matches }) => ({
      id,
      label,
      productIds: warehouseProducts
        .filter((product) => ids.has(product.id) && matches(product))
        .map((product) => product.id),
    })),
  ];
  return (
    <ProductsOverview
      products={products}
      categories={[{ ...category, subcategories }]}
      cardNames={cardNames}
      categoryId="accessories"
      navigation={resolveNavigationItems(navigation.items)}
      readySubcategoryHrefs={readySubcategoryHrefs}
      site={site}
      copyrightYear={copyrightYear}
      stories={stories}
      services={services}
      accordion={accordion}
    />
  );
}
