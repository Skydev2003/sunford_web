export type CmsValue = string | number | boolean | null | CmsValue[] | { [key: string]: CmsValue };
export type CmsData = { [key: string]: CmsValue };
export type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "html" | "image" | "number" | "boolean" | "select" | "array";
  options?: { value: string; label: string }[];
  fields?: Field[];
  initial?: CmsData;
  hint?: string;
};
export type Category = { id: string; label: string; english: string };
export type ProductMedia = {
  price: number | null;
  gallery: { image: string }[];
  descriptionHtml: string;
  detailsHtml: string;
  specifications: { label: string; value: string }[];
  videos: { id: string; image: string }[];
};
export type HeroSettings = {
  announcement: string;
  announcementLabel: string;
  announcementHref: string;
  tagline: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHref: string;
  slides: { productId: string; title: string; description: string; image: string; href: string }[];
};
export type SiteSettings = {
  logo: string;
  name: string;
  phone: string;
  phoneHref: string;
  email: string;
  line: string;
};
export type NavigationItem = {
  label: string;
  href: string;
  links: { label: string; href: string }[];
};
