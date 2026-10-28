"use client";

import { createContext, useContext, type ComponentProps } from "react";
import Link from "next/link";
import { adminEditorPattern } from "../editor-pattern";

export type AdminDetailTarget = { kind: "product" | "content"; id: string; title: string };
export const AdminDetailContext = createContext<{
  open: (target: AdminDetailTarget, trigger: HTMLElement) => Promise<void>;
  selected?: string;
} | null>(null);

export function AdminDetailLink({
  kind,
  recordId,
  detailTitle,
  children,
  onClick,
  ...props
}: ComponentProps<typeof Link> & {
  kind: AdminDetailTarget["kind"];
  recordId: string;
  detailTitle: string;
}) {
  const detail = useContext(AdminDetailContext);
  const opensDetail = detail && adminEditorPattern(kind, recordId) !== "page";
  return (
    <Link
      {...props}
      prefetch={false}
      data-admin-detail={opensDetail ? "true" : undefined}
      data-detail-selected={detail?.selected === `${kind}:${recordId}` || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (
          !opensDetail ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === "_blank"
        )
          return;
        event.preventDefault();
        void detail.open({ kind, id: recordId, title: detailTitle }, event.currentTarget);
      }}
    >
      {children}
    </Link>
  );
}
