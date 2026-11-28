import Link from "next/link";
import {
  indicatorOverviewFeatures,
  platformIndicatorsPath,
  type OverviewFeature,
} from "../data/catalog-overview-features";
import { platformCatalogSections } from "../data/catalog-submenu-destinations";
import { ProductsOverview } from "./products-overview";
import { SegmentedFilter } from "./segmented-filter";
import { getProductCategories } from "../server/product-categories";
import { buyingGuideHref, guidebookBuyingGuides } from "@/features/content/data/buying-guides";
import { getSettings } from "@/features/site/server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "@/features/site/data/navigation";
import { sunford } from "@/features/home/data/brand";
import styles from "./products-overview.module.css";

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

const topicImages: Readonly<Record<string, string>> = {
  platforms: "/images/category-chapters/platforms/sus304.webp",
  connections: "/images/products/component-showcase/g107770-front-4k.webp",
  compare: "/images/category-chapters/indicators/led.webp",
};

export async function IndicatorsOverview({
  overviewFeature,
}: { overviewFeature?: OverviewFeature } = {}) {
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
  const guide = guidebookBuyingGuides.find(({ slug }) => slug === "indicators")!;
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
  const navigation = await getSettings("navigation", {
    items: defaultNavigation,
    ...defaultNavigationExtras,
  });
  return (
    <ProductsOverview
      products={products}
      categories={[category]}
      cardNames={cardNames}
      categoryId="indicators"
      overviewFeature={overviewFeature}
      primaryLineupId={platformCatalogSections.indicators}
      listingHref={platformIndicatorsPath}
      listingFilters={
        <nav className={styles.lineupFilters} aria-label="คุณสมบัติอินดิเคเตอร์">
          <SegmentedFilter value={overviewFeature?.id ?? "all"}>
            <Link
              href={platformIndicatorsPath}
              scroll={false}
              aria-current={overviewFeature ? undefined : "true"}
            >
              ทุกผลิตภัณฑ์
            </Link>
            {indicatorOverviewFeatures.map(([id, label]) => (
              <Link
                key={id}
                href={`${platformIndicatorsPath}?feature=${id}`}
                scroll={false}
                aria-current={overviewFeature?.id === id ? "true" : undefined}
              >
                {label}
              </Link>
            ))}
          </SegmentedFilter>
        </nav>
      }
      navigation={resolveNavigationItems(navigation.items)}
      readySubcategoryHrefs={readySubcategoryHrefs}
      stories={stories}
      services={services}
      accordion={stories}
    />
  );
}
