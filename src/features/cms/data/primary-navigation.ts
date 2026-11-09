import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";

const productRelatedHrefs: Record<string, string[]> = {
  scales: [
    "/product/commercial",
    "/collections/coffee-scales",
    "/product/industrial",
    "/product/laboratory",
  ],
  indicators: [
    "/solutions/checkweighing",
    "/solutions/rs232",
    "/solutions/wireless",
    "/solutions/external-display",
  ],
  platforms: ["/product/industrial", "/solutions/checkweighing", "/solutions/wet-environments"],
  pos: [
    "/solutions/pos",
    "/solutions/label-printing",
    "/solutions/pos-label-printing",
    "/software/download#retail-software",
  ],
  accessories: [
    "/solutions/external-display",
    "/solutions/rs232",
    "/solutions/pos",
    "/solutions/label-printing",
  ],
};
const productSupportHrefs = [
  "/technical-specification",
  "/service",
  "/warranty/register",
  "/warranty/policy",
  "/contact-us",
];
export function getPrimaryNavigationItems(navigation: NavigationItem[]): NavigationItem[] {
  const availableLinks = navigation.flatMap((item) => [
    ...item.links,
    ...(item.groups ?? []).flatMap((group) => group.links),
  ]);
  const existingLinks = (hrefs: string[]) =>
    hrefs.flatMap((href) => {
      const match = availableLinks.find(
        (link) => resolveCategoryHref(link.href) === resolveCategoryHref(href),
      );
      return match ? [match] : [];
    });
  const mergedMenus = navigation.filter((item) => ["/about-us", "/contact-us"].includes(item.href));
  const headerNavigation = navigation
    .filter((item) => !mergedMenus.includes(item))
    .flatMap((item) => {
      if (item.href !== "/products") return [item];
      return item.links
        .filter((link) => new URLSearchParams(link.href.split("?")[1]).has("category"))
        .map((category) => {
          const categoryId = new URLSearchParams(category.href.split("?")[1]).get("category");
          const categoryHref = `/products/category/${categoryId}`;
          return {
            ...category,
            href: categoryHref,
            submenuLabel: `สำรวจ${category.label}`,
            links: [
              ...(item.groups ?? [])
                .flatMap((group) => group.links)
                .filter(
                  (link) =>
                    new URLSearchParams(link.href.split("?")[1]).get("category") === categoryId,
                )
                .map((link) => ({
                  ...link,
                  href: `${categoryHref}?subcategory=${new URLSearchParams(link.href.split("?")[1]).get("subcategory")}`,
                })),
            ],
            groups: [
              {
                label: "การใช้งานและโซลูชัน",
                links: existingLinks(productRelatedHrefs[categoryId ?? ""] ?? []),
              },
              {
                label: "ข้อมูลและความช่วยเหลือ",
                links: existingLinks(productSupportHrefs),
              },
            ].filter((group) => group.links.length),
          };
        });
    })
    .map((item) =>
      item.href === "/service"
        ? {
            ...item,
            groups: [
              ...(item.groups ?? []),
              ...mergedMenus.flatMap((menu) => [
                {
                  label: menu.label,
                  links: menu.links.length ? menu.links : [{ label: menu.label, href: menu.href }],
                },
                ...(menu.groups ?? []),
              ]),
            ],
          }
        : item,
    );

  const normalizeLink = (link: NavigationItem["links"][number]) => ({
    ...link,
    href: resolveCategoryHref(link.href),
  });
  return headerNavigation.map((item) => ({
    ...item,
    links: item.links.map(normalizeLink),
    groups: item.groups?.map((group) => ({
      ...group,
      links: group.links.map(normalizeLink),
    })),
  }));
}
