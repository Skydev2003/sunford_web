import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HomeImageEditor } from "@/features/admin/components/home-image-editor";
import { listHomeImages } from "@/features/admin/server/home-images";
import { getProducts } from "@/features/catalog/server/product-repository";
import { defaultHomeImages, homeImageSlots } from "@/features/home/data/image-slots";
import { resolveHomeLink } from "@/features/home/data/link-targets";
import { homePageOptions } from "@/features/home/server/home-link-options";

export const instant = false;

export default async function HomeImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  // Require admin before reading settings; layout guards alone are not an authorization boundary.
  const images = await listHomeImages();
  const products = await getProducts();
  const defaults = defaultHomeImages();
  const savedSlot = (await searchParams).saved;
  const productOptions = products.map(({ id, name, slug }) => ({
    id,
    name,
    href: `/products/${slug}`,
  }));
  const pageOptions = await homePageOptions();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">YOUR HOMEPAGE IMAGES</span>
          <h1>
            รูปภาพหน้าแรก<span>.</span>
          </h1>
          <p>เลือกรูปและหน้าปลายทางที่ต้องการให้เปิดเมื่อคลิก แล้วกดบันทึกในช่องนั้น</p>
        </div>
        <Link href="/" target="_blank" className="admin-button-secondary">
          ดูหน้าแรก <ArrowUpRight size={15} />
        </Link>
      </div>
      {homeImageSlots.some((slot) => slot.id === savedSlot) && (
        <div className="admin-alert success" role="status">
          บันทึกรูปภาพและปลายทางเรียบร้อยแล้ว
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
              currentProductId={current?.targetProductId}
              currentPagePath={current?.targetPagePath}
              defaultHref={resolveHomeLink(slot.id, undefined, products)}
              products={productOptions}
              pages={pageOptions}
            />
          );
        })}
      </div>
    </>
  );
}
