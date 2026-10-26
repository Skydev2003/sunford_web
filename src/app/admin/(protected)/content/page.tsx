import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/server/auth";
import { listContentEditors, settingCards } from "@/features/cms/server/editors";
import { ContentList } from "@/features/cms/components/content-list";
export default async function ContentAdminPage() {
  await requireAdmin();
  const pages = await listContentEditors();
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">WEBSITE CONTENT</span>
          <h1>
            จัดการเนื้อหา<span>.</span>
          </h1>
          <p>แก้ไขหน้าแรก เมนู ข่าว บทความ ซอฟต์แวร์ และวิดีโอ</p>
        </div>
        <Link className="button button-red" href={`/admin/content/page:${crypto.randomUUID()}`}>
          <Plus size={16} />
          เพิ่มหน้าข้อมูล
        </Link>
      </div>
      <div className="cms-card-grid">
        {settingCards.map((card) => (
          <Link
            className="admin-form-card"
            key={card.id}
            href={`/admin/content/${encodeURIComponent(card.id)}`}
          >
            <h2>{card.title} →</h2>
            <p>{card.description}</p>
          </Link>
        ))}
      </div>
      <h2>หน้าข้อมูล ข่าว และบทความ ({pages.length})</h2>
      <ContentList pages={pages} />
    </>
  );
}
