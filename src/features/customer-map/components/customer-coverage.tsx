"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

const CustomerMapDialog = dynamic(() => import("./customer-map-dialog"));

export function CustomerCoverage({
  children,
  enabled = true,
}: {
  children: ReactNode;
  enabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  if (!enabled) return <div className="footer-coverage">{children}</div>;
  return (
    <>
      <button
        type="button"
        className="footer-coverage"
        aria-label="เปิดแผนที่ลูกค้า Sunford ทั่วประเทศ"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      {open && <CustomerMapDialog onClose={() => setOpen(false)} />}
    </>
  );
}
