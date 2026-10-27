"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";

const CustomerMapDialog = dynamic(() => import("./customer-map-dialog"));

export function CustomerCoverage({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
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
