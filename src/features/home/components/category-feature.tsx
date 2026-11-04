import { getSettings } from "@/features/cms/server/documents";
import { showcaseDefaults } from "@/features/cms/data/settings";
import type { Product } from "@/features/catalog/types";
import { CategoryFeaturePanels } from "./category-feature-panels";
import { getCatalogPage } from "@/features/catalog/server/catalog-page";
import { productFeatureEntries } from "../data/category-feature-items";
import { defaultHomeImages, type HomeImages } from "../data/image-slots";

export async function CategoryFeature({
  products,
  images = {},
}: {
  products: Product[];
  images?: HomeImages;
}) {
  const copy = await getSettings("showcase", {
    ...showcaseDefaults,
    digitalDescription:
      "เครื่องชั่งดิจิทัล แม่นยำ ทนทาน ครอบคลุมทุกการใช้งานจากโรงงานถึงบ้าน ใช้งานง่าย ตอบโจทย์ทุกความต้องการ",
    accessoriesDescription:
      "เพิ่มศักยภาพระบบด้วยอุปกรณ์เสริมคุณภาพ เชื่อมต่อเครื่องพิมพ์ จอแสดงผล และระบบ POS ได้อย่างลงตัว รองรับทุกการใช้งานทางธุรกิจ",
  });
  const defaults = defaultHomeImages();
  const cards = [
    {
      id: "scales",
      path: "/products",
      title: "เครื่องชั่ง",
      description: copy.digitalDescription,
      image: images.digital ?? defaults.digital,
    },
    {
      id: "accessories",
      path: "/product/scale-accessories",
      title: "อุปกรณ์เสริม",
      description: copy.accessoriesDescription,
      image: images.accessories ?? defaults.accessories,
    },
    {
      id: "platforms",
      path: "/product/scale-platforms",
      title: "โครงสร้างแท่นชั่ง",
      description: "แท่นชั่งตั้งโต๊ะ แท่นชั่งตั้งพื้น แท่นชั่งขนาดใหญ่",
      image: "/videos/ChatGPT Image Nov 4, 2026, 01_57_30 PM.png",
    },
    {
      id: "indicators",
      path: "/Indicator",
      title: "อินดิเคเตอร์แท่นชั่ง",
      description: "ห้องปฏิบัติการ อุตสาหกรรม พาณิชยกรรมและบริการ",
      image: "/videos/ChatGPT Image Nov 4, 2026, 01_57_44 PM.png",
    },
  ] as const;
  const items = await Promise.all(
    cards.map(async (card) => {
      const catalog = await getCatalogPage(card.path, products);
      const entries = productFeatureEntries(catalog?.products ?? []);
      return {
        ...card,
        image: card.image ?? entries[0]?.image ?? "",
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
