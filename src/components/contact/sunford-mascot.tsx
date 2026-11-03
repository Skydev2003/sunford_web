"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  ChevronRight,
  MessageCircleMore,
  Phone,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { SiteSettings } from "@/features/cms/types";
import { Tooltip } from "@/components/ui/tooltip";
import { useMascotMotion } from "./use-mascot-motion";
import styles from "./sunford-mascot.module.css";

export const SUNFORD_SHOP_URL =
  "https://sunfordshop.com/%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%81";

export function SunfordMascot({
  site,
  expertLabel,
  expertHref,
  onDismiss,
}: {
  site: SiteSettings;
  expertLabel: string;
  expertHref: string;
  onDismiss: () => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  useMascotMotion(root);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLAnchorElement>("[data-mascot-contact] a")?.focus();
    function outside(event: globalThis.PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function leaveRegion(event: globalThis.PointerEvent) {
      if (event.pointerType !== "mouse") return;
      const mascot = root.current;
      const panel = mascot?.querySelector<HTMLElement>("[data-mascot-contact]");
      if (!mascot || !panel) return;
      const body = mascot.getBoundingClientRect();
      const menu = panel.getBoundingClientRect();
      // Include the small gap between the pet and its panel so both remain reachable.
      const padding = 10;
      const inside =
        event.clientX >= Math.min(body.left, menu.left) - padding &&
        event.clientX <= Math.max(body.right, menu.right) + padding &&
        event.clientY >= Math.min(body.top, menu.top) - padding &&
        event.clientY <= Math.max(body.bottom, menu.bottom) + padding;
      if (!inside) setOpen(false);
    }
    function leaveWindow(event: globalThis.PointerEvent) {
      if (event.pointerType === "mouse" && !event.relatedTarget) setOpen(false);
    }
    function escape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      launcher.current?.focus();
    }
    document.addEventListener("pointerdown", outside);
    document.addEventListener("pointermove", leaveRegion, { passive: true });
    document.addEventListener("pointerout", leaveWindow);
    document.addEventListener("keydown", escape, true);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("pointermove", leaveRegion);
      document.removeEventListener("pointerout", leaveWindow);
      document.removeEventListener("keydown", escape, true);
    };
  }, [open]);

  return (
    <aside
      ref={root}
      className={styles.mascot}
      aria-label={`ติดต่อ ${site.name}`}
      data-shop-mascot
      data-open={open}
    >
      <div className={styles.walkway}>
        <button type="button" className={styles.close} aria-label="ปิดตัวละคร" onClick={onDismiss}>
          <X size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.bubble}
          data-mascot-invitation
          aria-label="เปิดช่องทางติดต่อ Sunford"
          aria-controls={panelId}
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <span className={styles.invitationIcon} aria-hidden="true">
            <MessageCircleMore size={24} strokeWidth={1.8} />
          </span>
          <strong className={styles.invitation}>
            ติดต่อสอบถาม<em>ได้ที่นี่เลย</em>
          </strong>
        </button>
        <section
          id={panelId}
          className={styles.contactPanel}
          aria-label="ช่องทางติดต่อ"
          aria-hidden={!open}
          inert={!open}
          data-mascot-contact
        >
          {site.phoneHref && (
            <a href={site.phoneHref} aria-label={`โทรศัพท์ ${site.phone}`}>
              <span className={styles.channelIcon}>
                <Phone size={27} aria-hidden="true" />
              </span>
              <span className={styles.channelCopy}>
                <strong>โทรศัพท์</strong>
                <small>{site.phone}</small>
              </span>
              <ChevronRight className={styles.channelArrow} size={21} aria-hidden="true" />
            </a>
          )}
          {(expertHref || site.line) && (
            <a
              className={styles.lineChannel}
              href={expertHref || site.line}
              aria-label={`${expertLabel}ผ่าน LINE`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={`${styles.channelIcon} ${styles.lineIcon}`}>
                <Image src="/images/brands/line-brand-icon.png" width={48} height={48} alt="" />
              </span>
              <span className={styles.channelCopy}>
                <strong>แชทผ่าน LINE</strong>
                <small>คุยกับทีม Sunford</small>
              </span>
              <span className={styles.recommended}>
                <Star size={12} fill="currentColor" aria-hidden="true" />
                แนะนำ
              </span>
              <ChevronRight className={styles.channelArrow} size={21} aria-hidden="true" />
            </a>
          )}
          {site.messenger && (
            <a
              className={styles.messengerChannel}
              href={site.messenger}
              aria-label="แชทผ่าน Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className={`${styles.channelIcon} ${styles.messengerIcon}`}>
                <Image
                  src="/images/brands/messenger-brand-icon.svg"
                  width={32}
                  height={32}
                  alt=""
                />
              </span>
              <span className={styles.channelCopy}>
                <strong>Facebook Messenger</strong>
                <small>สอบถามข้อมูลสินค้า</small>
              </span>
              <ChevronRight className={styles.channelArrow} size={21} aria-hidden="true" />
            </a>
          )}
          <a
            href={SUNFORD_SHOP_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="เยี่ยมชม Sunford Shop"
          >
            <span className={styles.channelIcon}>
              <ShoppingBag size={27} aria-hidden="true" />
            </span>
            <span className={styles.channelCopy}>
              <strong>Sunford Shop</strong>
              <small>เยี่ยมชมเว็บไซต์ร้านค้า</small>
            </span>
            <ArrowUpRight
              className={`${styles.channelArrow} ${styles.shopArrow}`}
              size={21}
              aria-hidden="true"
            />
          </a>
        </section>
        <Tooltip content={open ? "ปิดช่องทางติดต่อ" : expertLabel}>
          <button
            ref={launcher}
            type="button"
            className={styles.character}
            aria-label={open ? "ปิดช่องทางติดต่อ" : expertLabel}
            aria-controls={panelId}
            aria-expanded={open}
            data-mascot-launcher
            draggable={false}
            onClick={() => setOpen(!open)}
          >
            <span className={styles.figure}>
              <span className={styles.sprite} aria-hidden="true" />
            </span>
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
