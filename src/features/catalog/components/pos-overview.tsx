import Link from "next/link";
import { ProductsOverview } from "./products-overview";
import { getProductCategories } from "../server/product-categories";
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

// Catalogue photographs are used only for the matching Warehouse model.
const modelPhotos: Readonly<Record<string, string>> = {
  G108029: "/images/products/software-showcase/p1-front-4k.webp",
  G108012: "/images/products/software-showcase/p1w-front-4k.webp",
  G108050: "/images/products/software-showcase/p4-front-4k.webp",
};

const topics: Readonly<Record<string, { introduction: string; image: string; detail: string }>> = {
  systems: {
    introduction: "เลือกจากซอฟต์แวร์ที่ร้านใช้ แล้วตรวจรุ่น Android หรือ Windows ที่รองรับ",
    image: "/images/category-chapters/pos/windows.webp",
    detail:
      "ชุด P1 เป็นตัวเลือก Android และชุด P1W เป็นตัวเลือก Windows ให้ตรวจระบบที่ซอฟต์แวร์ เครื่องพิมพ์ และอุปกรณ์ของร้านรองรับก่อนเลือก",
  },
  workflows: {
    introduction: "ลองขั้นตอนรับน้ำหนัก คำนวณราคา และพิมพ์เอกสารหรือฉลากตามงานจริง",
    image: "/images/products/software-showcase/pos-android.webp",
    detail:
      "เริ่มจากงานขายจริงของร้าน ทดลองรับน้ำหนัก คำนวณราคา และพิมพ์ตัวอย่าง ตรวจว่าชนิดเอกสารและฉลากตรงกับที่ใช้",
  },
  scales: {
    introduction: "ตรวจรุ่นเครื่องชั่ง พอร์ต และรูปแบบข้อมูลก่อนต่อกับระบบ POS",
    image: "/images/category-chapters/pos/android.webp",
    detail:
      "ชุด P1 พร้อม RLS1100 เป็นตัวอย่างชุด Android ที่มีอยู่ หากนำเครื่องเดิมมาใช้ร่วมกัน ให้ยืนยันสาย พอร์ต หน่วยน้ำหนัก และรูปแบบข้อมูลของทั้งสองฝั่ง",
  },
};

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function POSOverview() {
  const {
    products: catalogProducts,
    categories,
    cardNames,
    readySubcategoryHrefs,
  } = await getProductCategories();
  const category = categories.find(({ id }) => id === "pos")!;
  const ids = new Set(category.productIds);
  const products = catalogProducts
    .filter(({ id }) => ids.has(id))
    .map((product) => {
      const image = product.warehouseSku && modelPhotos[product.warehouseSku];
      return !product.image && image ? { ...product, image } : product;
    });
  const guide = buyingGuides.find(({ slug }) => slug === "pos")!;
  const guideHref = "/guides/pos";
  const stories = guide.sections.map((section) => ({
    id: section.id,
    title: section.title,
    introduction: topics[section.id].introduction,
    image: topics[section.id].image,
    href: `${guideHref}#${section.id}`,
    content: (
      <div className={styles.storyBlocks}>
        <section>
          <p>{topics[section.id].detail}</p>
          {section.links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label} ›
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
      content: <p>เลือกรุ่นที่มีราคาในแบบฟอร์ม หรือติดต่อฝ่ายขายหากรุ่นที่ต้องการไม่แสดงราคา</p>,
    },
    {
      title: "เลือกชุด POS สำหรับร้าน",
      detail: "แจ้งซอฟต์แวร์และอุปกรณ์ที่ใช้อยู่",
      href: sunford.contact,
      content: <p>เตรียมรุ่นเครื่องชั่ง เครื่องพิมพ์ และระบบปฏิบัติการก่อนปรึกษาเลือกชุด</p>,
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
      title: "ดูซอฟต์แวร์ POS",
      detail: "ตรวจระบบและไฟล์ที่มีให้ดาวน์โหลด",
      href: "/software/download",
      content: <p>ตรวจชื่อและรุ่นบนหน้าดาวน์โหลดก่อนติดตั้ง เลือกชุดที่รองรับระบบของร้าน</p>,
    },
    {
      title: "ลงทะเบียนรับประกัน",
      detail: "ลงทะเบียนและอ่านเงื่อนไข",
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
      categoryId="pos"
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
