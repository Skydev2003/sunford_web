import { sunford } from "@/features/home/data/brand";
import { siteMenuLink } from "./site-menu-labels";

export const footerNavigation = [
  {
    label: "ผลิตภัณฑ์",
    links: [
      siteMenuLink("/products"),
      siteMenuLink("/products/category/scales"),
      siteMenuLink("/products/category/indicators"),
      siteMenuLink("/products/category/platforms"),
      siteMenuLink("/products/category/pos"),
      siteMenuLink("/products/category/accessories"),
    ],
  },
  {
    label: "โซลูชันและซอฟต์แวร์",
    links: [
      { label: "โซลูชัน", href: "/solutions" },
      { label: "ERP", href: sunford.erp },
      { label: "MES", href: sunford.mes },
    ],
  },
  {
    label: "บริการและช่วยเหลือ",
    links: [
      siteMenuLink(sunford.service),
      siteMenuLink("/service/quotation"),
      siteMenuLink("/guides/indicator-platform-compatibility"),
      siteMenuLink(sunford.downloads),
      siteMenuLink(sunford.warranty),
    ],
  },
] as const;

export const footerLegalLinks = [
  { label: "ความเป็นส่วนตัวและคุกกี้", href: "/privacy-policy-and-cookie-policy" },
  siteMenuLink(sunford.warrantyPolicy),
  siteMenuLink("/cancel-and-return/policy"),
] as const;
