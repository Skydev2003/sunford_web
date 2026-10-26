"use client";
import Image from "next/image";
import { MessageCircle, Phone, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { SiteSettings } from "@/features/cms/types";
import { useContactMotion } from "./use-contact-motion";

export function FloatingContact({
  site,
  expertLabel,
  expertHref,
}: {
  site: SiteSettings;
  expertLabel: string;
  expertHref: string;
}) {
  const [open, setOpen] = useState(false);
  const [labelsVisible, setLabelsVisible] = useState(false);
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  useContactMotion(root);
  useEffect(() => {
    if (!open || !labelsVisible) return;
    const timer = setTimeout(() => setLabelsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [open, labelsVisible]);
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      launcher.current?.focus();
    }
    function outside(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", escape);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", escape);
      document.removeEventListener("pointerdown", outside);
    };
  }, [open]);
  return (
    <aside
      ref={root}
      className={`floating-contact${open ? " is-open" : ""}${open && labelsVisible ? " show-labels" : ""}`}
      aria-label={`ติดต่อ ${site.name}`}
    >
      <section
        id={id}
        className="contact-actions"
        aria-label="ช่องทางติดต่อ"
        aria-hidden={!open}
        inert={!open}
      >
        {site.phoneHref && (
          <a
            className="contact-action"
            href={site.phoneHref}
            aria-label={`โทรศัพท์ ${site.phone}`}
            title={site.phone}
          >
            <span className="contact-action-label">โทรศัพท์</span>
            <span className="contact-action-icon contact-phone">
              <Phone size={29} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </a>
        )}
        {(expertHref || site.line) && (
          <a
            className="contact-action"
            href={expertHref || site.line}
            aria-label={`${expertLabel}ผ่าน LINE`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact-action-label">แชทผ่าน LINE</span>
            <span className="contact-action-icon contact-line">
              <Image src="/images/brands/line-brand-icon.png" width={60} height={60} alt="LINE" />
            </span>
          </a>
        )}
        {site.messenger && (
          <a
            className="contact-action"
            href={site.messenger}
            aria-label="แชทผ่าน Facebook"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="contact-action-label">แชทผ่าน Facebook</span>
            <span className="contact-action-icon contact-facebook">
              <svg width="40" height="40" viewBox="0 0 36 36" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M18 3C9.7 3 3 9.2 3 16.9c0 4.3 2.1 8.2 5.5 10.7V33l5.1-2.8c1.4.4 2.9.6 4.4.6 8.3 0 15-6.2 15-13.9S26.3 3 18 3Z"
                />
                <path fill="#087cff" d="m8.8 22 7.7-8.2 4.3 3.7 6.4-3.7-7.6 8.2-4.4-3.7-6.4 3.7Z" />
              </svg>
            </span>
          </a>
        )}
      </section>
      <button
        ref={launcher}
        type="button"
        className="contact-launcher"
        aria-label={open ? "ปิดช่องทางติดต่อ" : expertLabel}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          setLabelsVisible(!open);
          setOpen(!open);
        }}
      >
        <span className="contact-launcher-icon">
          <MessageCircle className="contact-open-icon" size={28} aria-hidden="true" />
          <X className="contact-close-icon" size={31} strokeWidth={3} aria-hidden="true" />
        </span>
      </button>
    </aside>
  );
}
