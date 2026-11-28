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
  connections?: string[];
};

function includesProduct(value: string, product: Product) {
  const tokens = value
    .split(/[,;\n/]+/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
  return [product.warehouseSku, product.warehouseName, product.name].some(
    (name) => name && tokens.includes(name.toUpperCase()),
  );
}

export function getWeighingOptions(products: Product[]): WeighingOption[] {
  products = products.filter((product) => product.warehouseSku);
  const heads = products.filter((p) => p.warehouseCategoryId === "indicators");
  const platforms = products.filter(
    (p) =>
      p.warehouseCategoryId === "platforms" ||
      (p.warehouseCategoryId === "scales" &&
        /\b(?:TCS|FCS|TIS|TSS|TMS|CSS|VCS|DCS|BCS|BSS|FSS)[-\d]/i.test(p.warehouseName ?? "")),
  );
  const accessories = products.filter((p) => p.warehouseCategoryId === "accessories");
  const knownPairs = new Map<string, Set<string>>();
  const bundledHeads = new Map<string, string[]>();
  for (const platform of platforms) {
    const headFact = warehouseFact(platform, "รุ่นหัวอ่านที่รองรับ");
    const included = heads
      .filter((head) => platform.warehouseComponents?.some(({ sku }) => sku === head.warehouseSku))
      .map((head) => head.warehouseSku!);
    bundledHeads.set(platform.warehouseSku!, included);
    for (const head of heads) {
      const platformFact = warehouseFact(head, "รุ่นแท่นชั่งที่รองรับ");
      if (
        included.length
          ? included.includes(head.warehouseSku!)
          : includesProduct(headFact, head) || includesProduct(platformFact, platform)
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
          : heads
              .filter((head) => includesProduct(warehouseFact(p, "รุ่นหัวอ่านที่รองรับ"), head))
              .map((head) => head.warehouseSku!);
    return {
      code: p.warehouseSku!,
      displayName: p.name,
      description: p.subtitle || p.description,
      group: p.warehouseGroup ?? "",
      kind,
      image: p.image,
      fallbackImage: p.fallbackImage,
      productId: p.id,
      price: p.price ?? null,
      detailHref: `/products/${p.slug}`,
      sku: p.warehouseSku,
      includesHead: kind === "platform" && Boolean(bundledHeads.get(p.warehouseSku!)?.length),
      netUnitSatang: p.warehouseNetUnitSatang,
      compatibleCodes,
      connections: p.warehouseSpecifications
        ?.filter(
          ({ label, value }) => /เชื่อมต่อ|พอร์ต|port|interface/i.test(label) && value.trim(),
        )
        .map(({ value }) => value.trim()),
    };
  });
}
