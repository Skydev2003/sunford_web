import type { OverviewFeature } from "../data/catalog-overview-features";
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
  G108029: "/images/products/software-showcase/p1-front-4k.webp",
  G108012: "/images/products/software-showcase/p1w-front-4k.webp",
  G108050: "/images/products/software-showcase/p4-front-4k.webp",
};

const topicImages: Readonly<Record<string, string>> = {
  systems: "/images/category-chapters/pos/windows.webp",
  workflows: "/images/products/software-showcase/pos-android.webp",
  scales: "/images/category-chapters/pos/android.webp",
};

export async function POSOverview({ overviewFeature }: { overviewFeature?: OverviewFeature } = {}) {
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
      const localPhoto = product.warehouseSku && modelPhotos[product.warehouseSku];
      if (!localPhoto) return product;
      if (!product.image) return { ...product, image: localPhoto };
      if (!product.fallbackImage && product.image !== localPhoto)
        return { ...product, fallbackImage: localPhoto };
      return product;
    });
  const guide = guidebookBuyingGuides.find(({ slug }) => slug === "pos")!;
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
      title: "เลือกชุด POS สำหรับร้าน",
      detail:
        "แจ้งซอฟต์แวร์ที่ร้านใช้ พร้อมรุ่นเครื่องชั่งและเครื่องพิมพ์ เพื่อให้ทีมช่วยเลือกชุดที่ใช้ร่วมกันได้",
      href: sunford.contact,
    },
    {
      title: "ขอใบเสนอราคา",
      detail: "ระบุรุ่นและจำนวนในแบบฟอร์ม หากไม่พบราคาของรุ่นที่ต้องการ สอบถามฝ่ายขายได้",
      href: "/service/quotation",
    },
    {
      title: "บริการหลังการขาย",
      detail:
        "เตรียมชื่อรุ่น อาการที่พบ และข้อมูลการซื้อ ก่อนติดต่อฝ่ายบริการเพื่อส่งตรวจ ซ่อม เปลี่ยน หรือเคลมตามเงื่อนไข",
      href: sunford.service,
    },
    {
      title: "ลงทะเบียนรับประกัน",
      detail:
        "เตรียมหลักฐานการซื้อและข้อมูลรุ่นเพื่อลงทะเบียน แล้วตรวจเงื่อนไขความคุ้มครองของรุ่นที่ซื้อ",
      href: sunford.warranty,
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
      categoryId="pos"
      overviewFeature={overviewFeature}
      navigation={resolveNavigationItems(navigation.items)}
      readySubcategoryHrefs={readySubcategoryHrefs}
      stories={stories}
      services={services}
      accordion={stories}
    />
  );
}
