"use client";

import Link from "next/link";
import type { ComponentProps, PointerEvent } from "react";
import styles from "./catalog-navigation-effects.module.css";

function releaseTouch(event: PointerEvent<HTMLAnchorElement>) {
  if (event.pointerType === "touch" && event.isPrimary) {
    delete event.currentTarget.dataset.touchPressed;
  }
}

export function CatalogNavigationLink({
  className,
  ...props
}: Omit<
  ComponentProps<typeof Link>,
  "onPointerDown" | "onPointerUp" | "onPointerCancel" | "onPointerLeave"
>) {
  return (
    <Link
      {...props}
      className={className ? styles.pressable + " " + className : styles.pressable}
      onPointerDown={(event) => {
        if (event.pointerType === "touch" && event.isPrimary) {
          event.currentTarget.dataset.touchPressed = "";
        }
      }}
      onPointerUp={releaseTouch}
      onPointerCancel={releaseTouch}
      onPointerLeave={releaseTouch}
    />
  );
}
