import { productCategoryDefinitions } from "./mock-categories";
import type { ProductCategory } from "./mock-categories";
import type { Product, ProductCardData } from "../types";
import { getIndicatorSubcategories } from "./indicator-subcategories";
import { platformSubcategoryDefinitions } from "./platform-subcategory-definitions";
import { getPosSubcategories } from "./pos-subcategories";
import { accessorySubcategoryDefinitions } from "./accessory-subcategories";
import { scaleSubcategoryPages, type ScaleReturnContext } from "./scale-subcategory-pages";
import {
  additionalAccessorySubcategoryPages,
  additionalIndicatorSubcategoryPages,
  additionalScaleSubcategoryPages,
} from "./additional-subcategory-pages";

const indicatorSlugs = {
  "indicator-lcd": "lcd",
  "indicator-led": "led",
  "indicator-waterproof": "waterproof",
} as const;

const platformSlugs = {
  "platform-carbon-steel": "carbon-steel",
  "platform-sus304": "sus304",
  "platform-sus201": "sus201",
  "platform-abs": "abs",
} as const;

const posSlugs = {
  "pos-ios": "ios",
  "pos-android": "android",
  "pos-windows": "windows",
} as const;

const accessorySlugs = {
  "accessory-displays": "displays",
  "accessory-cables": "cables",
  "accessory-mechanical": "mechanical",
  "accessory-pos": "pos",
  "accessory-consumables": "consumables",
} as const;

export type ProductReturnContext =
  | ScaleReturnContext
  | keyof typeof indicatorSlugs
  | keyof typeof platformSlugs
  | keyof typeof posSlugs
  | keyof typeof accessorySlugs
  | (typeof additionalScaleSubcategoryPages)[number]["id"]
  | (typeof additionalIndicatorSubcategoryPages)[number]["id"]
  | (typeof additionalAccessorySubcategoryPages)[number]["id"];

const indicatorLabel = productCategoryDefinitions.find(
  (category) => category.id === "indicators",
)!.label;
export const indicatorSubcategoryPages = getIndicatorSubcategories([]).map((child) => {
  const id = child.id as keyof typeof indicatorSlugs;
  return {
    id,
    categoryId: "indicators" as const,
    label: child.label,
    title: `${indicatorLabel} ${child.label}`,
    slug: indicatorSlugs[id],
    href: `/products/category/indicators/${indicatorSlugs[id]}`,
    returnContext: id,
  };
});

const platformLabel = productCategoryDefinitions.find(
  (category) => category.id === "platforms",
)!.label;
export const platformSubcategoryPages = platformSubcategoryDefinitions.map((child) => {
  const id = child.id as keyof typeof platformSlugs;
  return {
    id,
    categoryId: "platforms" as const,
    label: child.label,
    title: id === "platform-carbon-steel" ? child.label : `${platformLabel} ${child.label}`,
    slug: platformSlugs[id],
    href: `/products/category/platforms/${platformSlugs[id]}`,
    returnContext: id,
  };
});

const posLabel = productCategoryDefinitions.find((category) => category.id === "pos")!.label;
export const posSubcategoryPages = getPosSubcategories([]).map((child) => {
  const id = child.id as keyof typeof posSlugs;
  return {
    id,
    categoryId: "pos" as const,
    label: child.label,
    title: `${posLabel} ${child.label}`,
    slug: posSlugs[id],
    href: `/products/category/pos/${posSlugs[id]}`,
    returnContext: id,
  };
});

const accessoryLabel = productCategoryDefinitions.find(
  (category) => category.id === "accessories",
)!.label;
export const accessorySubcategoryPages = accessorySubcategoryDefinitions.map((child) => {
  const id = child.id as keyof typeof accessorySlugs;
  return {
    id,
    categoryId: "accessories" as const,
    label: child.label,
    title: `${accessoryLabel} ${child.label}`,
    slug: accessorySlugs[id],
    href: `/products/category/accessories/${accessorySlugs[id]}`,
    returnContext: id,
  };
});

export const productSubcategoryPages = [
  ...scaleSubcategoryPages.map((page) => ({
    ...page,
    categoryId: "scales" as const,
    title: page.label,
  })),
  ...indicatorSubcategoryPages,
  ...platformSubcategoryPages,
  ...posSubcategoryPages,
  ...accessorySubcategoryPages,
  ...additionalScaleSubcategoryPages,
  ...additionalIndicatorSubcategoryPages,
  ...additionalAccessorySubcategoryPages,
];

const warehouseGatedSubcategoryIds = new Set([
  "scale-analytical",
  "indicator-waterproof",
  "platform-carbon-steel",
  "platform-sus304",
  "platform-sus201",
  "platform-abs",
  "pos-ios",
]);

const warehouseGatedPages = productSubcategoryPages.filter(({ id }) =>
  warehouseGatedSubcategoryIds.has(id),
);

export const warehouseGatedSubcategoryHrefs: ReadonlySet<string> = new Set(
  warehouseGatedPages.map(({ href }) => href),
);

export function getReadySubcategoryHrefs(
  categories: readonly Pick<ProductCategory, "id" | "subcategories">[],
  products: readonly Pick<ProductCardData, "id" | "warehouseSku">[],
): string[] {
  const warehouseCardIds = new Set(
    products.filter(({ warehouseSku }) => warehouseSku?.trim()).map(({ id }) => id),
  );
  return warehouseGatedPages
    .filter(({ categoryId, id }) =>
      categories
        .find((category) => category.id === categoryId)
        ?.subcategories.find((subcategory) => subcategory.id === id)
        ?.productIds.some((productId) => warehouseCardIds.has(productId)),
    )
    .map(({ href }) => href);
}

export const getProductSubcategoryPage = (id: string | null | undefined, categoryId?: string) =>
  productSubcategoryPages.find(
    (page) => page.id === id && (!categoryId || page.categoryId === categoryId),
  );

export const getProductSubcategoryPageByHref = (href: string) =>
  productSubcategoryPages.find((page) => page.href === href.split(/[?#]/)[0]);

export function resolveListingSubcategory(
  definition: (typeof productSubcategoryPages)[number],
  category: Pick<ProductCategory, "subcategories">,
  products: readonly Product[],
): ProductCategory["subcategories"][number] | undefined {
  return "matches" in definition
    ? {
        id: definition.id,
        label: definition.label,
        productIds: products.filter(definition.matches).map(({ id }) => id),
      }
    : category.subcategories.find(({ id }) => id === definition.id);
}

export const getProductReturnPage = (context: string | null) =>
  productSubcategoryPages.find((page) => page.returnContext === context || page.id === context);
