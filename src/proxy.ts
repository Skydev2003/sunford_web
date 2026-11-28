import { NextResponse, type NextRequest } from "next/server";
import { publicPath } from "@/features/content/data/public-paths.mjs";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { legacyPlatformFilterHref } from "@/features/catalog/data/catalog-overview-features";
import { legacyScaleOverviewPaths } from "@/features/site/data/main-page-paths";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { findCatalogProduct } from "@/features/catalog/data/product-lookup";
import { getCurrentProducts } from "@/features/catalog/server/product-repository";
import type { Product } from "@/features/catalog/types";

const importedProductAliases = new Set(
  getSnapshotProducts().flatMap(({ slug, sourceId }) => [
    slug.toLowerCase(),
    sourceId?.toLowerCase(),
  ]),
);
let redirectCatalog: { products: Promise<Product[]>; expiresAt: number } | undefined;

function readRedirectCatalog() {
  if (!redirectCatalog || Date.now() >= redirectCatalog.expiresAt) {
    const products = getCurrentProducts()
      .then((result) => result.products)
      .catch((error) => {
        redirectCatalog = undefined;
        throw error;
      });
    redirectCatalog = { products, expiresAt: Date.now() + 60_000 };
  }
  return redirectCatalog.products;
}

export async function proxy(request: NextRequest) {
  if (/^\/admin(?:\/|$)/i.test(request.nextUrl.pathname))
    return new Response("Not Found", { status: 404 });
  let decoded;
  try {
    decoded = decodeURIComponent(request.nextUrl.pathname);
  } catch {
    return NextResponse.next();
  }
  const rawSlug = /^\/products\/([^/]+)$/.exec(request.nextUrl.pathname)?.[1];
  const productSlug = rawSlug && decodeURIComponent(rawSlug);
  if (
    productSlug &&
    (/^warehouse-|^(?:g?\d+|lp5[01])$/i.test(productSlug) ||
      productSlug !== productSlug.toLowerCase() ||
      importedProductAliases.has(productSlug.toLowerCase()))
  ) {
    const products = await readRedirectCatalog();
    const product = findCatalogProduct(products, productSlug);
    if (product?.slug && product.slug !== productSlug) {
      const destination = request.nextUrl.clone();
      destination.pathname = `/products/${encodeURIComponent(product.slug)}`;
      return NextResponse.redirect(destination, 308);
    }
  }
  const path = publicPath(request.nextUrl.pathname);
  const pathname = path.toLowerCase().replace(/\/$/, "");
  if (pathname === "/platforms") {
    const destination = legacyPlatformFilterHref(request.nextUrl.search);
    if (destination) return NextResponse.redirect(new URL(destination, request.url), 308);
  }
  if (
    request.nextUrl.searchParams.has("subcategory") &&
    (pathname === "/scales" ||
      pathname === "/platforms" ||
      legacyScaleOverviewPaths.includes(pathname) ||
      (pathname === "/products" && request.nextUrl.searchParams.get("category") === "scales"))
  ) {
    const original = pathname + request.nextUrl.search;
    const destination = resolveCategoryHref(original);
    if (destination !== original)
      return NextResponse.redirect(new URL(destination, request.url), 308);
  }
  if (path === decoded) return NextResponse.next();
  const destination = request.nextUrl.clone();
  destination.pathname = path;
  return NextResponse.redirect(destination, 308);
}

export const config = { matcher: ["/((?!_next/|api/|images/|models/|videos/|icon.svg).*)"] };
