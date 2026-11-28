import type { OverviewFeature } from "../data/catalog-overview-features";
import Link from "next/link";
import { ProductsOverview } from "./products-overview";
import { getProductCategories } from "../server/product-categories";
import { getStorefrontProducts } from "../server/product-repository";
import { additionalAccessorySubcategoryPages } from "../data/additional-subcategory-pages";
import { buyingGuideHref, guidebookBuyingGuides } from "@/features/content/data/buying-guides";
import { getSettings } from "@/features/site/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { sunford } from "@/features/home/data/brand";

const topicImages: Readonly<Record<string, string>> = {
  compatibility: "/images/products/category-families/accessories.webp",
  printers: "/images/products/category-cutouts/thermal-receipt-printer.webp",
  consumables: "/images/imported/b75fc9d2b3417192cc3c.png",
};

export async function AccessoriesOverview({
  overviewFeature,
}: { overviewFeature?: OverviewFeature } = {}) {
  const {
    products: catalogProducts,
    categories,
    cardNames,
    readySubcategoryHrefs,
  } = await getProductCategories();
  const category = categories.find(({ id }) => id === "accessories")!;
  const ids = new Set(category.productIds);
  const products = catalogProducts.filter(({ id }) => ids.has(id));
  const guide = guidebookBuyingGuides.find(({ slug }) => slug === "accessories")!;
  const stories = guide.sections.map((section) => ({
    id: section.id,
    title: section.title,
    introduction: section.advice,
    image: topicImages[section.id],
    href: buyingGuideHref(guide.slug, section.id),
    content: (
      <>
        <p>{section.advice}</p>
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
  const [navigation, warehouseProducts] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
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
      overviewFeature={overviewFeature}
      navigation={resolveNavigationItems(navigation.items)}
      readySubcategoryHrefs={readySubcategoryHrefs}
      stories={stories}
      services={services}
      accordion={stories}
    />
  );
}
