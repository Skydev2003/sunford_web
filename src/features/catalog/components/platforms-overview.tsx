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

// Legacy stand-alone platform photos verified against their Warehouse SKU and size.
const modelPhotos: Readonly<Record<string, string>> = {
  G107510: "/images/imported/347f70775613b9706d42.png",
  G107527: "/images/imported/96f05f244ed4f52631e6.png",
  G107534: "/images/imported/1534540d1d3eedbfc3dc.png",
  G107541: "/images/imported/a90bac4ef7d41f341a22.png",
  G107558: "/images/imported/73affb8e71209dc1f9bb.png",
  G107565: "/images/imported/0ed3cc6ed76d803f0139.png",
  G107572: "/images/imported/75accd084f5db8791ed2.png",
  G107589: "/images/imported/0305d9db630d571d6d84.png",
  G107596: "/images/imported/269ef3127cbbc0907a14.png",
  G107602: "/images/imported/aba98861513472429b71.png",
  G107619: "/images/imported/430a724fef459d748451.png",
  G107626: "/images/imported/9fe1a4617f0394d5ccf6.png",
  G107633: "/images/imported/e9d32c0db502fd0f9717.png",
  G107640: "/images/imported/5a8c450d126a23152282.png",
  G107657: "/images/imported/7557c79447a8a5f71165.png",
  G107664: "/images/imported/f03fd071497037c3e90f.png",
  G107671: "/images/imported/0df2cedfd9dd9e48cbb2.png",
  G107701: "/images/imported/70ccb27b4aab09b1d298.png",
  G107718: "/images/imported/73e68501627a43fb96b6.png",
  G107725: "/images/imported/99e73f8a97d3c8bbdd09.png",
  G107732: "/images/imported/68cfe52031574214baf0.png",
  G107749: "/images/imported/5922ef5e5d2c1fc27eea.png",
  G107756: "/images/imported/612b35e7737a02b05731.png",
};

const topics: Readonly<Record<string, { introduction: string; image: string; detail: string }>> = {
  environment: {
    introduction: "ตรวจวัสดุและการป้องกันน้ำของทั้งแท่น โหลดเซลล์ สาย และหัวอ่าน",
    image: "/images/category-chapters/platforms/sus304.webp",
    detail:
      "ตรวจวิธีทำความสะอาดจากคู่มือ หน้าแท่นสแตนเลสอย่างเดียวไม่ยืนยันว่าหัวอ่านหรือขั้วต่อรับน้ำได้",
  },
  size: {
    introduction: "วัดขนาดของที่ใหญ่ที่สุด และเผื่อพื้นที่ยกหรือเข็นขึ้นแท่น",
    image: "/images/category-chapters/platforms/sus201.webp",
    detail:
      "เผื่อพื้นที่ติดตั้งและทางเดินรอบแท่น ถ้าใช้รถเข็น ให้ตรวจความสูงและวิธีนำของขึ้นแท่นด้วย",
  },
  capacity: {
    introduction: "รวมน้ำหนักสินค้า ภาชนะ และอุปกรณ์ที่อยู่บนแท่นขณะชั่ง",
    image: "/images/category-chapters/platforms/carbon-steel.webp",
    detail:
      "เทียบพิกัดรวมของชุดแท่นและหัวอ่านกับน้ำหนักที่ใช้งาน ตรวจตำแหน่งวางของและข้อจำกัดของรุ่นในคู่มือ",
  },
  indicators: {
    introduction: "ใช้ข้อมูลโหลดเซลล์ พิกัด และความละเอียดเลือกหัวอ่าน",
    image: "/images/products/component-showcase/g107770-front-4k.webp",
    detail:
      "เตรียมรุ่นโหลดเซลล์และพิกัดแท่น แล้วตรวจขั้วต่อ หน่วยที่แสดง และฟังก์ชันที่ต้องใช้ เช่น แสดงผลระยะไกลหรือส่งข้อมูล",
  },
};

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function PlatformsOverview() {
  const {
    products: catalogProducts,
    categories,
    cardNames,
    readySubcategoryHrefs,
  } = await getProductCategories();
  const category = categories.find(({ id }) => id === "platforms")!;
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
  const guide = buyingGuides.find(({ slug }) => slug === "platforms")!;
  const guideHref = "/guides/platforms";
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
      title: "เลือกแท่นให้ตรงกับหน้างาน",
      detail: "แจ้งขนาดภาชนะ น้ำหนักรวม และสภาพพื้นที่",
      href: sunford.contact,
      content: <p>แจ้งวิธีนำของขึ้นแท่น สภาพพื้น และความชื้น เพื่อเทียบโครงสร้างและวัสดุ</p>,
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
      title: "จัดสเปกแท่นกับหัวอ่าน",
      detail: "ตรวจโหลดเซลล์และอุปกรณ์ที่ใช้ร่วมกัน",
      href: "/guides/indicator-platform-compatibility",
      content: <p>เตรียมสเปกแท่นและโหลดเซลล์เพื่อเทียบหัวอ่านก่อนประกอบ</p>,
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
      categoryId="platforms"
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
