import "server-only";
import {
  hasDeviceConnection,
  additionalScaleSubcategoryPages,
} from "../data/additional-subcategory-pages";
import {
  indicatorOverviewFeatures,
  platformStructureTypes,
  scaleOverviewFeatures,
  type OverviewFeature,
} from "../data/catalog-overview-features";
import { getProductListingFeatures } from "../data/product-listing-features";
import {
  getProductSubcategoryPage,
  resolveListingSubcategory,
} from "../data/product-subcategory-pages";
import { warehouseFact } from "../data/warehouse-site-data";
import { getProductCategories } from "./product-categories";
import { getStorefrontProducts } from "./product-repository";

const filterIds: Record<string, string> = {
  waterproof: "water-resistant",
  counting: "scale-counting",
  checkweighing: "scale-checkweighing",
};

export async function getOverviewFeature(
  categoryId: string,
  feature: string,
  group?: string,
): Promise<OverviewFeature | undefined> {
  const [{ categories }, products] = await Promise.all([
    getProductCategories(),
    getStorefrontProducts(),
  ]);
  const category = categories.find(({ id }) => categoryId === id);
  if (!category) return;
  const categoryIds = new Set(category.productIds);
  if (categoryId === "platforms") {
    const structure = platformStructureTypes.find(({ id }) => id === feature);
    if (!structure) return;
    const benchProducts = new Set(
      category.subcategories.find(({ id }) => id === "platform-benchtop")?.productIds,
    );
    const normalized = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "");
    const productIds = products
      .filter(
        (product) =>
          categoryIds.has(product.id) &&
          ((feature === "bench-top" && benchProducts.has(product.id)) ||
            product.warehouseSpecifications?.some(
              ({ label, value }) =>
                /^(?:ประเภทแท่นชั่ง|ลักษณะโครงสร้าง|รูปแบบแท่นชั่ง|platform type)$/i.test(
                  label.trim(),
                ) && normalized(value) === normalized(structure.label),
            )),
      )
      .map(({ id }) => id);
    return { id: feature, label: structure.label, productIds };
  }
  if (categoryId === "indicators") {
    const configured = indicatorOverviewFeatures.find(([id]) => id === feature);
    if (!configured) return;
    const extra = additionalScaleSubcategoryPages.find(({ id }) => id === filterIds[feature]);
    const productIds = products
      .filter((product) => {
        if (!categoryIds.has(product.id)) return false;
        switch (feature) {
          case "connectivity":
            return hasDeviceConnection(product);
          case "waterproof":
            return product.warehouseSubcategoryIds?.includes("indicator-waterproof");
          case "price-computing":
            return /^(รองรับ|ใช่|yes|true)$/i.test(
              warehouseFact(product, "คำนวณราคาสินค้า").trim(),
            );
          default:
            return extra?.matches(product);
        }
      })
      .map(({ id }) => id);
    return { id: feature, label: configured[1], productIds };
  }
  const definition = group ? getProductSubcategoryPage(group, categoryId) : undefined;
  if (group && !definition) return;
  const scoped = definition ? resolveListingSubcategory(definition, category, products) : undefined;
  if (definition && !scoped) return;
  const ids = new Set(scoped?.productIds ?? category.productIds);
  const matched = getProductListingFeatures(
    categoryId,
    group ?? "",
    products.filter(({ id }) => ids.has(id)),
  ).find(({ id }) => id === (filterIds[feature] ?? feature));
  const configured = scaleOverviewFeatures.find(([id]) => id === feature);
  const label = matched?.label ?? (categoryId === "scales" ? configured?.[1] : undefined);
  if (label) return { id: feature, label, productIds: matched?.productIds ?? [] };
}
