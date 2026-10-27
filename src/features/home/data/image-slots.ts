export const defaultSpotlightProductId = "acs30-jc21";
export const defaultSpotlightImage = "/images/products/acs30-jc21-cutout.png";
export const defaultSpotlightVideo = "/videos/jc21-panel-aligned-1080p.mp4";
export const defaultSpotlightPoster = "/images/products/jc21-panel-aligned-poster.png";

export const homeImageSlots = [
  {
    id: "spotlight",
    title: "รูปสินค้าเด่นบนพื้นดำ",
    description: "รูปสินค้า JC21 แบบพื้นหลังโปร่งใส สำหรับแบนเนอร์สินค้าเด่นกึ่งกลางหน้า",
  },
  { id: "digital", title: "เครื่องชั่งดิจิทัล", description: "การ์ดหมวดเครื่องชั่งดิจิทัล" },
  { id: "smart", title: "เครื่องชั่งอัจฉริยะ", description: "การ์ดหมวดเครื่องชั่งอัจฉริยะ" },
  { id: "accessories", title: "อุปกรณ์เสริม", description: "การ์ดหมวดอุปกรณ์เสริม" },
  { id: "software", title: "แอปพลิเคชันและซอฟต์แวร์", description: "การ์ดแอปพลิเคชันและซอฟต์แวร์" },
] as const;

export type HomeImageSlot = (typeof homeImageSlots)[number]["id"];
export type HomeImages = Partial<Record<HomeImageSlot, string>>;

export function defaultHomeImages(): HomeImages {
  return {
    spotlight: defaultSpotlightImage,
    digital: "/images/pd/WPS10KS.png",
    smart: "/images/pd/RLS1100.png",
    accessories: "/images/pd/TRP-58B.png",
    software: "/images/pd/app.png",
  };
}
