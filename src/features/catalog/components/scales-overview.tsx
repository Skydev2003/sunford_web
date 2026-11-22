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
  G106131: "/images/products/scale-showcase/g106131-front-4k.webp",
  G106643: "/images/products/scale-showcase/g106643-front-4k.webp",
  G106094: "/images/products/scale-showcase/g106094-front-4k.webp",
  G106193: "/images/products/scale-showcase/g106193-front-4k.webp",
};

const topics: Readonly<Record<string, { introduction: string; image: string; detail: string }>> = {
  capacity: {
    introduction: "ชั่งสินค้ารวมภาชนะ แล้วเลือกพิกัดและขนาดจานให้พอกับงาน",
    image: "/images/products/scale-showcase/g106131-front-4k.webp",
    detail:
      "ชั่งวัตถุดิบเล็กน้อยกับชั่งสินค้าทั้งลังต้องใช้คนละช่วงน้ำหนัก วัดขนาดภาชนะที่ใช้จริงก่อนตรวจพิกัดและจานชั่งของรุ่นที่สนใจ",
  },
  resolution: {
    introduction: "เทียบค่าละเอียดกับหน่วยที่ต้องใช้ และอ่านค่าความคลาดเคลื่อนในสเปก",
    image: "/images/products/scale-showcase/g106643-front-4k.webp",
    detail:
      "ค่าละเอียดคือขั้นเล็กสุดที่จอแสดง อ่านค่าความคลาดเคลื่อนและเงื่อนไขในคู่มือแยกต่างหาก โดยเฉพาะเมื่อชั่งปริมาณน้อย",
  },
  compare: {
    introduction: "เทียบพิกัด จานชั่ง และฟังก์ชัน เช่น คำนวณราคาหรือพิมพ์ฉลาก",
    image: "/images/category-chapters/scales/price.webp",
    detail:
      "เลือกเปรียบเทียบจากการ์ดสินค้า แล้วเช็กว่าฟังก์ชันที่ต้องใช้มีในรุ่นนั้น เช่น นับชิ้น คำนวณราคา หรือพิมพ์ฉลาก",
  },
};

async function getCopyrightYear() {
  "use cache";
  return new Date().getFullYear();
}

export async function ScalesOverview() {
  const {
    products: catalogProducts,
    categories,
    cardNames,
    readySubcategoryHrefs,
  } = await getProductCategories();
  const category = categories.find(({ id }) => id === "scales")!;
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
  const guide = buyingGuides.find(({ slug }) => slug === "scales")!;
  const guideHref = "/guides/scales";
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
          {section.links.map(({ href, label }) =>
            href === guide.productHref ? (
              <Link key={href} href="/products/category/scales/applications">
                เลือกเครื่องชั่งตามการใช้งาน <span aria-hidden="true">›</span>
              </Link>
            ) : (
              <Link key={href} href={href}>
                {label} ›
              </Link>
            ),
          )}
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
      title: "เลือกเครื่องชั่ง",
      detail: "แจ้งน้ำหนัก ภาชนะ และพื้นที่วางเครื่อง",
      href: sunford.contact,
      content: <p>เตรียมน้ำหนักต่ำสุดและสูงสุด รวมภาชนะ และขนาดจานที่ต้องใช้ก่อนคุยกับฝ่ายขาย</p>,
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
      detail: "ตรวจพิกัดและความละเอียดตามรุ่น",
      href: "/technical-specification",
      content: <p>ค้นด้วยรุ่นหรือ SKU เพื่ออ่านสเปกและคู่มือที่มีข้อมูลยืนยัน</p>,
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
      categoryId="scales"
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
