import type { Product } from "@/features/catalog/types";
import { defaultSpotlightProductId, type HomeImageSlot } from "./image-slots";

export type HomeLinkTarget = {
  productId?: string | null;
  pagePath?: string | null;
  disabled?: boolean;
};
export type HomeLinkTargets = Partial<Record<HomeImageSlot, HomeLinkTarget>>;

export const defaultHomePagePaths = {
  digital: "/Product/Digital-weighing",
  smart: "/Product/MES",
  accessories: "/product/อุปกรณ์ประกอบเครื่องชั่ง",
  software: "/applications-and-softwares",
} as const;

export function resolveHomeLink(
  slot: HomeImageSlot,
  target: HomeLinkTarget | undefined,
  products: Product[],
): string | undefined {
  if (target?.disabled) return undefined;
  if (target?.productId) {
    const product = products.find((item) => item.id === target.productId);
    // Never redirect a hidden/deleted target to a different product.
    return product ? `/products/${product.slug}` : undefined;
  }
  if (target?.pagePath)
    return target.pagePath.startsWith("/") &&
      !target.pagePath.startsWith("//") &&
      !/[\\\r\n]/.test(target.pagePath) &&
      !/^\/(admin|api)(\/|$)/i.test(target.pagePath)
      ? target.pagePath
      : undefined;
  if (slot === "spotlight") {
    const product = products.find((item) => item.id === defaultSpotlightProductId);
    return product ? `/products/${product.slug}` : undefined;
  }
  return defaultHomePagePaths[slot];
}
