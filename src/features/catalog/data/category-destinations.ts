import { getProductSubcategoryPage } from "./product-subcategory-pages";
import { legacySoftwareCatalogPath, sunford } from "@/features/home/data/brand";
import { mainPageRedirects, sectionPagePath } from "@/features/site/data/main-page-paths";
import {
  legacyProductCategoryPath,
  productCategoryAliasPath,
  productCategoryPath,
} from "./category-paths";

const categoryDestinations: Record<string, string> = {
  "/indicator": "/platforms/indicators",
  "/product/scale-platforms": "/platforms",
  "/collections/stainless-steel-platforms": "/platforms",
  "/product/benchtop-platforms": "/platforms/benchtop",
  "/product/floor-platforms": "/platforms/floor",
  "/collections/benchtop-platforms": "/platforms/benchtop",
  "/collections/floor-platforms": "/platforms/floor",
  "/product/pos": "/pos",
  "/product/pos/android": "/pos/android",
  "/product/pos/windows": "/pos/windows",
  "/product/scale-accessories": "/accessories",
  "/product/data-interfaces": "/accessories",
  "/product/scale-peripherals": "/accessories",
  "/collections/printers": "/accessories",
  "/product/consumables": "/accessories/consumables",
  [legacySoftwareCatalogPath]: sunford.downloads,
};

export function resolveCategoryHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const source = new URL(href, "https://sunford.local");
  const page = getProductSubcategoryPage(source.searchParams.get("subcategory"));
  if (
    page &&
    (source.pathname === productCategoryPath(page.categoryId) ||
      source.pathname === legacyProductCategoryPath(page.categoryId) ||
      source.pathname === productCategoryAliasPath(page.categoryId) ||
      (source.pathname === "/products" && source.searchParams.get("category") === page.categoryId))
  ) {
    source.pathname = page.href;
    ["category", "subcategory", "catalog"].forEach((key) => source.searchParams.delete(key));
    return `${source.pathname}${source.search}${source.hash}`;
  }
  const pathname = source.pathname.replace(/\/$/, "").toLowerCase();
  const section = sectionPagePath(pathname);
  if (section !== pathname) return `${section}${source.search}${source.hash}`;
  const migratedPath = mainPageRedirects.find(({ source }) => source === pathname)?.destination;
  if (migratedPath) {
    const target = new URL(migratedPath, source.origin);
    return `${target.pathname}${source.search}${target.hash || source.hash}`;
  }
  const destination = categoryDestinations[pathname];
  if (!destination) return href;
  const target = new URL(destination, source.origin);
  source.searchParams.forEach((value, key) => {
    if (!["category", "subcategory", "catalog"].includes(key))
      target.searchParams.append(key, value);
  });
  target.hash = source.hash;
  return `${target.pathname}${target.search}${target.hash}`;
}
