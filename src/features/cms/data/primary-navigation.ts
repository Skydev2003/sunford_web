import type { NavigationItem } from "../types";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { getProductSubcategoryPageByHref } from "@/features/catalog/data/product-subcategory-pages";

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
const guideHref = "/guides/indicator-platform-compatibility";
export function getPrimaryNavigationItems(navigation: NavigationItem[]): NavigationItem[] {
  const availableLinks = navigation
    .filter((item) => item.href !== "/products")
    .flatMap((item) => [...item.links, ...(item.groups ?? []).flatMap((group) => group.links)]);
  const existingLinks = (hrefs: string[]) =>
    hrefs.flatMap((href) => {
      const match = availableLinks.find(
        (link) => resolveCategoryHref(link.href) === resolveCategoryHref(href),
      );
      return match ? [match] : [];
    });
  const sectionHrefs = ["/solutions", "/applications-and-softwares"];
  const mergedMenus = navigation.filter((item) =>
    [...sectionHrefs, "/about-us", "/contact-us"].includes(item.href),
  );
  const headerNavigation = navigation
    .filter((item) => !mergedMenus.includes(item) && item.href !== guideHref)
    .flatMap((item) => {
      if (item.href !== "/products") return [item];
      const productCategories = item.links
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
                    new URLSearchParams(link.href.split("?")[1]).get("category") === categoryId ||
                    getProductSubcategoryPageByHref(link.href)?.categoryId === categoryId,
                )
                .map((link) => ({
                  ...link,
                  href: getProductSubcategoryPageByHref(link.href)
                    ? link.href
                    : `${categoryHref}?subcategory=${new URLSearchParams(link.href.split("?")[1]).get("subcategory")}`,
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
      return [
        {
          label: "ผลิตภัณฑ์ทั้งหมด",
          submenuLabel: "สำรวจผลิตภัณฑ์",
          href: "/products",
          links: productCategories.map(({ label, href }) => ({ label, href })),
          groups: [
            {
              label: "ลิงก์ด่วน",
              links: [
                { label: "ดูผลิตภัณฑ์ทั้งหมด", href: "/products" },
                { label: "ข้อมูลทางเทคนิคและคู่มือ", href: "/technical-specification" },
                { label: "ดาวน์โหลดซอฟต์แวร์", href: "/software/download" },
              ],
            },
            {
              label: "บริการและความช่วยเหลือ",
              links: [
                { label: "บริการหลังการขาย", href: "/service" },
                { label: "ลงทะเบียนรับประกัน", href: "/warranty/register" },
                { label: "ติดต่อเรา", href: "/contact-us" },
              ],
            },
          ],
        },
        ...productCategories,
      ];
    })
    .map((item) =>
      item.href === "/service"
        ? {
            ...item,
            submenuLabel: "สำรวจบริการ",
            links: [
              ...mergedMenus
                .filter((menu) => sectionHrefs.includes(menu.href))
                .map(({ label, href }) => ({ label, href })),
              {
                label:
                  item.links.find((link) => link.href === item.href)?.label ?? "บริการหลังการขาย",
                href: item.href,
              },
              { label: "ใบเสนอราคา", href: "/service/quotation" },
            ],
            groups: [
              {
                label: "ข้อมูลและความช่วยเหลือ",
                links: existingLinks([
                  "/software/download",
                  "/warranty/register",
                  "/technical-specification",
                ]),
              },
              {
                label: "บริษัท",
                links: mergedMenus
                  .filter((menu) => !sectionHrefs.includes(menu.href))
                  .map(({ label, href }) => ({ label, href })),
              },
            ].filter((group) => group.links.length),
          }
        : item,
    );

  const servicesIndex = headerNavigation.findIndex((item) => item.href === "/service");
  headerNavigation.splice(servicesIndex < 0 ? headerNavigation.length : servicesIndex, 0, {
    label: "จัดสเปค",
    href: guideHref,
    links: [],
    groups: [],
  });
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
