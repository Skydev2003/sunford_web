"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";

export function SafetyDialog({
  open,
  busy = false,
  title,
  onClose,
  children,
  className = "",
  closeLabel = "ปิดหน้าต่างยืนยัน",
}: {
  open: boolean;
  busy?: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open) dialog?.showModal();
    else dialog?.close();
    return () => dialog?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className={`admin-safety-dialog ${className}`.trim()}
      aria-labelledby={id}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="admin-safety-dialog-heading">
        <h2 id={id}>{title}</h2>
        <button
          type="button"
          className="admin-button-secondary"
          disabled={busy}
          onClick={onClose}
          aria-label={closeLabel}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
