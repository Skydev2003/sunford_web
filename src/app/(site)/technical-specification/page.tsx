import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, ChevronDown, List, Wrench } from "lucide-react";
import {
  installationGuides,
  productAdvice,
  technicalManualIndex,
  technicalManualPath,
  usageGuide,
} from "@/features/content/data/technical-manuals";
import {
  prepareTechnicalManualChapter,
  technicalManuals,
} from "@/features/content/server/technical-manuals";
import styles from "./technical-specification.module.css";

const title = "คู่มือและสเปก";
const guidePrefix = technicalManualPath("");
const manualChapters = [
  {
    id: "usage-guides",
    title: "คู่มือการใช้งาน",
    icon: BookOpen,
    links: [usageGuide, ...productAdvice],
  },
  {
    id: "installation-guides",
    title: "คู่มือติดตั้งและไฟล์ประกอบ",
    icon: Wrench,
    links: installationGuides,
  },
];

export const metadata: Metadata = {
  title,
  description: "อ่านคู่มือการใช้งาน ดูแลรักษา และติดตั้งเครื่องชั่งและอุปกรณ์ซันฟอร์ด",
};

type Props = { searchParams: Promise<{ guide?: string | string[] }> };

export default function TechnicalSpecificationPage({ searchParams }: Props) {
  return (
    <Suspense>
      <Guidebook searchParams={searchParams} />
    </Suspense>
  );
}

async function Guidebook({ searchParams }: Props) {
  const { guide } = await searchParams;
  const manual = technicalManuals.find((entry) => entry.slug === guide) ?? technicalManuals[0];
  const { html, outline } = prepareTechnicalManualChapter(manual.html);

  return (
    <main className={`source-content-page ${styles.page}`} id="main-content">
      <div className={`container ${styles.layout}`}>
        <aside className={styles.desktopNavigation}>
          <GuideNavigation selected={manual.slug} />
        </aside>
        <details className={styles.mobileNavigation}>
          <summary>
            <List size={18} aria-hidden="true" />
            สารบัญคู่มือ
            <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
          </summary>
          <GuideNavigation selected={manual.slug} />
        </details>
        <article
          className={styles.chapter}
          id="guide-content"
          aria-labelledby="guide-title"
          tabIndex={-1}
        >
          <header className={styles.heading}>
            <h1 id="guide-title">{manual.title}</h1>
          </header>
          <div
            className={`source-prose ${styles.article}`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
        <aside className={styles.onPage}>
          <nav aria-label="ในหน้านี้">
            <p>ในหน้านี้</p>
            <ul>
              {outline.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`}>{label}</a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </main>
  );
}

function GuideNavigation({ selected }: { selected: string }) {
  return (
    <nav className={styles.guideNavigation} aria-label="บทและคู่มือ">
      <p className={styles.navigationTitle}>{title}</p>
      {manualChapters.map(({ id, title, icon: Icon, links }) => (
        <details key={id} className={styles.navChapter} open>
          <summary>
            <Icon size={17} aria-hidden="true" />
            <span>{title}</span>
            <ChevronDown className={styles.chevron} size={15} aria-hidden="true" />
          </summary>
          <ul>
            {links.map(({ href, label }) => {
              const slug = href.slice(guidePrefix.length);
              return (
                <li key={href}>
                  <Link
                    href={`${technicalManualIndex}?guide=${slug}#guide-content`}
                    aria-current={slug === selected ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </details>
      ))}
    </nav>
  );
}
