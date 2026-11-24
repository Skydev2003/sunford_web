"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSyncExternalStore } from "react";
import {
  getReturnOrigin,
  returnToOrigin,
  subscribeReturnOrigin,
} from "@/features/site/history/return-state";
import { ArrowLeft } from "lucide-react";
import { getProductReturnPage } from "../data/product-subcategory-pages";

export function ProductReturnLink({ label }: { label?: string }) {
  const page = getProductReturnPage(useSearchParams().get("from"));
  const origin = useSyncExternalStore(subscribeReturnOrigin, getReturnOrigin, () => undefined);
  const text = origin
    ? "กลับหน้าก่อนหน้า"
    : page
      ? `กลับรายการ${page.title}`
      : (label ?? "ผลิตภัณฑ์ทั้งหมด");
  return (
    <Link
      href={origin ?? page?.href ?? "/products"}
      className="text-link back-link"
      onClick={(event) => {
        if (
          !getReturnOrigin() ||
          event.button ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        event.preventDefault();
        returnToOrigin();
      }}
    >
      {!label && <ArrowLeft size={16} />} {text}
    </Link>
  );
}
