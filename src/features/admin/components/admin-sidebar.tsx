"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

export function AdminSidebar({ children }: { children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 651px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <>
      <aside className="admin-sidebar admin-sidebar-desktop">{children}</aside>
      <div className="admin-mobile-header">
        <button
          type="button"
          aria-label="เปิดเมนูแอดมิน"
          aria-expanded={open}
          aria-controls="admin-mobile-navigation"
          onClick={() => {
            dialog.current?.showModal();
            setOpen(true);
          }}
        >
          <Menu size={22} />
          <span>SUNFORD ADMIN</span>
        </button>
      </div>
      <dialog
        ref={dialog}
        id="admin-mobile-navigation"
        className="admin-sidebar-dialog"
        aria-label="เมนูแอดมิน"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (
            event.target === event.currentTarget ||
            (event.target instanceof Element && event.target.closest("a"))
          )
            dialog.current?.close();
        }}
      >
        <div className="admin-sidebar">
          <button
            type="button"
            className="admin-sidebar-close"
            aria-label="ปิดเมนูแอดมิน"
            onClick={() => dialog.current?.close()}
          >
            <X size={22} />
          </button>
          {children}
        </div>
      </dialog>
    </>
  );
}
