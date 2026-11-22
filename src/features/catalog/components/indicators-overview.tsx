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
  G107770: "/images/products/component-showcase/g107770-front-4k.webp",
  G107787: "/images/products/component-showcase/g107787-front-4k.webp",
  G107794: "/images/products/component-showcase/g107794-front-4k.webp",
  G107848: "/images/imported/4da6b5c950692b2f8632.png",
  G107817: "/images/imported/12d2d8043dafefed4896.png",
  G107763: "/images/imported/86b57e7a903c21ab8ee2.png",
};

const topics: Readonly<Record<string, { introduction: string; image: string; detail: string }>> = {
  platforms: {
    introduction: "เช็กรุ่นแท่น พิกัด และข้อมูลโหลดเซลล์ก่อนเลือกหัวอ่าน",
    image: "/images/category-chapters/platforms/sus304.webp",
    detail:
      "ก่อนเปลี่ยนหัวอ่าน ให้ผู้ติดตั้งตรวจขั้วต่อ สายสัญญาณ และข้อมูลโหลดเซลล์ของแท่นเดิม ยืนยันความเข้ากันได้และวิธีตั้งค่าก่อนใช้งาน",
  },
  connections: {
    introduction: "ตรวจพอร์ตและรูปแบบข้อมูลที่อุปกรณ์ทั้งสองฝั่งรองรับ",
    image: "/images/products/component-showcase/g107770-front-4k.webp",
    detail:
      "AW31 มีพอร์ต RS232 ตรวจรูปแบบข้อมูลและการตั้งค่าที่อุปกรณ์ปลายทางรองรับก่อนใช้ สายที่เสียบกันได้อาจส่งข้อมูลคนละรูปแบบ",
  },
  compare: {
    introduction: "เทียบชนิดจอ ฟังก์ชัน ระดับการป้องกัน และพอร์ตของแต่ละรุ่น",
    image: "/images/category-chapters/indicators/led.webp",
    detail:
      "ใช้จอ LCD หรือ LED ตามสภาพแสงและระยะมอง อ่านสเปกของแต่ละรุ่นแยกกัน โดยเฉพาะพอร์ตและระดับการป้องกันน้ำและฝุ่น",
  },
};

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function IndicatorsOverview() {
  const {
    products: catalogProducts,
    categories,
    cardNames,
    readySubcategoryHrefs,
  } = await getProductCategories();
  const category = categories.find(({ id }) => id === "indicators")!;
  const ids = new Set(category.productIds);
  const products = catalogProducts
    .filter(({ id }) => ids.has(id))
    .map((product) => {
      const localPhoto = product.warehouseSku && modelPhotos[product.warehouseSku];
      if (!localPhoto) return product;
      if (!product.image) return { ...product, image: localPhoto };
      if (!product.fallbackImage && product.image !== localPhoto)
        return { ...product, fallbackImage: localPhoto };
      return product;
    });
  const guide = buyingGuides.find(({ slug }) => slug === "indicators")!;
  const guideHref = "/guides/indicators";
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
      title: "เลือกหัวอ่านให้ตรงกับแท่น",
      detail: "แจ้งรุ่นแท่น โหลดเซลล์ และอุปกรณ์ปลายทาง",
      href: sunford.contact,
      content: <p>เตรียมรูปป้ายรุ่น ขั้วต่อ และข้อมูลโหลดเซลล์ของแท่นเดิมก่อนติดต่อฝ่ายขาย</p>,
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
      title: "เปิดคู่มือจับคู่หัวอ่าน",
      detail: "ตรวจพิกัดและการเชื่อมต่อ",
      href: "/guides/indicator-platform-compatibility",
      content: <p>ใช้คู่มือเทียบข้อมูลหัวอ่านและแท่น แล้วตรวจรายละเอียดของชุดจริงก่อนประกอบ</p>,
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
      categoryId="indicators"
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
