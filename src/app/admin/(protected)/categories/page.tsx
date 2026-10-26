import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdmin } from "@/features/admin/server/auth";
import { getCategories } from "@/features/cms/server/categories";
export default async function CategoriesPage() {
  await requireAdmin();
  const categories = (await getCategories()).filter((category) => category.id !== "all");
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">PRODUCT CATEGORIES</span>
          <h1>
            หมวดหมู่สินค้า<span>.</span>
          </h1>
          <p>เพิ่ม เปลี่ยนชื่อ หรือลบหมวดหมู่ โดยย้ายสินค้าไปหมวดที่เลือกก่อนลบ</p>
        </div>
        <Link href={`/admin/content/category:${crypto.randomUUID()}`} className="button button-red">
          <Plus size={16} />
          เพิ่มหมวดหมู่
        </Link>
      </div>
      <div className="cms-card-grid">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/admin/content/category:${category.id}`}
            className="admin-form-card"
          >
            <h2>{category.label} →</h2>
            <p>{category.english}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
