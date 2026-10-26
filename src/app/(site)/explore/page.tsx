import type { Metadata } from "next";
import { ContentDirectory } from "@/features/content/components/content-directory";
import { getContentPages } from "@/features/content/server/content-repository";

export const metadata: Metadata = { title: "สำรวจ Sunford" };
export default async function ExplorePage() {
  const pages = (await getContentPages())
    .filter((page) => page.kind !== "product" && page.path !== "/")
    .map(({ path, title, kind, images }) => ({ path, title, kind, image: images[0] }));
  return (
    <main id="main-content" className="explore-page container">
      <div className="content-heading">
        <p className="eyebrow">EXPLORE SUNFORD</p>
        <h1>
          ทุกเรื่องของ Sunford.
          <br />
          <span>ค้นพบได้ในที่เดียว.</span>
        </h1>
        <p>ผลิตภัณฑ์ โซลูชัน ซอฟต์แวร์ และข้อมูลที่ช่วยให้คุณเลือกได้ง่ายขึ้น</p>
      </div>
      <ContentDirectory pages={pages} />
    </main>
  );
}
