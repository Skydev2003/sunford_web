import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HomeImageEditor } from "@/features/admin/components/home-image-editor";
import { listHomeImages } from "@/features/admin/server/home-images";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getContentPage } from "@/features/content/server/content-repository";
import { defaultHomeImages, homeImageSlots } from "@/features/home/data/image-slots";

export const instant = false;

export default async function HomeImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  // Require admin before reading settings; layout guards alone are not an authorization boundary.
  const images = await listHomeImages();
  const products = await getProducts();
  const defaults = defaultHomeImages(
    products,
    getContentPage("/applications-and-softwares")?.images[0],
  );
  const savedSlot = (await searchParams).saved;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">YOUR HOMEPAGE IMAGES</span>
          <h1>
            รูปภาพหน้าแรก<span>.</span>
          </h1>
          <p>เปลี่ยนรูปแต่ละตำแหน่งได้แยกจากรูปสินค้า เลือกรูปแล้วกดบันทึกในช่องนั้น</p>
        </div>
        <Link href="/" target="_blank" className="admin-button-secondary">
          ดูหน้าแรก <ArrowUpRight size={15} />
        </Link>
      </div>
      {homeImageSlots.some((slot) => slot.id === savedSlot) && (
        <div className="admin-alert success" role="status">
          บันทึกรูปภาพเรียบร้อยแล้ว
        </div>
      )}
      <p className="admin-list-note">
        ปุ่ม “ใช้รูปเดิม” จะนำรูปเดิมของเว็บไซต์กลับมาแสดงเมื่อกดบันทึก
        ข้อมูลและรูปสินค้าจะยังเหมือนเดิม
      </p>
      <div className="admin-home-images-grid">
        {homeImageSlots.map((slot) => {
          const current = images.find((image) => image.slot === slot.id);
          return (
            <HomeImageEditor
              key={`${slot.id}:${current?.updatedAt ?? "default"}`}
              slot={slot.id}
              title={slot.title}
              description={slot.description}
              currentImage={current?.image}
              updatedAt={current?.updatedAt}
              defaultImage={defaults[slot.id]}
            />
          );
        })}
      </div>
    </>
  );
}
