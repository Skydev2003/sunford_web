"use client";
import { useCategories } from "@/features/cms/components/categories-provider";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Eye,
  Check,
  FileText,
  GripVertical,
  ImageIcon,
  Package,
  Pencil,
  Plus,
  Search,
  Save,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { SafetyDialog } from "./safety-dialog";

import { deleteProductAction } from "../server/product-actions";
import type { AdminProductSummary } from "../types";
import { AdminDetailLink } from "./admin-detail-link";
import { manageProductsAction } from "../server/product-table-actions";
import type { ProductTableCommand } from "../product-table-schema";

const PAGE_SIZE = 20;
const editedDate = new Intl.DateTimeFormat("th-TH", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});
const bulkLabels = {
  hide: "ซ่อนสินค้า",
  publish: "เผยแพร่สินค้า",
  category: "เปลี่ยนหมวดหมู่",
  delete: "ลบสินค้า",
};

export function AdminProductList({
  products,
  saved = false,
  categoryId,
}: {
  products: AdminProductSummary[];
  saved?: boolean;
  categoryId?: string;
}) {
  const categories = useCategories();
  const selectedCategory = categories.find(
    (category) => category.id === categoryId && category.id !== "all",
  );
  const categoryProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory.id)
    : products;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("updated");
  const [selected, setSelected] = useState(new Set<string>());
  const [bulk, setBulk] = useState<{
    type: keyof typeof bulkLabels;
    items: AdminProductSummary[];
  } | null>(null);
  const [destination, setDestination] = useState("");
  const [dragged, setDragged] = useState<string | null>(null);
  const [target, setTarget] = useState<AdminProductSummary | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(saved ? "บันทึกสินค้าเรียบร้อยแล้ว" : "");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const byOrder = (a: AdminProductSummary, b: AdminProductSummary) =>
    a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "th");
  const filtered = categoryProducts
    .filter(
      (p) =>
        `${p.name} ${p.slug}`.toLowerCase().includes(query.trim().toLowerCase()) &&
        (status === "all" || (status === "published" ? p.published : !p.published)),
    )
    .sort((a, b) =>
      sort === "updated"
        ? Date.parse(b.updatedAt) - Date.parse(a.updatedAt) || byOrder(a, b)
        : sort === "name"
          ? a.name.localeCompare(b.name, "th") || byOrder(a, b)
          : byOrder(a, b),
    );
  const published = categoryProducts.filter((p) => p.published).length;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filtered.slice(start, start + PAGE_SIZE);
  const selectedProducts = products.filter((product) => selected.has(product.id));
  const allVisibleSelected =
    visibleProducts.length > 0 && visibleProducts.every((product) => selected.has(product.id));
  const canReorder =
    sort === "order" && !query.trim() && status === "all" && products.length <= 5000 && !pending;
  const versions = (items: AdminProductSummary[]) =>
    items.map(({ id, updatedAt }) => ({ id, updatedAt }));
  function resetSelection() {
    setSelected(new Set());
    setPage(1);
  }
  function selectProduct(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5000) next.add(id);
      return next;
    });
  }
  function mutate(command: ProductTableCommand, message: string) {
    setError("");
    startTransition(async () => {
      try {
        const result = await manageProductsAction(command);
        if (result.error) setError(result.error);
        else {
          setBulk(null);
          setSelected(new Set());
          setNotice(message);
          router.refresh();
        }
      } catch {
        setError("บันทึกการเปลี่ยนแปลงไม่สำเร็จ กรุณาลองอีกครั้ง");
      }
    });
  }
  function reorder(from: string, to: string) {
    if (!canReorder || from === to) return;
    const ordered = [...categoryProducts].sort(byOrder);
    const source = ordered.findIndex((product) => product.id === from);
    const targetIndex = ordered.findIndex((product) => product.id === to);
    if (source < 0 || targetIndex < 0) return;
    ordered.splice(targetIndex, 0, ...ordered.splice(source, 1));
    const scope = new Set(ordered.map((product) => product.id));
    let index = 0;
    const next = [...products]
      .sort(byOrder)
      .map((product) => (scope.has(product.id) ? ordered[index++] : product));
    mutate({ type: "reorder", items: versions(next) }, "บันทึกลำดับสินค้าเรียบร้อยแล้ว");
    setDragged(null);
  }
  function confirmBulk() {
    if (!bulk) return;
    const items = versions(bulk.items);
    if (bulk.type === "category")
      mutate(
        { type: "category", items, categoryId: destination },
        `เปลี่ยนหมวดหมู่ ${items.length} รายการเรียบร้อยแล้ว`,
      );
    else
      mutate(
        { type: bulk.type, items },
        `${bulkLabels[bulk.type]} ${items.length} รายการเรียบร้อยแล้ว`,
      );
  }
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
          <h1>จัดการผลิตภัณฑ์</h1>
          <p>ดูแลทุกรายละเอียดของสินค้า ให้พร้อมสำหรับลูกค้าของคุณ</p>
        </div>
        <AdminDetailLink
          href="/admin/products/new"
          className="button button-red"
          kind="product"
          recordId="new"
          detailTitle="เพิ่มสินค้าใหม่"
        >
          <Plus size={17} /> เพิ่มสินค้าใหม่
        </AdminDetailLink>
      </div>
      <div className="admin-stats">
        {[
          {
            label: "สินค้าทั้งหมด",
            count: categoryProducts.length,
            icon: Package,
            suffix: "รายการในแคตตาล็อก",
          },
          { label: "เผยแพร่แล้ว", count: published, icon: Check, suffix: "แสดงอยู่บนเว็บไซต์" },
          {
            label: "ฉบับร่าง",
            count: categoryProducts.length - published,
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
      {error && !target && !bulk && (
        <div className="admin-alert error" role="alert">
          {error}
          <button
            type="button"
            onClick={() => {
              setError("");
              resetSelection();
              router.refresh();
            }}
          >
            โหลดใหม่
          </button>
        </div>
      )}
      <section className="admin-list-panel">
        {selectedCategory && (
          <div className="admin-category-filter">
            <strong>หมวดหมู่: {selectedCategory.label}</strong>
            <Link href="/admin/products">ดูทุกหมวดหมู่</Link>
          </div>
        )}
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
                disabled={pending}
                onClick={() => {
                  setStatus(option.value);
                  resetSelection();
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <label className="admin-table-search">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetSelection();
              }}
              placeholder="ค้นหาชื่อสินค้า หรือ URL…"
              aria-label="ค้นหาสินค้าในแอดมิน"
            />
          </label>
          <label className="admin-table-sort">
            เรียงตาม
            <select
              aria-label="เรียงลำดับสินค้า"
              value={sort}
              disabled={pending}
              onChange={(event) => {
                setSort(event.target.value);
                resetSelection();
              }}
            >
              <option value="updated">แก้ไขล่าสุด</option>
              <option value="order">ลำดับแสดงผล</option>
              <option value="name">ชื่อสินค้า ก–ฮ</option>
            </select>
          </label>
        </div>
        {selectedProducts.length > 0 && (
          <section className="admin-bulk-actions" aria-label="คำสั่งสำหรับสินค้าที่เลือก">
            <strong>เลือก {selectedProducts.length} รายการ</strong>
            {selectedProducts.length < filtered.length && filtered.length <= 5000 && (
              <button
                type="button"
                disabled={pending}
                onClick={() => setSelected(new Set(filtered.map((product) => product.id)))}
              >
                เลือกทั้งหมด {filtered.length} รายการที่กรองไว้
              </button>
            )}
            {(["hide", "publish", "category", "delete"] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={type === "delete" ? "admin-danger" : undefined}
                disabled={pending}
                onClick={() => {
                  setError("");
                  setDestination("");
                  setBulk({ type, items: selectedProducts });
                }}
              >
                {bulkLabels[type]}
              </button>
            ))}
            <button type="button" disabled={pending} onClick={() => setSelected(new Set())}>
              ยกเลิกเลือก
            </button>
          </section>
        )}
        {sort === "order" && (
          <p className="admin-reorder-hint">
            ลากที่จุดจับ หรือใช้ปุ่ม ↑ ↓ บนคีย์บอร์ดเพื่อเรียงสินค้า
            {query.trim() || status !== "all"
              ? " · ล้างคำค้นหาและเลือกสถานะทั้งหมดก่อนลากเรียง"
              : ""}
          </p>
        )}
        <div className="admin-table-scroll">
          <table className="admin-product-table">
            <thead>
              <tr>
                <th scope="col">
                  <label className="admin-select-heading">
                    <input
                      type="checkbox"
                      aria-label="เลือกสินค้าทั้งหมดในหน้านี้"
                      disabled={pending || !visibleProducts.length}
                      checked={allVisibleSelected}
                      ref={(element) => {
                        if (element)
                          element.indeterminate =
                            !allVisibleSelected &&
                            visibleProducts.some((product) => selected.has(product.id));
                      }}
                      onChange={() =>
                        setSelected((current) => {
                          const next = new Set(current);
                          visibleProducts.forEach((product) => {
                            if (allVisibleSelected) next.delete(product.id);
                            else if (next.size < 5000) next.add(product.id);
                          });
                          return next;
                        })
                      }
                    />
                    ผลิตภัณฑ์
                  </label>
                </th>
                <th scope="col">หมวดหมู่</th>
                <th scope="col">สถานะ</th>
                <th scope="col">ลำดับ</th>
                <th scope="col">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => (
                <tr
                  key={product.id}
                  data-selected={selected.has(product.id) || undefined}
                  data-dragged={dragged === product.id || undefined}
                  onDragOver={(event) => {
                    if (canReorder && dragged) event.preventDefault();
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (dragged) reorder(dragged, product.id);
                  }}
                >
                  <td>
                    <div className="admin-product-cell">
                      <div className="admin-select-drag">
                        <input
                          type="checkbox"
                          aria-label={`เลือก ${product.name}`}
                          checked={selected.has(product.id)}
                          disabled={pending}
                          onChange={() => selectProduct(product.id)}
                        />
                        {sort === "order" && (
                          <button
                            type="button"
                            className="admin-drag-handle"
                            aria-label={`ลากเรียง ${product.name}`}
                            title="ลากเรียง หรือใช้ปุ่มลูกศรขึ้น/ลง"
                            disabled={!canReorder}
                            draggable={canReorder}
                            onDragStart={(event) => {
                              setDragged(product.id);
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", product.id);
                            }}
                            onDragEnd={() => setDragged(null)}
                            onKeyDown={(event) => {
                              if (!canReorder || !["ArrowUp", "ArrowDown"].includes(event.key))
                                return;
                              event.preventDefault();
                              const ordered = [...categoryProducts].sort(byOrder);
                              const index =
                                ordered.findIndex((item) => item.id === product.id) +
                                (event.key === "ArrowUp" ? -1 : 1);
                              if (ordered[index]) reorder(product.id, ordered[index].id);
                            }}
                          >
                            <GripVertical size={16} />
                          </button>
                        )}
                      </div>
                      <AdminDetailLink
                        href={`/admin/products/${product.id}/edit`}
                        className="admin-thumb"
                        kind="product"
                        recordId={product.id}
                        detailTitle={product.name}
                      >
                        {product.image ? (
                          <Image src={product.image} alt={product.name} width={64} height={60} />
                        ) : (
                          <ImageIcon size={22} />
                        )}
                      </AdminDetailLink>
                      <div>
                        <AdminDetailLink
                          href={`/admin/products/${product.id}/edit`}
                          kind="product"
                          recordId={product.id}
                          detailTitle={product.name}
                        >
                          {product.name}
                        </AdminDetailLink>
                        <span>/{product.slug}</span>
                        <time className="admin-updated-at" dateTime={product.updatedAt}>
                          แก้ไข {editedDate.format(new Date(product.updatedAt))}
                        </time>
                        <button
                          type="button"
                          className="admin-featured-toggle"
                          aria-label={`สินค้าแนะนำ ${product.name}`}
                          aria-pressed={product.featured}
                          disabled={pending}
                          onClick={() =>
                            mutate(
                              {
                                type: "update",
                                items: versions([product]),
                                changes: { featured: !product.featured },
                              },
                              "บันทึกสินค้าแนะนำเรียบร้อยแล้ว",
                            )
                          }
                        >
                          <Star size={13} fill={product.featured ? "currentColor" : "none"} />
                          {product.featured ? "แนะนำ" : "ไม่แนะนำ"}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td data-label="หมวดหมู่">
                    {categories.find((c) => c.id === product.category)?.label}
                  </td>
                  <td data-label="สถานะ">
                    <button
                      type="button"
                      aria-label={`เผยแพร่ ${product.name}`}
                      aria-pressed={product.published}
                      disabled={pending}
                      className={`admin-status ${product.published ? "published" : "draft"}`}
                      onClick={() =>
                        mutate(
                          {
                            type: "update",
                            items: versions([product]),
                            changes: { published: !product.published },
                          },
                          "เปลี่ยนสถานะสินค้าเรียบร้อยแล้ว",
                        )
                      }
                    >
                      <i />
                      {product.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
                    </button>
                  </td>
                  <td data-label="ลำดับ">
                    <form
                      className="admin-inline-order"
                      key={product.updatedAt}
                      onSubmit={(event) => {
                        event.preventDefault();
                        const sortOrder = Number(
                          new FormData(event.currentTarget).get("sortOrder"),
                        );
                        mutate(
                          { type: "update", items: versions([product]), changes: { sortOrder } },
                          "บันทึกลำดับสินค้าเรียบร้อยแล้ว",
                        );
                      }}
                    >
                      <input
                        aria-label={`ลำดับ ${product.name}`}
                        name="sortOrder"
                        type="number"
                        min={0}
                        max={99999}
                        step={1}
                        required
                        defaultValue={product.sortOrder}
                        disabled={pending}
                      />
                      <button
                        type="submit"
                        disabled={pending}
                        aria-label={`บันทึกลำดับ ${product.name}`}
                      >
                        <Save size={15} />
                      </button>
                    </form>
                  </td>
                  <td data-label="จัดการ">
                    <div className="admin-row-actions">
                      {product.published && (
                        <Link
                          href={`/products/${product.slug}`}
                          target="_blank"
                          aria-label={`ดู ${product.name} บนเว็บไซต์`}
                        >
                          <Eye size={17} />
                        </Link>
                      )}
                      <AdminDetailLink
                        href={`/admin/products/${product.id}/edit`}
                        aria-label={`แก้ไข ${product.name}`}
                        kind="product"
                        recordId={product.id}
                        detailTitle={product.name}
                      >
                        <Pencil size={16} />
                      </AdminDetailLink>
                      <button
                        className="admin-danger"
                        aria-label={`ลบ ${product.name}`}
                        disabled={pending}
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
              <h2>
                {categoryProducts.length
                  ? "ไม่พบสินค้าที่ค้นหา"
                  : selectedCategory
                    ? "ยังไม่มีสินค้าในหมวดหมู่นี้"
                    : "เริ่มต้นคอลเลกชันของคุณ"}
              </h2>
              <p>
                {categoryProducts.length
                  ? "ลองเปลี่ยนคำค้นหาหรือสถานะสินค้า"
                  : "เพิ่มสินค้าชิ้นแรก เพื่อเริ่มแสดงผลิตภัณฑ์บนเว็บไซต์"}
              </p>
              {!categoryProducts.length && (
                <Link className="button button-red" href="/admin/products/new">
                  เพิ่มสินค้าใหม่
                </Link>
              )}
            </div>
          )}
        </div>
        <div className="admin-table-footer">
          <p role="status">
            แสดง {filtered.length ? start + 1 : 0}–{start + visibleProducts.length} จาก{" "}
            {filtered.length} รายการ
            {filtered.length !== categoryProducts.length &&
              ` (ทั้งหมด ${categoryProducts.length} รายการ)`}
          </p>
          <nav className="admin-pagination" aria-label="แบ่งหน้ารายการสินค้า">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
            >
              ก่อนหน้า
            </button>
            <span>
              หน้า {currentPage} จาก {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setPage(currentPage + 1)}
            >
              ถัดไป
            </button>
          </nav>
        </div>
      </section>
      <p className="admin-list-note">
        <ShieldNote /> การเปลี่ยนแปลงสินค้าที่เผยแพร่จะแสดงบนเว็บไซต์หลังบันทึก ·{" "}
        <Link href="/admin/trash">กู้คืนข้อมูลในถังขยะ</Link>
      </p>
      <SafetyDialog
        busy={pending}
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
            สินค้าจะถูกนำออกจากแคตตาล็อกและเว็บไซต์ โดยเก็บข้อมูลและรูปเดิมไว้ในถังขยะ
            สามารถกู้คืนเป็นแบบร่างได้
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
            <button className="admin-button-danger" disabled={pending} onClick={remove}>
              {pending ? "กำลังลบ…" : "ยืนยันลบสินค้า"}
            </button>
          </div>
        </div>
      </SafetyDialog>
      <SafetyDialog
        busy={pending}
        open={Boolean(bulk)}
        onClose={() => {
          if (!pending) {
            setBulk(null);
            setError("");
          }
        }}
        title={
          bulk ? `${bulkLabels[bulk.type]} ${bulk.items.length} รายการ?` : "จัดการสินค้าที่เลือก"
        }
      >
        <div className="admin-bulk-confirm">
          <p>ดำเนินการเฉพาะสินค้าที่เลือก {bulk?.items.length} รายการ</p>
          <ul>
            {bulk?.items.slice(0, 5).map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
          </ul>
          {bulk && bulk.items.length > 5 && <p>และอีก {bulk.items.length - 5} รายการ</p>}
          {bulk?.type === "delete" && (
            <p>
              นำออกจากแคตตาล็อกและเว็บไซต์ โดยยังเก็บข้อมูลและรูปเดิมไว้ในถังขยะ
              สามารถกู้คืนเป็นแบบร่างได้
            </p>
          )}
          {bulk?.type === "category" && (
            <label className="admin-field">
              หมวดหมู่ปลายทาง
              <select
                aria-label="หมวดหมู่ปลายทาง"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                disabled={pending}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories
                  .filter((category) => category.id !== "all")
                  .map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.label}
                    </option>
                  ))}
              </select>
            </label>
          )}
          {error && (
            <p className="admin-alert error" role="alert">
              {error}
            </p>
          )}
          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-button-secondary"
              disabled={pending}
              onClick={() => {
                setBulk(null);
                setError("");
              }}
            >
              ยกเลิก
            </button>
            <button
              type="button"
              className={bulk?.type === "delete" ? "admin-button-danger" : "button button-red"}
              disabled={pending || (bulk?.type === "category" && !destination)}
              onClick={confirmBulk}
            >
              {pending ? "กำลังดำเนินการ…" : "ยืนยันดำเนินการ"}
            </button>
          </div>
        </div>
      </SafetyDialog>
    </>
  );
}
function ShieldNote() {
  return <Check size={14} />;
}
