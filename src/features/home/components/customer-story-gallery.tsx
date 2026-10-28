"use client";

import {
  Children,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { ChartNoAxesColumnIncreasing, Heart, Quote } from "lucide-react";
import { customerStoryPhotos } from "../data/customer-story-photos";
import styles from "./brand-story.module.css";

export function CustomerStoryGallery({ children }: { children: ReactNode }) {
  const photos = Children.toArray(children);
  const [selection, setSelection] = useState({ index: 0, turn: 0 });
  const [dragX, setDragX] = useState(0);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const index = selection.index;
  const nextIndex = (index + 1) % photos.length;
  const copy = customerStoryPhotos[index].cards;

  function choose(next: number) {
    setSelection((current) => {
      const nextIndex = (next + photos.length) % photos.length;
      return nextIndex === current.index ? current : { index: nextIndex, turn: current.turn + 1 };
    });
  }

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    if (pointer.current?.id !== event.pointerId) return;
    const delta = event.clientX - pointer.current.x;
    if (Math.abs(delta) > 8) suppressClick.current = true;
    setDragX(Math.max(-85, Math.min(85, delta)));
  }

  function endDrag(event: PointerEvent<HTMLButtonElement>) {
    const start = pointer.current;
    if (start?.id !== event.pointerId) return;
    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    pointer.current = null;
    setDragX(0);
    if (Math.abs(deltaX) >= 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      suppressClick.current = true;
      choose(index + (deltaX < 0 ? 1 : -1));
    } else if (Math.abs(deltaY) > 8) {
      suppressClick.current = true;
    }
  }

  function cancelDrag() {
    pointer.current = null;
    suppressClick.current = true;
    setDragX(0);
  }

  function handleKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    choose(index + (event.key === "ArrowRight" ? 1 : -1));
  }

  return (
    <div
      className={styles.gallery}
      role="region"
      aria-label="ภาพการใช้งานจริงของลูกค้า Sunford"
      aria-roledescription="ภาพสไลด์"
      data-tilt={selection.turn % 2 === 0 ? "right" : "left"}
    >
      <div className={styles.deck}>
        <div
          className={styles.backCard}
          aria-hidden="true"
          data-next-photo={customerStoryPhotos[nextIndex].id}
        >
          <span className={styles.slide}>{photos[nextIndex]}</span>
        </div>
        <div className={styles.dragLayer} style={{ transform: `translateX(${dragX}px)` }}>
          <button
            type="button"
            className={styles.photoCard}
            aria-label="ดูภาพลูกค้าถัดไป คลิกหรือลากเพื่อเปลี่ยนภาพ"
            aria-describedby="customer-story-current"
            data-dragging={dragX !== 0}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={cancelDrag}
            onLostPointerCapture={() => {
              if (pointer.current) cancelDrag();
            }}
            onKeyDown={handleKey}
            onClick={() => {
              if (suppressClick.current) {
                suppressClick.current = false;
                return;
              }
              choose(index + 1);
            }}
          >
            {photos.map((photo, photoIndex) => (
              <span className={styles.slide} hidden={photoIndex !== index} key={photoIndex}>
                {photo}
              </span>
            ))}
            <span className={styles.photoLabel}>REAL PEOPLE. REAL POSSIBILITIES.</span>
          </button>
        </div>

        <div className={styles.quoteCard} aria-label="แนวคิดจากซันฟอร์ด">
          <Quote size={30} fill="currentColor" aria-hidden="true" />
          <p>
            {copy.quote.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <span aria-hidden="true" />
        </div>
        <div className={styles.sideCards}>
          <div className={styles.noteCard}>
            <ChartNoAxesColumnIncreasing size={32} strokeWidth={3} aria-hidden="true" />
            <p>
              {copy.benefit.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <span aria-hidden="true" />
          </div>
          <div className={styles.noteCard}>
            <Heart size={34} fill="currentColor" strokeWidth={1.5} aria-hidden="true" />
            <p>
              {copy.heart.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
            <span aria-hidden="true" />
          </div>
        </div>
      </div>

      <p
        id="customer-story-current"
        className={styles.currentPhoto}
        aria-live="polite"
        aria-atomic="true"
      >
        {index + 1} / {photos.length} · {customerStoryPhotos[index].label}
      </p>
    </div>
  );
}
