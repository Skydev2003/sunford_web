import { AdminDetailLink } from "@/features/admin/components/admin-detail-link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/server/auth";
import { listContentEditors } from "@/features/cms/server/editors";
import { ContentList } from "@/features/cms/components/content-list";
import { Suspense } from "react";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";

export default function ContentAdminPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <ContentAdminContent />
    </Suspense>
  );
}
async function ContentAdminContent() {
  await requireAdmin();
  const pages = await listContentEditors();
  const newPageId = `page:${crypto.randomUUID()}`;
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">WEBSITE CONTENT</span>
          <h1>
            หน้าข้อมูลและบทความ<span>.</span>
          </h1>
          <p>เพิ่มและแก้ไขหน้าข้อมูล ข่าว บทความ และเนื้อหาซอฟต์แวร์</p>
        </div>
        <AdminDetailLink
          className="button button-red"
          href={`/admin/content/${encodeURIComponent(newPageId)}`}
          kind="content"
          recordId={newPageId}
          detailTitle="เพิ่มหน้าข้อมูล"
        >
          <Plus size={16} />
          เพิ่มหน้าข้อมูล
        </AdminDetailLink>
      </div>
      <h2>หน้าข้อมูล ข่าว และบทความ ({pages.length})</h2>
      <ContentList pages={pages} />
    </>
  );
}
