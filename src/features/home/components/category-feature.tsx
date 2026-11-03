import { getSettings } from "@/features/cms/server/documents";
import { showcaseDefaults } from "@/features/cms/data/settings";
import type { Product } from "@/features/catalog/types";
import { resolveHomeLink, type HomeLinkTargets } from "../data/link-targets";
import { CategoryFeaturePanels } from "./category-feature-panels";
import { getCatalogPage } from "@/features/catalog/server/catalog-page";
import { getContentPage } from "@/features/content/server/content-repository";
import { pageFeatureEntries, productFeatureEntries } from "../data/category-feature-items";
import { defaultHomeImages, type HomeImages } from "../data/image-slots";

export async function CategoryFeature({
  products,
  targets,
  images = {},
}: {
  products: Product[];
  targets: HomeLinkTargets;
  images?: HomeImages;
}) {
  const copy = await getSettings("showcase", {
    ...showcaseDefaults,
    digitalDescription:
      "เครื่องชั่งดิจิทัล แม่นยำ ทนทาน ครอบคลุมทุกการใช้งานจากโรงงานถึงบ้าน ใช้งานง่าย ตอบโจทย์ทุกความต้องการ",
    smartDescription:
      "เครื่องชั่งอัจฉริยะ จัดการง่ายในยุคดิจิทัล รองรับการประมวลผล จัดเก็บข้อมูล และเชื่อมต่ออุปกรณ์อื่น เหมาะสำหรับธุรกิจที่ต้องการความแม่นยำและคล่องตัว",
    accessoriesDescription:
      "เพิ่มศักยภาพระบบด้วยอุปกรณ์เสริมคุณภาพ เชื่อมต่อเครื่องพิมพ์ จอแสดงผล และระบบ POS ได้อย่างลงตัว รองรับทุกการใช้งานทางธุรกิจ",
    softwareDescription:
      "จัดการง่าย แสดงผลครบ จบด้วยซอฟต์แวร์เดียว รองรับการติดตาม วิเคราะห์ และรายงานแบบเรียลไทม์ เพื่อการตัดสินใจที่แม่นยำ",
  });
  const cards = [
    {
      id: "digital",
      label: copy.digitalEnglish,
      title: copy.digitalName,
      description: copy.digitalDescription,
    },
    {
      id: "smart",
      label: copy.smartEnglish,
      title: copy.smartName,
      description: copy.smartDescription,
    },
    {
      id: "accessories",
      label: copy.accessoriesName,
      title: copy.accessoriesName,
      description: copy.accessoriesDescription,
    },
    {
      id: "software",
      label: copy.softwareName,
      title: copy.softwareName,
      description: copy.softwareDescription,
    },
  ] as const;
  const defaults = defaultHomeImages();
  const items = await Promise.all(
    cards.map(async (card) => {
      const href = resolveHomeLink(card.id, targets[card.id], products);
      const targetProduct = targets[card.id]?.productId;
      // MES is the existing CTA; the dedicated smart-scale page owns product membership.
      const path =
        card.id === "smart" && href?.toLowerCase() === "/product/mes" && !targetProduct
          ? "/product/smart-weighing"
          : href;
      const catalog = path && !targetProduct ? await getCatalogPage(path, products) : undefined;
      const entries = !href
        ? []
        : targetProduct
          ? productFeatureEntries(products.filter((product) => product.id === targetProduct))
          : catalog
            ? productFeatureEntries(catalog.products)
            : pageFeatureEntries(path ? await getContentPage(path) : undefined, products);
      const image = images[card.id] ?? defaults[card.id]!;
      return {
        ...card,
        image,
        entries,
        companionImage:
          card.id === "accessories" && !images.accessories ? "/images/pd/RYG-POLE.png" : undefined,
      };
    }),
  );
  return (
    <CategoryFeaturePanels
      key={items.map((item) => `${item.image}|${item.companionImage ?? ""}`).join("|")}
      items={items}
    />
  );
}
