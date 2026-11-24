import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { buildNavbarListingFeatures } from "../data/navbar-listing-features";
import { getProductCategories } from "./product-categories";
import { getStorefrontProducts } from "./product-repository";

export async function getNavbarListingFeatures(disabledHrefs: string[]) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag("products");
  const [{ categories }, products] = await Promise.all([
    getProductCategories(),
    getStorefrontProducts(),
  ]);
  return buildNavbarListingFeatures(categories, products, disabledHrefs);
}
