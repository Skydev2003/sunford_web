//test

"use client";

import { useRef, useState, type MouseEventHandler, type PointerEvent, type ReactNode } from "react";

export function DragScroll({
  children,
  className,
  label,
  onClickCapture,
}: {
  children: ReactNode;
  className: string;
  label: string;
  onClickCapture?: MouseEventHandler<HTMLDivElement>;
}) {
  const gesture = useRef<{ id: number; x: number; scrollLeft: number; dragging: boolean } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  function finish(event: PointerEvent<HTMLDivElement>) {
    if (gesture.current?.id !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      className={`${className} drag-scroll-track${dragging ? " is-dragging" : ""}`}
      role="region"
      aria-label={label}
      tabIndex={0}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse" || event.button !== 0) return;
        suppressClick.current = false;
        gesture.current = {
          id: event.pointerId,
          x: event.clientX,
          scrollLeft: event.currentTarget.scrollLeft,
          dragging: false,
        };
      }}
      onPointerMove={(event) => {
        const current = gesture.current;
        if (!current || current.id !== event.pointerId) return;
        if (!(event.buttons & 1)) {
          finish(event);
          return;
        }
        const distance = event.clientX - current.x;
        if (!current.dragging) {
          if (Math.abs(distance) < 6) return;
          current.dragging = true;
          suppressClick.current = true;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        event.preventDefault();
        event.currentTarget.scrollLeft = current.scrollLeft - distance;
      }}
      onPointerUp={finish}
      onPointerCancel={finish}
      onLostPointerCapture={finish}
      onPointerLeave={(event) => {
        if (!gesture.current?.dragging) finish(event);
      }}
      onDragStartCapture={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        // Dragging a linked card must not navigate or start a video on release.
        if (suppressClick.current && event.detail !== 0) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
          return;
        }
        onClickCapture?.(event);
      }}
    >
      {children}
    </div>
  );
}
