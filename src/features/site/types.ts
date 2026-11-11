export type ContentValue =
  string | number | boolean | null | ContentValue[] | { [key: string]: ContentValue };
export type ContentData = { [key: string]: ContentValue };
export type SiteDocument = {
  id: string;
  kind: string;
  data: ContentData;
  deletedAt?: string | null;
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
  messenger?: string;
};
export type NavigationGroup = {
  label: string;
  links: { label: string; href: string }[];
};
export type NavigationItem = {
  label: string;
  submenuLabel?: string;
  href: string;
  links: { label: string; href: string }[];
  groups?: NavigationGroup[];
};
