import snapshot from "./solutions.json";
import type { SourcePage } from "../types";

export const solutions = snapshot as (SourcePage & { id: string })[];
export const solutionsIndex: SourcePage = {
  path: "/solutions",
  title: "โซลูชัน",
  sourceUrl: "https://www.sunford.co/",
  html: "",
  text: "โซลูชันการชั่งน้ำหนัก การเชื่อมต่อข้อมูล งานพิมพ์ และระบบควบคุมจาก Sunford",
  images: [],
  kind: "page",
  productHandles: [],
  collectionIds: [],
};
