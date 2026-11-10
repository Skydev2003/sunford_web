import { getProductSubcategoryPage } from "./product-subcategory-pages";

const categoryDestinations: Record<string, string> = {
  "/product/digital-weighing": "/products/category/scales",
  "/product/commercial": "/products/category/scales/price",
  "/collections/coffee-scales": "/products/category/scales/kitchen",
  "/product/industrial": "/products/category/scales/industrial",
  "/product/laboratory": "/products/category/scales/analytical",
  "/collections/pos-connected-weighing": "/products/category/scales",
  "/indicator": "/products/category/indicators",
  "/product/scale-platforms": "/products/category/platforms",
  "/collections/stainless-steel-platforms": "/products/category/platforms",
  "/product/benchtop-platforms": "/products/category/platforms",
  "/product/floor-platforms": "/products/category/platforms",
  "/product/pos": "/products/category/pos",
  "/product/pos/android": "/products/category/pos/android",
  "/product/pos/windows": "/products/category/pos/windows",
  "/product/scale-accessories": "/products/category/accessories",
  "/product/data-interfaces": "/products/category/accessories",
  "/product/scale-peripherals": "/products/category/accessories",
  "/collections/printers": "/products/category/accessories",
  "/product/consumables": "/products/category/accessories/consumables",
};

export function resolveCategoryHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const source = new URL(href, "https://sunford.local");
  const page = getProductSubcategoryPage(source.searchParams.get("subcategory"));
  if (
    page &&
    (source.pathname === `/products/category/${page.categoryId}` ||
      (source.pathname === "/products" && source.searchParams.get("category") === page.categoryId))
  ) {
    source.pathname = page.href;
    ["category", "subcategory", "catalog"].forEach((key) => source.searchParams.delete(key));
    return `${source.pathname}${source.search}${source.hash}`;
  }
  const destination = categoryDestinations[source.pathname.replace(/\/$/, "").toLowerCase()];
  if (!destination) return href;
  const target = new URL(destination, source.origin);
  source.searchParams.forEach((value, key) => {
    if (!["category", "subcategory", "catalog"].includes(key))
      target.searchParams.append(key, value);
  });
  target.hash = source.hash;
  return `${target.pathname}${target.search}${target.hash}`;
}
