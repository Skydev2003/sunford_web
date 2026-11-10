import type { Product } from "@/features/catalog/types";
import { getAccessorySubcategories } from "@/features/catalog/data/accessory-subcategories";
import { findScaleModel } from "@/features/catalog/data/scale-subcategories";
import { weighingAccessories, weighingGroups } from "./indicator-platform-compatibility";

export type WeighingOption = {
  code: string;
  description: string;
  group: string;
  kind: "head" | "platform" | "accessory";
  image: string;
  productId?: string;
  price: number | null;
  detailHref: string;
  sku?: string;
  includesHead?: boolean;
  netUnitSatang?: number | null;
};
export function getWeighingOptions(products: Product[]): WeighingOption[] {
  const warehouse = products.some((product) => product.warehouseSku);
  const normalize = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const productByCode = new Map(products.map((p) => [p.name.trim().toUpperCase(), p]));
  const byId = new Map(products.map((product) => [product.id, product]));
  const accessories = new Map(
    getAccessorySubcategories(products).flatMap((group) =>
      (group.entries ?? []).flatMap((entry) =>
        entry.productId ? [[entry.model, byId.get(entry.productId)] as const] : [],
      ),
    ),
  );
  const option = (
    code: string,
    description: string,
    group: string,
    kind: WeighingOption["kind"],
  ): WeighingOption => {
    const mapped = products.filter((product) =>
      product.warehouseModelCodes?.some((model) => normalize(model) === normalize(code)),
    );
    const product = warehouse
      ? mapped.length === 1
        ? mapped[0]
        : undefined
      : kind === "platform"
        ? findScaleModel(products, code)
        : kind === "accessory"
          ? (accessories.get(code) ?? findScaleModel(products, code))
          : (productByCode.get(code.toUpperCase()) ??
            productByCode.get(code.replace(/^Indicator-/, "Indicator ").toUpperCase()));
    return {
      code,
      description,
      group,
      kind,
      productId: product?.id,
      detailHref: product ? `/products/${product.slug}` : `#${kind}-card-${code}`,
      image: product?.image ?? "",
      price: !warehouse && kind === "platform" ? null : (product?.price ?? null),
      sku: product?.warehouseSku,
      netUnitSatang: product?.warehouseNetUnitSatang,
      includesHead: warehouse && kind === "platform" && Boolean(product),
    };
  };
  return [
    ...weighingGroups.flatMap((group) =>
      group.heads.split(" / ").map((code) => option(code, group.purpose, group.title, "head")),
    ),
    ...weighingGroups.flatMap((group) =>
      group.platforms.flatMap(([description, codes]) =>
        codes
          .split(", ")
          .map((code) => option(code, description.split(" · ")[0], group.title, "platform")),
      ),
    ),
    ...weighingAccessories.flatMap(([codes, description]) =>
      codes.split(" / ").map((code) => option(code, description, "", "accessory")),
    ),
  ]
    .filter((option) => !warehouse || Boolean(option.productId))
    .sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
}
