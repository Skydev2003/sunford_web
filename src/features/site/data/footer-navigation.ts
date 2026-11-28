import { sunford } from "@/features/home/data/brand";
import { platformSpecBuilderPath } from "@/features/catalog/data/platform-spec-builder-path";
import { siteMenuLink } from "./site-menu-labels";

export const footerNavigation = [
  {
    label: "ผลิตภัณฑ์",
    links: [
      siteMenuLink("/products"),
      siteMenuLink("/scales"),
      siteMenuLink("/indicators"),
      siteMenuLink("/platforms"),
      siteMenuLink("/pos"),
      siteMenuLink("/accessories"),
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
      siteMenuLink(platformSpecBuilderPath),
      siteMenuLink(sunford.downloads),
      siteMenuLink(sunford.warranty),
    ],
  },
] as const;

export const footerLegalLinks = [
  { label: "ความเป็นส่วนตัวและคุกกี้", href: "/privacy-policy-and-cookie-policy" },
  siteMenuLink(sunford.warrantyPolicy),
  siteMenuLink("/service/cancel-and-return/policy"),
] as const;
