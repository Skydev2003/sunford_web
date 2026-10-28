import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/server/auth";
import { getCategories } from "@/features/cms/server/categories";
import { Suspense } from "react";
import { AdminPageLoading } from "@/features/admin/components/admin-page-loading";
import { getAdminCategoryCounts } from "@/features/admin/server/products";
import { AdminDetailLink } from "@/features/admin/components/admin-detail-link";

export default function CategoriesPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <CategoriesContent />
    </Suspense>
  );
}
async function CategoriesContent() {
  await requireAdmin();
  const [allCategories, counts] = await Promise.all([getCategories(), getAdminCategoryCounts()]);
  const categories = allCategories.filter((category) => category.id !== "all");
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">PRODUCT CATEGORIES</span>
          <h1>หมวดหมู่สินค้า</h1>
          <p>เพิ่ม เปลี่ยนชื่อ หรือลบหมวดหมู่ โดยย้ายสินค้าไปหมวดที่เลือกก่อนลบ</p>
        </div>
        <NewCategoryLink />
      </div>
      <div className="cms-card-grid">
        {categories.map((category) => (
          <article key={category.id} className="admin-form-card admin-category-card">
            <h2>{category.label}</h2>
            <p>{category.english}</p>
            <p className="admin-category-count">
              <strong>{counts[category.id] ?? 0}</strong> สินค้า
            </p>
            <div className="admin-category-actions">
              <Link
                href={`/admin/products?category=${encodeURIComponent(category.id)}`}
                aria-label={`ดูสินค้าในหมวด${category.label}`}
              >
                ดูสินค้า
              </Link>
              <AdminDetailLink
                href={`/admin/content/${encodeURIComponent(`category:${category.id}`)}`}
                aria-label={`แก้ไขหมวดหมู่${category.label}`}
                kind="content"
                recordId={`category:${category.id}`}
                detailTitle={`หมวดหมู่: ${category.label}`}
              >
                แก้ไขหมวดหมู่
              </AdminDetailLink>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function NewCategoryLink() {
  const id = `category:${crypto.randomUUID()}`;
  return (
    <AdminDetailLink
      href={`/admin/content/${encodeURIComponent(id)}`}
      className="button button-red"
      kind="content"
      recordId={id}
      detailTitle="เพิ่มหมวดหมู่"
    >
      <Plus size={16} />
      เพิ่มหมวดหมู่
    </AdminDetailLink>
  );
}
