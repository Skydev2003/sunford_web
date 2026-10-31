import manifest from "../../../../public/images/category-banners-v1/manifest.json";
import wideManifest from "../../../../public/images/category-banners-v3/manifest.json";
import polishedManifest from "../../../../public/images/category-banners-v4/manifest.json";

export type BannerCategory =
  | "commercial"
  | "industrial"
  | "food"
  | "smart"
  | "pos"
  | "laboratory"
  | "accessories"
  | "lifestyle"
  | "platforms"
  | "indicators";

export function getCategoryBanner(category: string) {
  return [...polishedManifest, ...wideManifest, ...manifest].find(
    (banner) => banner.category === category,
  );
}

// Use each category's own physical product, including the bare platform and indicator.
const paths: Record<BannerCategory, string[]> = {
  commercial: [
    "/products",
    "/Product/Digital-weighing",
    "/collections/scales",
    "/collections/weighing-scales",
    "/product/commercial",
    "/collections/commercial",
    "/collections/Commercial scale",
    "/collections/Commercial scale weighting",
    "/collections/Weighing and Price computing",
    "/collections/price-computing-scales",
    "/collections/receipt-printing-price-scales",
  ],
  industrial: [
    "/product/industrial",
    "/collections/industrial",
    "/collections/Industrial scale",
    "/collections/Industrial scale weighing",
    "/collections/Counting and Checking",
    "/collections/counting-scales",
  ],
  food: [
    "/collections/kitchen-scales",
    "/collections/Home kitchen",
    "/collections/waterproof-weighing-scales",
    "/collections/washdown-price-computing-scales",
    "/collections/Washdown weighing",
  ],
  smart: [
    "/collections/Smart weighing",
    "/collections/Wired smart scale",
    "/collections/Wireless smart scale",
    "/collections/Group of smart scale",
    "/collections/Semi-Smart scale",
    "/collections/label-printing-price-scales",
  ],
  pos: [
    "/Product/POS",
    "/Product/POS/Android",
    "/Product/POS/Windows",
    "/product/pos-windows",
    "/collections/pos-android",
    "/collections/pos-windows",
    "/collections/pos-scale-integration",
    "/collections/pos-connected-weighing",
  ],
  laboratory: [
    "/product/laboratory",
    "/collections/laboratory",
    "/collections/Laboratory balance",
    "/collections/Analytical works",
    "/collections/analytical-laboratory-scales",
    "/collections/quality-control-scales",
    "/collections/QC and Inspection",
  ],
  accessories: [
    "/product/scale-accessories",
    "/product/data-interfaces",
    "/product/scale-peripherals",
    "/product/scale-parts",
    "/product/parts",
    "/product/consumables",
    "/collections/scale-accessories",
    "/collections/data-interfaces",
    "/collections/scale-peripherals",
    "/collections/printers",
    "/collections/parts",
    "/collections/consumables",
    "/collections/POS Related",
  ],
  lifestyle: [
    "/product/lifestyle",
    "/product/lifestyle-scales",
    "/collections/lifestyle-scales",
    "/collections/Household scale",
    "/collections/Health care",
    "/collections/personal-health-scales",
  ],
  platforms: [
    "/product/scale-platforms",
    "/Product/benchtop-platforms",
    "/Product/floor-platforms",
    "/collections/large-floor-platforms",
    "/collections/benchtop-platforms",
    "/collections/floor-platforms",
    "/collections/scale-platforms",
  ],
  indicators: [
    "/Indicator",
    "/Indicator/laboratory",
    "/Indicator/industrial",
    "/Indicator/commercial",
    "/collections/weighing-indicators",
    "/collections/counting-indicators",
    "/collections/waterproof-indicators",
  ],
};

const normalize = (path: string) => decodeURI(path).toLowerCase().replace(/\/$/, "");
const pathCategories = new Map(
  Object.entries(paths).flatMap(([category, routes]) =>
    routes.map((route) => [normalize(route), category as BannerCategory] as const),
  ),
);

export function getBannerCategoryForPath(path: string) {
  return pathCategories.get(normalize(path));
}
