"use client";

import { useRef } from "react";
import { CircleHelp, GitCompareArrows, X } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useCatalogStore } from "@/stores/catalog-store";
import styles from "./product-detail.module.css";

export function ReadabilityHelp() {
  const dialog = useRef<HTMLDialogElement>(null);
  const explanation =
    "ค่าละเอียด คือหน่วยย่อยที่สุดที่หน้าจอเครื่องชั่งแสดงได้ เช่น ค่าละเอียด 1 กรัม จะแสดงน้ำหนักเพิ่มหรือลดทีละ 1 กรัม";
  return (
    <>
      <Tooltip content={explanation}>
        <button
          className={styles.help}
          type="button"
          aria-label="ค่าละเอียดคืออะไร"
          aria-haspopup="dialog"
          onClick={() => dialog.current?.showModal()}
        >
          <CircleHelp size={15} />
        </button>
      </Tooltip>
      <dialog className={styles.popup} ref={dialog} aria-label="ค่าอ่านละเอียด">
        <div className={styles.dialogHeader}>
          <h3>ค่าอ่านละเอียด</h3>
          <button type="button" onClick={() => dialog.current?.close()} aria-label="ปิด">
            <X size={18} />
          </button>
        </div>
        <p>{explanation}</p>
      </dialog>
    </>
  );
}

type Candidate = { id: string; name: string; sku?: string };

export function ProductDetailCompare({
  currentId,
  candidates,
  direct = false,
}: {
  currentId: string;
  candidates: Candidate[];
  direct?: boolean;
}) {
  const chooser = useRef<HTMLDialogElement>(null);
  const selected = useCatalogStore((s) => s.compareIds);
  const canAdd = (id: string) => new Set([...selected, currentId, id]).size <= 3;
  function compare(id: string) {
    const store = useCatalogStore.getState();
    const ids = [...new Set([...store.compareIds, currentId, id])];
    if (ids.length > 3) return;
    chooser.current?.close();
    store.startCompare();
    for (const next of ids) if (!store.compareIds.includes(next)) store.toggleCompare(next);
    store.setCompareOpen(true);
  }
  const full = !candidates.some((c) => canAdd(c.id));
  return (
    <>
      <button
        className={styles.compare}
        type="button"
        disabled={full}
        title={full ? "เปรียบเทียบได้สูงสุด 3 รุ่น" : undefined}
        aria-haspopup="dialog"
        onClick={() => (direct ? compare(candidates[0].id) : chooser.current?.showModal())}
      >
        {!direct && <GitCompareArrows size={16} />}เปรียบเทียบสินค้า
      </button>
      {!direct && (
        <dialog className={styles.popup} ref={chooser} aria-label="เลือกรุ่นเพื่อเปรียบเทียบ">
          <div className={styles.dialogHeader}>
            <h3>เลือกรุ่นเพื่อเปรียบเทียบ</h3>
            <button type="button" aria-label="ปิด" onClick={() => chooser.current?.close()}>
              <X size={18} />
            </button>
          </div>
          {candidates.map((c) => (
            <button
              key={c.id}
              className={styles.option}
              type="button"
              onClick={() => compare(c.id)}
              disabled={!canAdd(c.id)}
            >
              {c.name}
              {c.sku && <small>{c.sku}</small>}
            </button>
          ))}
        </dialog>
      )}
    </>
  );
}
