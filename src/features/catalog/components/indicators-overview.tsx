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
  G107770: "/images/products/component-showcase/g107770-front-4k.webp",
  G107787: "/images/products/component-showcase/g107787-front-4k.webp",
  G107794: "/images/products/component-showcase/g107794-front-4k.webp",
  G107800: "/images/imported/35fa49963ac8026213d6.png",
  G107848: "/images/imported/70acc6421aded7d28810.png",
  G107817: "/images/imported/12d2d8043dafefed4896.png",
  G107763: "/images/imported/a8e894090dd0add2792d.png",
};

const topics: Readonly<Record<string, { image: string; detail: string }>> = {
  platforms: {
    image: "/images/category-chapters/platforms/sus304.webp",
    detail:
      "เช็กรุ่นแท่น พิกัด และข้อมูลโหลดเซลล์ก่อนเลือกหัวอ่าน หากเปลี่ยนหัวอ่านเดิม ให้ผู้ติดตั้งตรวจขั้วต่อและสายสัญญาณด้วย",
  },
  connections: {
    image: "/images/products/component-showcase/g107770-front-4k.webp",
    detail:
      "ก่อนต่อกับคอมพิวเตอร์หรือเครื่องพิมพ์ ให้ตรวจพอร์ต รูปแบบข้อมูล และการตั้งค่าของอุปกรณ์ทั้งสองฝั่ง แม้สายจะเสียบเข้ากันได้",
  },
  compare: {
    image: "/images/category-chapters/indicators/led.webp",
    detail:
      "เลือกจอ LCD หรือ LED ตามแสงและระยะมอง แล้วเทียบฟังก์ชัน พอร์ต และระดับการป้องกันน้ำและฝุ่นจากสเปกแต่ละรุ่น",
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
    introduction: topics[section.id].detail,
    image: topics[section.id].image,
    href: `${guideHref}#${section.id}`,
    content: <p>{topics[section.id].detail}</p>,
  }));
  const services = [
    {
      title: "จัดชุดให้เข้ากับแท่นชั่ง",
      detail:
        "แจ้งรุ่นแท่น รุ่นหัวอ่านเดิม และอุปกรณ์ที่จะเชื่อมต่อ เพื่อให้ทีมช่วยเลือกชุดก่อนสั่งซื้อ",
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
      categoryId="indicators"
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
