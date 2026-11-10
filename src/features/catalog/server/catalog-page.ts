import "server-only";
import { getContentPage } from "@/features/content/server/content-repository";
import { getProductSection } from "@/features/content/data/product-sections";
import type { Product, CatalogScope } from "../types";
import {
  catalogProductGroup,
  supplementalCatalogGroup,
  supplementalCatalogSection,
} from "../data/catalog-supplements";

const groups = [
  {
    root: "/products",
    source: "/Product/Digital-weighing",
    title: "เครื่องชั่ง",
    aliases: [
      "/collections/scales",
      "/collections/weighing-scales",
      "/collections/counting-scales",
      "/collections/price-computing-scales",
      "/collections/label-printing-price-scales",
      "/collections/waterproof-weighing-scales",
    ],
  },
  {
    root: "/Indicator",
    source: "/Indicator",
    title: "อินดิเคเตอร์แท่นชั่ง",
    aliases: [
      "/collections/weighing-indicators",
      "/collections/counting-indicators",
      "/collections/waterproof-indicators",
    ],
  },
  {
    root: "/product/scale-platforms",
    source: "/product/scale-platforms",
    title: "โครงสร้างแท่นชั่ง",
    aliases: [
      "/collections/large-floor-platforms",
      "/collections/benchtop-platforms",
      "/collections/floor-platforms",
    ],
  },
  {
    root: "/Product/POS",
    source: "/Product/POS",
    title: "ระบบ POS",
    aliases: [
      "/collections/pos-scale-integration",
      "/collections/pos-android",
      "/collections/pos-windows",
    ],
  },
  {
    root: "/product/scale-accessories",
    source: "/product/scale-accessories",
    title: "อุปกรณ์เสริม",
    aliases: [
      "/collections/printers",
      "/collections/parts",
      "/collections/consumables",
      "/collections/POS Related",
      "/collections/scale-accessories",
      "/collections/premium",
    ],
  },
];
const key = (path: string) => path.toLowerCase().replace(/\/$/, "");

export async function getCatalogPage(path: string, allProducts: Product[]) {
  const group = groups.find((group) =>
    [
      group.root,
      group.source,
      ...group.aliases,
      ...(getProductSection(group.source)?.links.map((link) => link.href) ?? []),
    ].some((candidate) => key(candidate) === key(path)),
  );
  if (!group) return undefined;
  const rootSection = getProductSection(group.source)!;
  const navigation = [
    { label: `${group.title}ทั้งหมด`, href: group.root },
    ...rootSection.links.filter((link) => key(link.href) !== key(group.root)),
  ];
  const members = async (href: string) => {
    if (key(href) === key(group.root) && allProducts.some((product) => product.warehouseSku))
      return allProducts.filter((product) => catalogProductGroup(product) === group.root);
    const section = getProductSection(key(href) === key(group.root) ? group.source : href);
    const paths = section?.collectionPaths.length ? section.collectionPaths : [href];
    const pages = await Promise.all(paths.map(getContentPage));
    const handles = new Set(pages.flatMap((page) => page?.productHandles ?? []));
    return allProducts.filter((product) => {
      if (catalogProductGroup(product) !== group.root) return false;
      if (handles.has(product.sourceId ?? "")) return true;
      const supplemental = supplementalCatalogSection(product);
      if (!supplemental) return false;
      return (
        supplemental === key(href) ||
        getProductSection(supplemental)?.collectionPaths.some((candidate) =>
          paths.some((path) => key(path) === key(candidate)),
        )
      );
    });
  };
  const lists = await Promise.all(navigation.map((link) => members(link.href)));
  const rootIds = new Set(lists[0].map((product) => product.id));
  allProducts
    .filter((product) => supplementalCatalogGroup(product) === group.root)
    .forEach((product) => rootIds.add(product.id));
  const accessory = group.root === "/product/scale-accessories";
  if (accessory) lists.flat().forEach((product) => rootIds.add(product.id));
  const isRoot = key(path) === key(group.root) || key(path) === key(group.source);
  const selected = isRoot
    ? allProducts.filter((product) => rootIds.has(product.id))
    : (await members(path)).filter((product) => rootIds.has(product.id));
  const scope: CatalogScope = {
    title: isRoot ? group.title : (getProductSection(path)?.title ?? group.title),
    rootHref: group.root,
    rootLabel: `${group.title}ทั้งหมด`,
    currentPath: isRoot ? group.root : path,
    topicIds:
      group.root === "/Indicator"
        ? ["weighing", "counting", "waterproof", "non-waterproof", "connected"]
        : group.root === "/product/scale-platforms"
          ? ["general", "wet", "heavy", "waterproof", "non-waterproof"]
          : group.root === "/Product/POS"
            ? ["android", "windows", "pos-software", "connected", "peripherals", "printers"]
            : group.root === "/products"
              ? [
                  "weighing",
                  "counting",
                  "price",
                  "labels",
                  "waterproof",
                  "non-waterproof",
                  "connected",
                  "general",
                  "wet",
                  "heavy",
                ]
              : [
                  "waterproof",
                  "non-waterproof",
                  "connected",
                  "data-devices",
                  "printers",
                  "thermal",
                  "peripherals",
                  "parts",
                  "consumables",
                  "for-scales",
                  "for-pos",
                  "for-printing",
                ],
    links: navigation.map((link, index) => ({
      ...link,
      count:
        index === 0
          ? rootIds.size
          : lists[index].filter((product) => rootIds.has(product.id)).length,
    })),
  };
  return { products: selected, scope };
}
