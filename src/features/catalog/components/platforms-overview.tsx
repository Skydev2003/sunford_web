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

const topicImages: Readonly<Record<string, string>> = {
  environment: "/images/category-chapters/platforms/sus304.webp",
  size: "/images/category-chapters/platforms/sus201.webp",
  capacity: "/images/category-chapters/platforms/carbon-steel.webp",
  indicators: "/images/products/component-showcase/g107770-front-4k.webp",
};

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
  const guide = guidebookBuyingGuides.find(({ slug }) => slug === "platforms")!;
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
      title: "เลือกแท่นให้ตรงกับหน้างาน",
      detail:
        "แจ้งขนาดภาชนะ น้ำหนักรวม สภาพพื้น และวิธีนำของขึ้นแท่น เพื่อให้ทีมช่วยเทียบวัสดุและโครงสร้างให้เหมาะกับงาน",
      href: sunford.contact,
    },
    {
      title: "ขอใบเสนอราคา",
      detail:
        "ระบุขนาดแท่น วัสดุ และจำนวนที่ต้องการ หากไม่พบราคาของรุ่นที่เลือกในแบบฟอร์ม สอบถามฝ่ายขายได้",
      href: "/service/quotation",
    },
    {
      title: "บริการหลังการขาย",
      detail:
        "แจ้งรุ่นแท่น อาการที่พบ และข้อมูลการซื้อ เพื่อให้ฝ่ายบริการตรวจสอบการส่งซ่อม เปลี่ยน หรือเคลมตามเงื่อนไข",
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
      categoryId="platforms"
      navigation={resolveNavigationItems(navigation.items)}
      readySubcategoryHrefs={readySubcategoryHrefs}
      stories={stories}
      services={services}
      accordion={stories}
    />
  );
}
