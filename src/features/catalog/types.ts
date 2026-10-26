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

export type CategoryId = (typeof categories)[number]["id"];
export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Exclude<CategoryId, "all">;
  subtitle: string;
  description: string;
  image: string;
  capacity: string;
  readability: string;
  connection: string;
  badge: string | null;
  featured: boolean;
  sortOrder: number;
  sourceId?: string;
  sourceUrl?: string;
  price?: number | null;
};
