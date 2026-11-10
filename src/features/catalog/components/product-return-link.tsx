"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductReturnPage } from "../data/product-subcategory-pages";

export function ProductReturnLink() {
  const page = getProductReturnPage(useSearchParams().get("from"));
  return (
    <Link href={page?.href ?? "/products"} className="text-link back-link">
      <ArrowLeft size={16} /> {page ? `กลับรายการ${page.title}` : "ผลิตภัณฑ์ทั้งหมด"}
    </Link>
  );
}
