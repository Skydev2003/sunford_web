"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const storageKey = "sunford.quotation.selections";
const quotePath = "/service/quotation";

export function readQuoteSelection(reference: string | null) {
  if (!reference || typeof window === "undefined") return "[]";
  try {
    return JSON.stringify(JSON.parse(localStorage.getItem(storageKey) ?? "{}")[reference] ?? []);
  } catch {
    return "[]";
  }
}

export function QuoteSelectionLink({
  models,
  children,
  className,
  newTab = false,
}: {
  models: string[];
  children: ReactNode;
  className?: string;
  newTab?: boolean;
}) {
  const router = useRouter();
  return (
    <Link
      href={quotePath}
      className={className}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      onClick={(event) => {
        try {
          const reference = Array.from(crypto.getRandomValues(new Uint32Array(4))).join("-");
          const stored = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
          const recent = Object.fromEntries(Object.entries(stored).slice(-19));
          localStorage.setItem(storageKey, JSON.stringify({ ...recent, [reference]: models }));
          const href = `${quotePath}?selection=${reference}`;
          event.preventDefault();
          if (newTab || event.ctrlKey || event.metaKey || event.shiftKey) {
            window.open(href, "_blank", "noopener,noreferrer");
          } else {
            router.push(href);
          }
        } catch {
          // The quote form is still available for manual selection if storage is blocked.
        }
      }}
    >
      {children}
    </Link>
  );
}
