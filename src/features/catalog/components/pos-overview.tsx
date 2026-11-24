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

// Catalogue photographs are used only for the matching Warehouse model.
const modelPhotos: Readonly<Record<string, string>> = {
  G108029: "/images/products/software-showcase/p1-front-4k.webp",
  G108012: "/images/products/software-showcase/p1w-front-4k.webp",
  G108050: "/images/products/software-showcase/p4-front-4k.webp",
};

const topics: Readonly<Record<string, { image: string; detail: string }>> = {
  systems: {
    image: "/images/category-chapters/pos/windows.webp",
    detail:
      "ชุด P1 เป็นตัวเลือก Android และชุด P1W เป็นตัวเลือก Windows ให้ตรวจระบบที่ซอฟต์แวร์ เครื่องพิมพ์ และอุปกรณ์ของร้านรองรับก่อนเลือก",
  },
  workflows: {
    image: "/images/products/software-showcase/pos-android.webp",
    detail:
      "เริ่มจากงานขายจริงของร้าน ทดลองรับน้ำหนัก คำนวณราคา และพิมพ์ตัวอย่าง ตรวจว่าชนิดเอกสารและฉลากตรงกับที่ใช้",
  },
  scales: {
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
      const localPhoto = product.warehouseSku && modelPhotos[product.warehouseSku];
      if (!localPhoto) return product;
      if (!product.image) return { ...product, image: localPhoto };
      if (!product.fallbackImage && product.image !== localPhoto)
        return { ...product, fallbackImage: localPhoto };
      return product;
    });
  const guide = buyingGuides.find(({ slug }) => slug === "pos")!;
  const guideHref = "/guides/pos";
  const stories = guide.sections.map((section) => ({
    id: section.id,
    title: section.title,
    introduction: topics[section.id].detail,
    image: topics[section.id].image,
    href: `${guideHref}#${section.id}`,
    content: <p>{topics[section.id].detail}</p>,
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
      accordion={stories}
    />
  );
}
