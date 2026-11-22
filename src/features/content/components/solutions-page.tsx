import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getStorefrontProducts } from "@/features/catalog/server/product-repository";
import { sunford } from "@/features/home/data/brand";
import { getSolutionEvidence, solutionDetails } from "../data/solution-details";
import styles from "./solutions-page.module.css";

export async function SolutionsPage({ path }: { path: string }) {
  const solution = solutionDetails[path];
  const evidence = solution.evidence
    ? getSolutionEvidence(solution, await getStorefrontProducts())
    : [];
  const title = solution.title;

  return (
    <main id="main-content" className={styles.page} data-solution-detail={path}>
      <nav className={`container ${styles.breadcrumb}`} aria-label="เส้นทางหน้า">
        <Link href="/">หน้าแรก</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href="/solutions">โซลูชัน</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{title}</span>
      </nav>
      <section className={`container ${styles.empty}`} aria-labelledby="solution-title">
        <h1 id="solution-title">{title}</h1>
        {evidence.length ? (
          <>
            <h2>ข้อมูลที่แค็ตตาล็อกระบุ</h2>
            <ul className={styles.list} data-solution-evidence>
              {evidence.map(({ product, fact }) => (
                <li key={product.id}>
                  <Link href={`/products/${product.slug}`}>
                    <div>
                      <strong>{product.name}</strong>
                      <br />
                      <span>{fact}</span>
                    </div>
                    <ChevronRight size={16} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p data-solution-evidence-empty>
            ขณะนี้ยังไม่มีข้อมูลเผยแพร่ที่ยืนยันรายละเอียดสำหรับหัวข้อนี้
          </p>
        )}
        <nav className={styles.footer} aria-label="ข้อมูลที่เกี่ยวข้อง">
          {solution.links.map(({ href, label }) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
          <Link href={sunford.contact} className="button button-red">
            สอบถามซันฟอร์ด
          </Link>
        </nav>
      </section>
      <footer className={`container ${styles.footer}`}>
        <Link href="/solutions">
          <ArrowLeft size={16} aria-hidden="true" />
          โซลูชันทั้งหมด
        </Link>
      </footer>
    </main>
  );
}
