import manifest from "./scale-category-models.json";

const slugs = {
  "scale-price": "retail",
  "scale-industrial": "industrial",
  "scale-analytical": "laboratory",
  "scale-kitchen": "household",
  "scale-water-dust": "water-dust",
  "scale-benchtop": "benchtop",
  "scale-floor": "floor",
  "scale-pole": "pole",
} as const;

export const primaryScaleGroups = ["laboratory", "industrial", "retail", "household"];

export type ScaleReturnContext = keyof typeof slugs | "industrial-scales";

export const scaleSubcategoryPages = manifest.categories.map((category) => {
  const id = category.id as keyof typeof slugs;
  return {
    id,
    label: category.label,
    slug: slugs[id],
    href: `/scales/${slugs[id]}`,
    returnContext: id === "scale-industrial" ? ("industrial-scales" as const) : id,
  };
});

export const getScaleSubcategoryPage = (id: string | null | undefined) =>
  scaleSubcategoryPages.find((page) => page.id === id);

export const getScaleSubcategoryPageByHref = (href: string) =>
  scaleSubcategoryPages.find((page) => page.href === href.split(/[?#]/)[0]);

export const getScaleReturnPage = (context: string | null) =>
  scaleSubcategoryPages.find((page) => page.returnContext === context || page.id === context);
