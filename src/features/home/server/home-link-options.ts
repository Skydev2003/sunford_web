import "server-only";
import { getContentPages } from "@/features/content/server/content-repository";
import { type HomePageOption } from "../data/link-targets";

export async function homePageOptions(): Promise<HomePageOption[]> {
  const options: HomePageOption[] = [
    { path: "/", title: "หน้าแรก" },
    { path: "/products", title: "ผลิตภัณฑ์ทั้งหมด" },
    { path: "/explore", title: "สำรวจ Sunford" },
    ...(await getContentPages())
      .filter((page) => page.kind !== "product")
      .map(({ path, title }) => ({ path, title })),
  ];
  return options.filter(
    (page, index) =>
      page.path.startsWith("/") &&
      !page.path.startsWith("//") &&
      !/^\/(admin|api)(\/|$)/i.test(page.path) &&
      !/[\\\r\n]/.test(page.path) &&
      options.findIndex((item) => item.path === page.path) === index,
  );
}
