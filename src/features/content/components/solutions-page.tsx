import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getStorefrontProducts } from "@/features/catalog/server/product-repository";
import { sunford } from "@/features/home/data/brand";
import { getSolutionEvidence, solutionDetails } from "../data/solution-details";
import { getSolutionGuidance } from "../data/solution-guidance";
import styles from "./solutions-page.module.css";

export async function SolutionsPage({ path }: { path: string }) {
  const solution = solutionDetails[path];
  const evidence = solution.evidence
    ? getSolutionEvidence(solution, await getStorefrontProducts())
    : [];
  const title = solution.title;
  const guidance = getSolutionGuidance(path);
  const back = path.startsWith("/mes/")
    ? { href: "/mes", label: "ระบบ MES" }
    : { href: "/solutions", label: "โซลูชัน" };

  return (
    <main id="main-content" className={styles.page} data-solution-detail={path}>
      <nav className={`container ${styles.breadcrumb}`} aria-label="เส้นทางหน้า">
        <Link href="/">หน้าแรก</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <Link href={back.href}>{back.label}</Link>
        <ChevronRight size={14} aria-hidden="true" />
        <span aria-current="page">{title}</span>
      </nav>
      <section className={`container ${styles.empty}`} aria-labelledby="solution-title">
        <h1 id="solution-title">{title}</h1>
        {solution.description && <p>{solution.description}</p>}
        {solution.sections?.map(({ id, title, description }) => (
          <section key={id} aria-labelledby={id} className={styles.detailSection}>
            <h2 id={id} tabIndex={-1}>
              {title}
            </h2>
            <p>{description}</p>
          </section>
        ))}
        {guidance && (
          <div data-solution-guidance>
            <p>{guidance.summary}</p>
            <h2>ก่อนนำไปใช้งาน</h2>
            <p>{guidance.preparation}</p>
            <a className={styles.sourceLink} href={guidance.sourceUrl}>
              อ่านบทความต้นฉบับของ SUNFORD
            </a>
          </div>
        )}
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
        ) : (!guidance && !solution.description) || solution.emptyMessage ? (
          <p data-solution-evidence-empty>
            {solution.emptyMessage ??
              "ขณะนี้ยังไม่มีข้อมูลเผยแพร่ที่ยืนยันรายละเอียดสำหรับหัวข้อนี้"}
          </p>
        ) : null}
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
        <Link href={back.href}>
          <ArrowLeft size={16} aria-hidden="true" />
          {back.label}
        </Link>
      </footer>
    </main>
  );
}
