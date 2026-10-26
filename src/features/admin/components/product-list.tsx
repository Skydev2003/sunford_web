"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  FileText,
  ImageIcon,
  Package,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { categories } from "@/features/catalog/types";
import { deleteProductAction } from "../server/product-actions";
import type { AdminProduct } from "../types";
export function AdminProductList({
  products,
  saved = false,
}: {
  products: AdminProduct[];
  saved?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<AdminProduct | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(saved ? "บันทึกสินค้าเรียบร้อยแล้ว" : "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = products.filter(
    (p) =>
      `${p.name} ${p.slug}`.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" || (status === "published" ? p.published : !p.published)),
  );
  const published = products.filter((p) => p.published).length;
  function remove() {
    if (!target) return;
    const data = new FormData();
    data.set("id", target.id);
    data.set("updatedAt", target.updatedAt);
    startTransition(async () => {
      try {
        const result = await deleteProductAction(data);
        if (result.error) setError(result.error);
        else {
          setTarget(null);
          setNotice("ลบสินค้าเรียบร้อยแล้ว");
          router.refresh();
        }
      } catch {
        setError("ไม่สามารถลบสินค้าได้ กรุณาลองอีกครั้ง");
      }
    });
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">YOUR PRODUCT COLLECTION</span>
          <h1>
            จัดการผลิตภัณฑ์<span>.</span>
          </h1>
          <p>ดูแลทุกรายละเอียดของสินค้า ให้พร้อมสำหรับลูกค้าของคุณ</p>
        </div>
        <Link href="/admin/products/new" className="button button-red">
          <Plus size={17} /> เพิ่มสินค้าใหม่
        </Link>
      </div>
      <div className="admin-stats">
        {[
          {
            label: "สินค้าทั้งหมด",
            count: products.length,
            icon: Package,
            suffix: "รายการในแคตตาล็อก",
          },
          { label: "เผยแพร่แล้ว", count: published, icon: Check, suffix: "แสดงอยู่บนเว็บไซต์" },
          {
            label: "ฉบับร่าง",
            count: products.length - published,
            icon: FileText,
            suffix: "พร้อมให้คุณปรับแต่ง",
          },
        ].map(({ label, count, icon: Icon, suffix }) => (
          <div key={label}>
            <div>
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <strong>{String(count).padStart(2, "0")}</strong>
            <p>{suffix}</p>
          </div>
        ))}
      </div>
      {notice && (
        <div className="admin-alert success" role="status">
          {notice}
          <button aria-label="ปิดข้อความ" onClick={() => setNotice("")}>
            <X size={15} />
          </button>
        </div>
      )}
      <section className="admin-list-panel">
        <div className="admin-list-toolbar">
          <div className="admin-status-tabs" aria-label="กรองสถานะสินค้า">
            {[
              { value: "all", label: "ทั้งหมด" },
              { value: "published", label: "เผยแพร่แล้ว" },
              { value: "draft", label: "ฉบับร่าง" },
            ].map((option) => (
              <button
                key={option.value}
                className={status === option.value ? "active" : ""}
                aria-pressed={status === option.value}
                onClick={() => setStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="admin-table-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาชื่อสินค้า หรือ URL…"
              aria-label="ค้นหาสินค้าในแอดมิน"
            />
          </label>
        </div>
        <div className="admin-table-scroll">
          <table className="admin-product-table">
            <thead>
              <tr>
                <th scope="col">ผลิตภัณฑ์</th>
                <th scope="col">หมวดหมู่</th>
                <th scope="col">สถานะ</th>
                <th scope="col">ลำดับ</th>
                <th scope="col">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      <Link href={`/admin/products/${product.id}/edit`} className="admin-thumb">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} width={64} height={60} />
                        ) : (
                          <ImageIcon size={22} />
                        )}
                      </Link>
                      <div>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          {product.name}
                          {product.featured && <span className="admin-featured">แนะนำ</span>}
                        </Link>
                        <span>/{product.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td>{categories.find((c) => c.id === product.category)?.label}</td>
                  <td>
                    <span className={`admin-status ${product.published ? "published" : "draft"}`}>
                      <i />
                      {product.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </span>
                  </td>
                  <td>{product.sortOrder}</td>
                  <td>
                    <div className="admin-row-actions">
                      {product.published && (
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          aria-label={`ดู ${product.name} บนเว็บไซต์`}
                        >
                          <ArrowUpRight size={17} />
                        </Link>
                      )}
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        aria-label={`แก้ไข ${product.name}`}
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        aria-label={`ลบ ${product.name}`}
                        onClick={() => {
                          setError("");
                          setTarget(product);
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="admin-empty">
              <Package size={33} strokeWidth={1.2} />
              <h2>{products.length ? "ไม่พบสินค้าที่ค้นหา" : "เริ่มต้นคอลเลกชันของคุณ"}</h2>
              <p>
                {products.length
                  ? "ลองเปลี่ยนคำค้นหาหรือสถานะสินค้า"
                  : "เพิ่มสินค้าชิ้นแรก เพื่อเริ่มแสดงผลิตภัณฑ์บนเว็บไซต์"}
              </p>
              {!products.length && (
                <Link className="button button-red" href="/admin/products/new">
                  เพิ่มสินค้าใหม่
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="admin-table-footer">
          แสดง {filtered.length} จาก {products.length} รายการ
          <span>ข้อมูลล่าสุดจากแคตตาล็อก Sunford</span>
        </div>
      </section>
      <p className="admin-list-note">
        <ShieldNote /> การเปลี่ยนแปลงสินค้าที่เผยแพร่จะแสดงบนเว็บไซต์หลังบันทึก
      </p>
      <Modal
        open={Boolean(target)}
        onClose={() => {
          if (!pending) setTarget(null);
        }}
        title="ลบผลิตภัณฑ์นี้?"
      >
        <div className="admin-delete-copy">
          <div className="admin-delete-icon">
            <Trash2 size={25} />
          </div>
          <p>
            คุณกำลังลบ <strong>{target?.name}</strong>
          </p>
          <p>
            สินค้าจะถูกนำออกจากแคตตาล็อกและเว็บไซต์ รูปที่ไม่มีสินค้าอื่นใช้งานจะถูกลบจาก Storage
            ด้วย
          </p>
          {error && (
            <p className="admin-alert error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-modal-actions">
            <button
              className="admin-button-secondary"
              disabled={pending}
              onClick={() => setTarget(null)}
            >
              ยกเลิก
            </button>
            <button className="button button-red" disabled={pending} onClick={remove}>
              {pending ? "กำลังลบ…" : "ยืนยันลบสินค้า"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
function ShieldNote() {
  return <Check size={14} />;
}
