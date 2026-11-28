import {
  legacyProductCategoryPath,
  productCategoryAliasPath,
  productCategoryPath,
  productCategorySlugs,
} from "../../catalog/data/category-paths";
import { mesRedirects } from "../../content/data/mes-paths";
import { platformSpecBuilderPath } from "../../catalog/data/platform-spec-builder-path";
import { scaleSpecBuilderPath } from "../../catalog/data/scale-spec-builder-path";

export const legacyScaleOverviewPaths = [
  legacyProductCategoryPath("scales"),
  productCategoryAliasPath("scales"),
];

export const mainPageRedirects = [
  ...[
    ["analytical", "laboratory"],
    ["price", "retail"],
    ["kitchen", "household"],
  ].flatMap(([oldSlug, newSlug]) =>
    ["/scales", "/products/category/scales", "/products/scales"].map((root) => ({
      source: `${root}/${oldSlug}`,
      destination: `/scales/${newSlug}`,
    })),
  ),
  { source: "/scales/spec-builder", destination: scaleSpecBuilderPath },
  { source: "/platforms/spec-builder", destination: platformSpecBuilderPath },
  { source: "/indicators", destination: "/platforms/indicators" },
  ...productCategorySlugs.flatMap((id) =>
    [legacyProductCategoryPath(id), productCategoryAliasPath(id)].map((source) => ({
      source,
      destination: id === "indicators" ? "/platforms/indicators" : productCategoryPath(id),
    })),
  ),
  { source: "/software/download", destination: "/software" },
  { source: "/spec-builder", destination: platformSpecBuilderPath },
  { source: "/guides/indicator-platform-compatibility", destination: platformSpecBuilderPath },
  ...mesRedirects,
];

const sectionMoves: {
  source: string;
  destination: string;
  childrenOnly?: boolean;
  descendants?: boolean;
}[] = [
  ...productCategorySlugs.flatMap((id) =>
    [productCategoryPath(id), legacyProductCategoryPath(id)].map((root) => ({
      source: `${root}/applications`,
      destination: productCategoryPath(id),
    })),
  ),
  ...productCategorySlugs.map((id) => ({
    source: legacyProductCategoryPath(id),
    destination: productCategoryPath(id),
    childrenOnly: true,
    descendants: true,
  })),
  {
    source: "/technical-specification",
    destination: "/service/technical-specification",
    descendants: true,
  },
  { source: "/warranty/register", destination: "/service/warranty/register" },
  { source: "/warranty/policy", destination: "/service/warranty/policy" },
  { source: "/cancel-and-return/policy", destination: "/service/cancel-and-return/policy" },
  { source: "/support/technical-assistance", destination: "/service/technical-assistance" },
  { source: "/business/blogs/editorial", destination: "/service/articles" },
  { source: "/business", destination: "/service/articles" },
  { source: "/blogs/editorial", destination: "/service/articles", descendants: true },
  { source: "/solution/erp", destination: "/solutions/erp" },
  { source: "/product/digital-weighing", destination: "/scales" },
  { source: "/product/commercial", destination: "/scales/retail" },
  { source: "/product/industrial", destination: "/scales/industrial" },
  { source: "/product/laboratory", destination: "/scales/laboratory" },
  { source: "/collections/coffee-scales", destination: "/scales/household" },
  { source: "/collections/pos-connected-weighing", destination: "/scales" },
  { source: "/product/scale-platforms", destination: "/platforms" },
  { source: "/product/pos", destination: "/pos" },
  { source: "/product/scale-accessories", destination: "/accessories" },
];

export const sectionPageRedirects = sectionMoves.flatMap(
  ({ source, destination, childrenOnly, descendants }) => [
    ...(childrenOnly ? [] : [{ source, destination }]),
    ...(descendants ? [{ source: `${source}/:rest+`, destination: `${destination}/:rest+` }] : []),
  ],
);

export function sectionPagePath(path: string) {
  for (const { source, destination, childrenOnly, descendants } of sectionMoves) {
    if (!childrenOnly && path === source) return destination;
    if (descendants && path.startsWith(`${source}/`))
      return destination + path.slice(source.length);
  }
  return path;
}

export function sectionPageHref(href: string) {
  const separator = href.search(/[?#]/);
  if (separator < 0) return sectionPagePath(href);
  return sectionPagePath(href.slice(0, separator)) + href.slice(separator);
}
