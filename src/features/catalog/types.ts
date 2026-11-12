export const categories = [
  { id: "all", label: "ทั้งหมด", english: "All products" },
  { id: "commercial", label: "เครื่องชั่งเชิงพาณิชย์", english: "Commercial scales" },
  { id: "industrial", label: "เครื่องชั่งอุตสาหกรรม", english: "Industrial scales" },
  { id: "food", label: "เครื่องชั่งอาหาร", english: "Food scales" },
  { id: "smart", label: "เครื่องชั่งอัจฉริยะ", english: "Smart scales" },
  { id: "pos", label: "ระบบ POS และอุปกรณ์", english: "POS & Accessories" },
  { id: "laboratory", label: "เครื่องชั่งห้องปฏิบัติการ", english: "Laboratory balances" },
  { id: "accessories", label: "อุปกรณ์เสริม", english: "Accessories" },
  { id: "lifestyle", label: "ไลฟ์สไตล์และสุขภาพ", english: "Lifestyle & health" },
] as const;

export type CategoryId = string;
export type CatalogScope = {
  title: string;
  rootHref: string;
  rootLabel: string;
  currentPath: string;
  topicIds?: string[];
  links: { label: string; href: string; count: number }[];
};
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Exclude<CategoryId, "all">;
  subtitle: string;
  description: string;
  image: string;
  fallbackImage?: string;
  capacity: string;
  readability: string;
  connection: string;
  badge: string | null;
  featured: boolean;
  topics?: string[];
  sortOrder: number;
  sourceId?: string;
  sourceUrl?: string;
  price?: number | null;
  warehouseSku?: string;
  warehouseName?: string;
  storefrontName?: string;
  warehouseGroup?: string;
  warehouseUsageFamily?: string;
  warehouseCompatibleSkus?: string[];
  warehouseComponents?: { sku: string; quantity: number }[];
  warehouseSpecifications?: { label: string; value: string }[];
  warehouseCard?: Pick<
    Product,
    "image" | "subtitle" | "description" | "capacity" | "readability" | "connection"
  >;
  warehouseUnit?: string;
  warehouseNetUnitSatang?: number | null;
  warehouseCategoryId?: string;
  warehouseSubcategoryIds?: string[];
  warehouseModelCodes?: string[];
  imageOverridden?: boolean;
  media?: import("@/features/site/types").ProductMedia;
};

export type ProductCardData = Pick<
  Product,
  | "price"
  | "id"
  | "slug"
  | "name"
  | "category"
  | "subtitle"
  | "image"
  | "fallbackImage"
  | "warehouseSku"
  | "capacity"
  | "badge"
>;
export type CatalogProduct = ProductCardData &
  Pick<Product, "description" | "featured" | "topics" | "warehouseSku" | "warehouseName">;
export type StorefrontProduct = CatalogProduct &
  Pick<
    Product,
    | "warehouseGroup"
    | "price"
    | "imageOverridden"
    | "warehouseSku"
    | "warehouseModelCodes"
    | "warehouseCategoryId"
    | "warehouseSubcategoryIds"
  >;
export type OverlayProduct = Pick<
  Product,
  | "price"
  | "id"
  | "slug"
  | "name"
  | "category"
  | "subtitle"
  | "description"
  | "image"
  | "fallbackImage"
  | "capacity"
  | "readability"
  | "connection"
  | "warehouseSku"
  | "warehouseName"
>;
export type ClientProduct = StorefrontProduct & OverlayProduct;
