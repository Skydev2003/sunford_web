import { load } from "cheerio";
import type { SourcePage } from "../types";
import type { Product } from "@/features/catalog/types";

// Blank document layouts are independent of live Warehouse values.
const layouts = new WeakMap<SourcePage, string>();

function emptyLayout(page: SourcePage): string {
  const cached = layouts.get(page);
  if (cached !== undefined) return cached;
  const $ = load(page.html, undefined, false);
  $("script,style,source").remove();
  $("*")
    .contents()
    .filter((_, node) => node.type === "text")
    .remove();
  $("*").each((_, node) => {
    const element = $(node);
    for (const attribute of ["src", "srcset", "poster", "alt", "title", "aria-label"])
      element.removeAttr(attribute);
    const style = element.attr("style");
    if (style) element.attr("style", style.replace(/url\([^)]*\)/gi, "none"));
  });
  $("img,video,iframe").attr("style", "visibility:hidden");
  const html = $.html();
  layouts.set(page, html);
  return html;
}

export function warehouseContentPage(
  page: SourcePage,
  products: Product[],
  preserveLayout = true,
): SourcePage {
  const productContent =
    page.kind === "product" ||
    page.kind === "collection" ||
    page.kind === "article" ||
    page.path.startsWith("/solutions") ||
    page.path.startsWith("/software") ||
    page.path === "/applications-and-softwares" ||
    page.path === "/technical-specification";
  if (!productContent) return page;
  const software = products.filter(
    (product) => product.warehouseGroup === "โปรแกรมและสิทธิ์ใช้งาน",
  );
  return {
    ...page,
    warehouseOnly: true,
    title:
      page.kind === "product" ||
      page.kind === "article" ||
      page.path.startsWith("/software/download/")
        ? ""
        : page.title,
    html: preserveLayout ? emptyLayout(page) : "",
    text: "",
    images: [],
    videos: [],
    softwareCatalog: page.softwareCatalog
      ? {
          categories: page.softwareCatalog.categories,
          items: software.map((product) => ({
            path: `/products/${product.slug}`,
            title: product.name,
            description: product.description,
            image: product.image,
            category: "all",
          })),
        }
      : undefined,
  };
}
