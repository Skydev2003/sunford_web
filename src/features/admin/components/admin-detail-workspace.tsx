"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ProductForm } from "./product-form";
import { DocumentEditor } from "@/features/cms/components/document-editor";
import { loadAdminDetail } from "../server/detail-actions";
import type { AdminDetailHandle, AdminDetailModel } from "../detail-types";

import { AdminDetailContext, type AdminDetailTarget } from "./admin-detail-link";
import { AdminUnsavedChanges } from "./unsaved-changes";
import { SafetyDialog } from "./safety-dialog";
import { adminEditorPattern } from "../editor-pattern";

export function AdminDetailWorkspace({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdminUnsavedChanges>
      <DetailWorkspace key={pathname}>{children}</DetailWorkspace>
    </AdminUnsavedChanges>
  );
}

function DetailWorkspace({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<AdminDetailTarget | null>(null);
  const [model, setModel] = useState<AdminDetailModel | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const form = useRef<AdminDetailHandle>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const request = useRef(0);
  const router = useRouter();

  function dismiss() {
    request.current += 1;
    setTarget(null);
    setModel(null);
    setLoading(false);
    setBusy(false);
    const previousTrigger = trigger.current;
    requestAnimationFrame(() => {
      if (!panel.current) previousTrigger?.focus({ preventScroll: true });
    });
  }
  async function close() {
    if (busy) return;
    if (form.current) await form.current.cancel();
    else dismiss();
  }
  async function open(next: AdminDetailTarget, element: HTMLElement) {
    if (busy || (target?.kind === next.kind && target.id === next.id)) return;
    if (target) {
      if (form.current && !(await form.current.cancel())) return;
    }
    trigger.current = element;
    const currentRequest = ++request.current;
    setTarget(next);
    setModel(null);
    setError("");
    setLoading(true);
    try {
      const result = await loadAdminDetail(next.kind, next.id);
      if (request.current !== currentRequest) return;
      if ("error" in result) setError(result.error);
      else setModel(result);
    } catch {
      if (request.current === currentRequest) setError("โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
    } finally {
      if (request.current === currentRequest) setLoading(false);
    }
  }
  function saved() {
    dismiss();
    router.refresh();
  }
  useEffect(() => {
    if (target) {
      panel.current?.focus({ preventScroll: true });
      panel.current?.querySelector(".admin-detail-body")?.scrollTo({ top: 0 });
    }
  }, [target]);
  useEffect(() => {
    if (!target) return;
    function escape(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector("dialog[open]")
      ) {
        event.preventDefault();
        void close();
      }
    }
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  });
  const modal = !!target && adminEditorPattern(target.kind, target.id) === "modal";
  const editor = target && (
    <>
      {loading && <p role="status">กำลังโหลดรายละเอียด…</p>}
      {error && (
        <p className="admin-alert error" role="alert">
          {error}
        </p>
      )}
      {model?.kind === "product" && (
        <ProductForm
          key={target.id}
          product={model.product}
          compact
          detailRef={form}
          onClose={dismiss}
          onSaved={saved}
          onBusyChange={setBusy}
        />
      )}
      {model?.kind === "content" && (
        <DocumentEditor
          key={target.id}
          {...model.editor}
          compact={modal}
          detailRef={form}
          onClose={dismiss}
          onSaved={saved}
          onBusyChange={setBusy}
        />
      )}
    </>
  );
  return (
    <AdminDetailContext.Provider
      value={{ open, selected: target ? `${target.kind}:${target.id}` : undefined }}
    >
      {children}
      {target && !modal && (
        <aside
          className="admin-detail-panel"
          aria-labelledby="admin-detail-title"
          tabIndex={-1}
          ref={panel}
        >
          <header className="admin-detail-header">
            <h2 id="admin-detail-title">{target.title}</h2>
            <button
              type="button"
              aria-label="ปิดแผงรายละเอียด"
              disabled={busy}
              onClick={() => void close()}
            >
              <X size={20} />
            </button>
          </header>
          <div className="admin-detail-body">{editor}</div>
        </aside>
      )}
      <SafetyDialog
        open={modal}
        busy={busy}
        title={target?.title ?? "แก้ไขข้อมูล"}
        closeLabel="ปิดหน้าต่างแก้ไข"
        className="admin-editor-modal"
        onClose={() => void close()}
      >
        <div className="admin-editor-modal-content">{modal && editor}</div>
      </SafetyDialog>
    </AdminDetailContext.Provider>
  );
}
