import { getSettings } from "@/features/cms/server/documents";
import { showcaseDefaults } from "@/features/cms/data/settings";
import type { Product } from "@/features/catalog/types";
import { resolveHomeLink, type HomeLinkTargets } from "../data/link-targets";
import { CategoryFeaturePanels } from "./category-feature-panels";

export async function CategoryFeature({
  products,
  targets,
}: {
  products: Product[];
  targets: HomeLinkTargets;
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
  return (
    <CategoryFeaturePanels
      linkLabel={copy.linkLabel}
      items={cards.map((card) => ({
        ...card,
        image: `/images/home-categories/${card.id}.webp`,
        href: resolveHomeLink(card.id, targets[card.id], products),
      }))}
    />
  );
}
