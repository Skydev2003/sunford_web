import Link from "next/link";
import { HomeImageEditor } from "@/features/admin/components/home-image-editor";
import { listHomeImages } from "@/features/admin/server/home-images";
import { getProducts } from "@/features/catalog/server/product-repository";
import { getContentPage } from "@/features/content/server/content-repository";
import { defaultHomeImages, homeImageSlots } from "@/features/home/data/image-slots";
import { resolveHomeLink } from "@/features/home/data/link-targets";
import { homePageOptions } from "@/features/home/server/home-link-options";
import { homeSettingCards } from "@/features/cms/data/admin-sections";
import { AdminDetailLink } from "@/features/admin/components/admin-detail-link";

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
    (await getContentPage("/applications-and-softwares"))?.images[0],
  );
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
          <span className="admin-eyebrow">HOMEPAGE CONTENT</span>
          <h1>จัดการหน้าแรก</h1>
          <p>จัดการข้อความ รูปภาพ และลิงก์ เรียงตามส่วนที่แสดงบนหน้าเว็บไซต์</p>
        </div>
        <Link href="/" target="_blank" className="admin-button-secondary">
          ดูหน้าแรก
        </Link>
      </div>
      {homeImageSlots.some((slot) => slot.id === savedSlot) && (
        <div className="admin-alert success" role="status">
          บันทึกรูปภาพและปลายทางเรียบร้อยแล้ว
        </div>
      )}
      <nav className="admin-home-section-nav" aria-label="ส่วนต่าง ๆ ของหน้าแรก">
        {homeSettingCards.map((card) => (
          <a key={card.id} href={`#home-${card.id}`}>
            {card.title}
          </a>
        ))}
      </nav>
      <div className="admin-home-sections">
        {homeSettingCards.map((card, index) => (
          <section
            className="admin-home-section"
            id={`home-${card.id}`}
            key={card.id}
            aria-labelledby={`heading-${card.id}`}
          >
            <div className="admin-home-section-heading">
              <div>
                <span className="admin-eyebrow">ส่วนที่ {index + 1}</span>
                <h2 id={`heading-${card.id}`}>{card.title}</h2>
                <p>{card.description}</p>
              </div>
              <AdminDetailLink
                href={`/admin/content/${encodeURIComponent(card.id)}`}
                className="admin-button-secondary"
                kind="content"
                recordId={card.id}
                detailTitle={card.title}
              >
                แก้ไข{card.title}
              </AdminDetailLink>
            </div>
            {card.imageSlots.length > 0 && (
              <>
                <p className="admin-list-note">
                  บันทึกรูปภาพและปลายทางแยกแต่ละช่อง ปุ่ม “ใช้รูปเดิม” จะคืนรูปเดิมเมื่อบันทึก
                </p>
                <div className="admin-home-images-grid">
                  {homeImageSlots
                    .filter((slot) => card.imageSlots.includes(slot.id))
                    .map((slot) => {
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
            )}
          </section>
        ))}
      </div>
    </>
  );
}
