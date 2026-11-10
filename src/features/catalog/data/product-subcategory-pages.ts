import { productCategoryDefinitions } from "./mock-categories";
import { getIndicatorSubcategories } from "./indicator-subcategories";
import { platformSubcategoryDefinitions } from "./platform-subcategories";
import { getPosSubcategories } from "./pos-subcategories";
import { accessorySubcategoryDefinitions } from "./accessory-subcategories";
import { scaleSubcategoryPages, type ScaleReturnContext } from "./scale-subcategory-pages";

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
  | keyof typeof accessorySlugs;

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
    title: `${platformLabel} ${child.label}`,
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
];

export const getProductSubcategoryPage = (id: string | null | undefined, categoryId?: string) =>
  productSubcategoryPages.find(
    (page) => page.id === id && (!categoryId || page.categoryId === categoryId),
  );

export const getProductSubcategoryPageByHref = (href: string) =>
  productSubcategoryPages.find((page) => page.href === href.split(/[?#]/)[0]);

export const getProductReturnPage = (context: string | null) =>
  productSubcategoryPages.find((page) => page.returnContext === context || page.id === context);
