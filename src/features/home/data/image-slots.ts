import type { Product } from "@/features/catalog/types";

export const homeImageSlots = [
  {
    id: "spotlight",
    title: "สินค้าเด่นบนพื้นดำ",
    description: "รูปเครื่องชั่งในส่วน ชั่ง. พิมพ์. จัดการ.",
  },
  { id: "digital", title: "เครื่องชั่งดิจิทัล", description: "การ์ดหมวดเครื่องชั่งดิจิทัล" },
  { id: "smart", title: "เครื่องชั่งอัจฉริยะ", description: "การ์ดหมวดเครื่องชั่งอัจฉริยะ" },
  { id: "accessories", title: "อุปกรณ์เสริม", description: "การ์ดหมวดอุปกรณ์เสริม" },
  { id: "software", title: "แอปพลิเคชันและซอฟต์แวร์", description: "การ์ดแอปพลิเคชันและซอฟต์แวร์" },
] as const;

export type HomeImageSlot = (typeof homeImageSlots)[number]["id"];
export type HomeImages = Partial<Record<HomeImageSlot, string>>;

export function defaultHomeImages(products: Product[], softwareImage?: string): HomeImages {
  const smart = products.find((p) => p.id === "rls1100");
  return {
    spotlight: smart?.imageOverridden ? smart.image : "/images/products/rls1100.png",
    digital: "/images/pd/WPS10KS.png",
    smart: smart?.image,
    accessories: products.find((p) => /^LP50|^LP51/i.test(p.name))?.image,
    software: softwareImage,
  };
}
