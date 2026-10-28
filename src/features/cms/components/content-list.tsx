"use client";
import { useState } from "react";
import { AdminDetailLink } from "@/features/admin/components/admin-detail-link";
export function ContentList({
  pages,
}: {
  pages: { id: string; title: string; path: string; kind: string; published: boolean }[];
}) {
  const [query, setQuery] = useState("");
  return (
    <>
      <input
        type="search"
        aria-label="ค้นหาหน้าข้อมูล"
        className="cms-directory-search"
        placeholder="ค้นหาข่าว บทความ ซอฟต์แวร์ หรือหน้าข้อมูล…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className="cms-directory">
        {pages
          .filter((page) =>
            `${page.title} ${page.path}`.toLowerCase().includes(query.toLowerCase()),
          )
          .map((page) => (
            <li key={page.id}>
              <AdminDetailLink
                href={`/admin/content/${encodeURIComponent(page.id)}`}
                kind="content"
                recordId={page.id}
                detailTitle={page.title}
              >
                <span>
                  {page.title} {!page.published && "(ซ่อน)"}
                </span>
                <small>
                  {page.kind} · {page.path}
                </small>
              </AdminDetailLink>
            </li>
          ))}
      </ul>
    </>
  );
}
