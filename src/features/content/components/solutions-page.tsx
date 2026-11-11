import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { solutions } from "../data/solutions";
import type { SourcePage } from "../types";
import styles from "./solutions-page.module.css";
import "./solutions-source.css";
import { SolutionsOverview } from "./solutions-overview";

export function SolutionsPage({ page }: { page: SourcePage }) {
  if (page.path === "/solutions") return <SolutionsOverview page={page} />;
  const solution = solutions.find((item) => item.path === page.path);
  return (
    <main id="main-content" className={styles.page}>
      <nav className={`container ${styles.breadcrumb}`} aria-label="เส้นทางหน้า">
        <Link href="/">หน้าแรก</Link>
        <ChevronRight size={14} />
        <Link href="/solutions">โซลูชัน</Link>
        <ChevronRight size={14} />
        <span>{page.title}</span>
      </nav>
      {page.text.trim() || page.warehouseOnly ? (
        <article
          className={`container ${styles.article} solution-source--${solution?.id}${["lot-serial", "pos", "windows", "driver"].includes(solution?.id ?? "") ? " source-prose" : ""}`}
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      ) : (
        <section className={`container ${styles.empty}`}>
          <h1>{page.title}</h1>
          <p>หน้าเว็บต้นฉบับยังไม่มีรายละเอียดสำหรับหัวข้อนี้</p>
          <Link href="/contact-us" className="button button-red">
            สอบถามทีม Sunford
          </Link>
        </section>
      )}
      <footer className={`container ${styles.footer}`}>
        <Link href="/solutions">
          <ArrowLeft size={16} />
          โซลูชันทั้งหมด
        </Link>
        <a href={page.sourceUrl} target="_blank" rel="noopener noreferrer">
          ข้อมูลต้นฉบับจาก Sunford
        </a>
      </footer>
    </main>
  );
}
