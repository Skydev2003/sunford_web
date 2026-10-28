"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function ContactBannerVisibility({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return pathname === "/" || pathname === "/contact-us" ? null : children;
}
