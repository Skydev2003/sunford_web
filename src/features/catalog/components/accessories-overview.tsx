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

const topics: Readonly<Record<string, { image: string; detail: string }>> = {
  compatibility: {
    image: "/images/products/category-families/accessories.webp",
    detail:
      "จดรุ่นเครื่องชั่งหรือระบบ POS ที่ใช้อยู่ แล้วเทียบพอร์ตและขั้วต่อกับรายการอุปกรณ์ที่คู่มือระบุว่ารองรับ",
  },
  printers: {
    image: "/images/products/category-cutouts/thermal-receipt-printer.webp",
    detail:
      "เลือกตามงานพิมพ์สลิปหรือฉลาก แล้วตรวจขนาดที่พิมพ์ได้ พอร์ตเชื่อมต่อ และซอฟต์แวร์ที่เครื่องพิมพ์รองรับ",
  },
  consumables: {
    image: "/images/imported/b75fc9d2b3417192cc3c.png",
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
  const guide = buyingGuides.find(({ slug }) => slug === "accessories")!;
  const guideHref = "/guides/accessories";
  const stories = guide.sections.map((section) => ({
    id: section.id,
    title: section.title,
    introduction: topics[section.id].detail,
    image: topics[section.id].image,
    href: `${guideHref}#${section.id}`,
    content: (
      <>
        <p>{topics[section.id].detail}</p>
        {section.id === "consumables" &&
          section.links.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label} ›
            </Link>
          ))}
      </>
    ),
  }));
  const services = [
    {
      title: "เลือกอุปกรณ์ที่ใช้ร่วมกัน",
      detail:
        "แจ้งรุ่นเครื่องชั่งหรือระบบ POS พร้อมรูปพอร์ตหรือขั้วต่อ เพื่อให้ทีมช่วยเลือกอุปกรณ์ที่รองรับ",
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
      accordion={stories}
    />
  );
}
