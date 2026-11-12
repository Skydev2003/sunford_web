import type { Product } from "@/features/catalog/types";
import { warehouseFact } from "@/features/catalog/data/warehouse-site-data";

export type WeighingOption = {
  code: string;
  displayName?: string;
  description: string;
  group: string;
  kind: "head" | "platform" | "accessory";
  image: string;
  fallbackImage?: string;
  productId?: string;
  price: number | null;
  detailHref: string;
  sku?: string;
  includesHead?: boolean;
  netUnitSatang?: number | null;
  compatibleCodes?: string[];
};
export function getWeighingOptions(products: Product[]): WeighingOption[] {
  const heads = products.filter((p) => p.warehouseCategoryId === "indicators");
  const platforms = products.filter(
    (p) =>
      p.warehouseCategoryId === "platforms" ||
      (p.warehouseCategoryId === "scales" &&
        /\b(?:TCS|FCS|TIS|TSS|TMS|CSS|VCS|DCS|BCS|BSS|FSS)[-\d]/i.test(p.warehouseName ?? "")),
  );
  const accessories = products.filter((p) => p.warehouseCategoryId === "accessories");
  const knownPairs = new Map<string, Set<string>>();
  for (const platform of platforms) {
    const headFact = warehouseFact(platform, "รุ่นหัวอ่านที่รองรับ");
    for (const head of heads) {
      const platformFact = warehouseFact(head, "รุ่นแท่นชั่งที่รองรับ");
      const tokens = (value: string) => value.split(/[,;\n/]+/).map((x) => x.trim().toUpperCase());
      const matches = (value: string, p: Product) =>
        tokens(value).some(
          (x) => x === p.warehouseSku?.toUpperCase() || x === p.name.toUpperCase(),
        );
      if (
        matches(headFact, head) ||
        matches(platformFact, platform) ||
        platform.warehouseComponents?.some((c) => c.sku === head.warehouseSku)
      ) {
        const set = knownPairs.get(head.warehouseSku!) ?? new Set<string>();
        set.add(platform.warehouseSku!);
        knownPairs.set(head.warehouseSku!, set);
      }
    }
  }
  return [...heads, ...platforms, ...accessories].map((p) => {
    const kind = heads.includes(p) ? "head" : platforms.includes(p) ? "platform" : "accessory";
    const compatibleCodes =
      kind === "head"
        ? [...(knownPairs.get(p.warehouseSku!) ?? [])]
        : kind === "platform"
          ? [...knownPairs].filter(([, v]) => v.has(p.warehouseSku!)).map(([sku]) => sku)
          : [];
    return {
      code: p.warehouseSku!,
      displayName: p.name,
      description: p.subtitle || p.description,
      group: p.warehouseGroup ?? "",
      kind,
      image: p.image,
      productId: p.id,
      price: p.price ?? null,
      detailHref: `/products/${p.slug}`,
      sku: p.warehouseSku,
      includesHead:
        kind === "platform" &&
        Boolean(p.warehouseComponents?.some((c) => heads.some((h) => h.warehouseSku === c.sku))),
      netUnitSatang: p.warehouseNetUnitSatang,
      compatibleCodes,
    };
  });
}
