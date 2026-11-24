"use client";

import { useSyncExternalStore } from "react";
import styles from "./contact-page.module.css";

const subscribe = () => () => {};

export function ContactMap({ src }: { src: string }) {
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  if (!hydrated) return null;

  return (
    <iframe
      className={styles.mapFrame}
      src={src}
      title="แผนที่ดาวเทียมสำนักงานซันฟอร์ด บางเลน"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}
