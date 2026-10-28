"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SafetyDialog } from "./safety-dialog";
import { restoreItemAction } from "../server/restore-actions";
import { safetyLabels, type TrashItem } from "../safety-types";

export function TrashList({
  items,
  categories,
}: {
  items: TrashItem[];
  categories: { id: string; label: string }[];
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<TrashItem | null>(null);
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = items.filter((item) =>
    `${item.title} ${safetyLabels[item.kind]}`.toLowerCase().includes(query.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20));
  const current = Math.min(page, pages);
  function restore() {
    if (!target) return;
    setError("");
    startTransition(async () => {
      try {
        const result = await restoreItemAction({
          id: target.id,
          kind: target.kind,
          updatedAt: target.updatedAt,
          ...(target.kind === "product" ? { category } : {}),
        });
        if (result.error) setError(result.error);
        else {
          setNotice(`กู้คืน ${target.title} เรียบร้อยแล้ว`);
          setTarget(null);
          router.refresh();
        }
      } catch {
        setError("กู้คืนไม่สำเร็จ กรุณาลองใหม่");
      }
    });
  }
  return (
    <>
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">RECOVERY</span>
          <h1>ถังขยะ</h1>
          <p>ข้อมูลและรูปเดิมยังเก็บไว้ กู้คืนสินค้าและหน้าข้อมูลเป็นแบบร่างก่อนเผยแพร่</p>
        </div>
        <Link href="/admin/audit" className="admin-button-secondary">
          ประวัติการแก้ไข
        </Link>
      </div>
      {notice && (
        <p role="status" className="admin-alert">
          {notice}
        </p>
      )}
      <input
        type="search"
        className="cms-directory-search"
        aria-label="ค้นหาในถังขยะ"
        placeholder="ค้นหาชื่อหรือประเภทข้อมูล…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />
      <ul className="admin-trash-list">
        {filtered.slice((current - 1) * 20, current * 20).map((item) => (
          <li key={`${item.kind}:${item.id}`}>
            <div>
              <strong>{item.title}</strong>
              <p>
                {safetyLabels[item.kind]} · ลบเมื่อ{" "}
                {new Date(item.deletedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}
              </p>
            </div>
            <button
              type="button"
              className="admin-button-secondary"
              disabled={pending}
              onClick={() => {
                setError("");
                setTarget(item);
                setCategory(
                  categories.some((entry) => entry.id === item.category) ? item.category! : "",
                );
              }}
            >
              กู้คืน {item.title}
            </button>
          </li>
        ))}
      </ul>
      {!filtered.length && (
        <p className="admin-empty">
          {items.length ? "ไม่พบข้อมูลที่ค้นหา" : "ไม่มีข้อมูลในถังขยะ"}
        </p>
      )}
      <nav className="admin-pagination" aria-label="แบ่งหน้าถังขยะ">
        <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)}>
          ก่อนหน้า
        </button>
        <span>
          หน้า {current} จาก {pages} · {filtered.length} รายการ
        </span>
        <button type="button" disabled={current === pages} onClick={() => setPage(current + 1)}>
          ถัดไป
        </button>
      </nav>
      <SafetyDialog
        open={!!target}
        busy={pending}
        title="ยืนยันกู้คืนข้อมูล"
        onClose={() => setTarget(null)}
      >
        <p>
          กู้คืน <strong>{target?.title}</strong>
        </p>
        <p>
          {target?.kind === "category"
            ? "หมวดหมู่จะกลับมาใช้งานได้ โดยสินค้าที่เคยย้ายออกยังคงอยู่หมวดปลายทาง"
            : "ข้อมูลจะกลับมาเป็นแบบร่าง ยังไม่แสดงบนหน้าเว็บจนกว่าจะสั่งเผยแพร่"}
        </p>
        {target?.kind === "product" && (
          <label className="admin-field">
            หมวดหมู่หลังการกู้คืน
            <select
              aria-label="หมวดหมู่หลังการกู้คืน"
              value={category}
              disabled={pending}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {error && (
          <p role="alert" className="admin-alert error">
            {error}
          </p>
        )}
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-button-secondary"
            disabled={pending}
            onClick={() => setTarget(null)}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            className="button button-red"
            disabled={pending || (target?.kind === "product" && !category)}
            onClick={restore}
          >
            {pending ? "กำลังกู้คืน…" : "ยืนยันกู้คืน"}
          </button>
        </div>
      </SafetyDialog>
    </>
  );
}
