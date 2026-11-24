import { ProductsOverview } from "./products-overview";
import { getProductCategories } from "../server/product-categories";
import { buyingGuideHref, guidebookBuyingGuides } from "@/features/content/data/buying-guides";
import { getSettings } from "@/features/site/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { sunford } from "@/features/home/data/brand";

// Catalogue photographs are used only for the matching Warehouse model.
const modelPhotos: Readonly<Record<string, string>> = {
  G106131: "/images/products/scale-showcase/g106131-front-4k.webp",
  G106643: "/images/products/scale-showcase/g106643-front-4k.webp",
  G106094: "/images/products/scale-showcase/g106094-front-4k.webp",
  G106193: "/images/products/scale-showcase/g106193-front-4k.webp",
};

const topicImages: Readonly<Record<string, string>> = {
  capacity: "/images/products/scale-showcase/g106131-front-4k.webp",
  resolution: "/images/products/scale-showcase/g106643-front-4k.webp",
  compare: "/images/category-chapters/scales/price.webp",
};

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
  const guide = guidebookBuyingGuides.find(({ slug }) => slug === "scales")!;
  const stories = guide.sections.map((section) => ({
    id: section.id,
    title: section.title,
    introduction: section.advice,
    image: topicImages[section.id],
    href: buyingGuideHref(guide.slug, section.id),
    content: <p>{section.advice}</p>,
  }));
  const services = [
    {
      title: "ชั่งซื้อขายได้อย่างมั่นใจ",
      detail:
        "มีใบรับรองการสอบเทียบเครื่องมือวัด ที่แสดงผลการสอบเทียบพร้อมค่าวความไม่แน่นอนในการวัดตามมาตรฐาน ISO/IEC 17025 ที่ช่วยสร้างความเชื่อมั่นให้ผู้ประกอบการ ในการควบคุมต้นทุน และการปรับปรุงประสิทธิภาพการผลิต",
      href: "/products/category/scales/price",
    },
    {
      title: "รับประกันสูงสุดถึง 3 ปี",
      detail:
        "ศูนย์บริการบางเลน จ.นครปฐม รับตรวจและซ่อมทั้งในและหลังประกัน พร้อมอะไหล่ในประเทศ ความคุ้มครองขึ้นอยู่กับรุ่น",
      href: sunford.warrantyPolicy,
    },
    {
      title: "การใช้งานหลากหลาย",
      detail:
        "มีรุ่นปุ่มภาษาไทยและไทย–อังกฤษ รุ่นจอสองด้าน และรุ่นคำนวณเงินทอน สำหรับพื้นที่เปียกมีรุ่น IP67 และแท่นสเตนเลส SUS304",
      href: "/products/category/scales/industrial",
    },
    {
      title: "จากหน้าร้านถึงโรงงาน",
      detail:
        "มีทั้งเครื่องชั่งคิดราคา เครื่องชั่งพิมพ์ฉลาก และแท่นชั่งอุตสาหกรรม รุ่นที่รองรับเชื่อมข้อมูลการชั่งกับ SUNFORD POS และ Cloud POS ได้",
      href: sunford.downloads,
    },
  ];
  const navigation = await getSettings("navigation", {
    items: defaultNavigation,
    ...defaultNavigationExtras,
  });
  return (
    <ProductsOverview
      products={products}
      categories={[category]}
      cardNames={cardNames}
      categoryId="scales"
      navigation={resolveNavigationItems(navigation.items)}
      readySubcategoryHrefs={readySubcategoryHrefs}
      stories={stories}
      services={services}
      accordion={stories}
    />
  );
}
