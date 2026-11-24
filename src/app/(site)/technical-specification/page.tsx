import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BookOpen, ChevronDown, List, Scale, Wrench } from "lucide-react";
import { guidebookBuyingGuides } from "@/features/content/data/buying-guides";
import {
  guidebookChapterPath,
  installationGuides,
  productAdvice,
  technicalManualPath,
  usageGuide,
} from "@/features/content/data/technical-manuals";
import {
  prepareTechnicalManualChapter,
  technicalManuals,
} from "@/features/content/server/technical-manuals";
import { GuidebookFragment } from "./guidebook-fragment";
import styles from "./technical-specification.module.css";

const title = "คู่มือและสเปก";
const guidePrefix = technicalManualPath("");
const manualLinks = (links: { href: string; label: string }[]) =>
  links.map(({ href, label }) => ({ slug: href.slice(guidePrefix.length), label }));
const manualChapters = [
  {
    id: "usage-guides",
    title: "คู่มือการใช้งาน",
    icon: BookOpen,
    links: manualLinks([usageGuide, ...productAdvice]),
  },
  ...guidebookBuyingGuides.map(({ slug, title, sections }) => ({
    id: slug,
    title,
    icon: Scale,
    links: sections.map(({ title, slug }) => ({ slug, label: title })),
  })),
  {
    id: "installation-guides",
    title: "คู่มือติดตั้งและไฟล์ประกอบ",
    icon: Wrench,
    links: manualLinks(installationGuides),
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
  const { slug, title: chapterTitle, content, outline } = readChapter(guide);

  return (
    <main className={`source-content-page ${styles.page}`} id="main-content">
      <div className={`container ${styles.layout}`}>
        <aside className={styles.desktopNavigation}>
          <GuideNavigation selected={slug} />
        </aside>
        <details className={styles.mobileNavigation}>
          <summary>
            <List size={18} aria-hidden="true" />
            สารบัญคู่มือ
            <ChevronDown className={styles.chevron} size={18} aria-hidden="true" />
          </summary>
          <GuideNavigation selected={slug} />
        </details>
        <article
          className={styles.chapter}
          id="guide-content"
          aria-labelledby="guide-title"
          tabIndex={-1}
        >
          <header className={styles.heading}>
            <h1 id="guide-title">{chapterTitle}</h1>
          </header>
          {content}
        </article>
        {outline.length > 0 && (
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
        )}
      </div>
    </main>
  );
}

function readChapter(guide: string | string[] | undefined) {
  const buyingGuide = guidebookBuyingGuides.find(
    ({ slug, sections }) => slug === guide || sections.some((section) => section.slug === guide),
  );
  const articleClassName = `source-prose ${styles.article}`;
  if (buyingGuide) {
    const topic = buyingGuide.sections.find(({ slug }) => slug === guide);
    const sections = topic ? [topic] : buyingGuide.sections;
    return {
      slug: topic?.slug ?? buyingGuide.slug,
      title: topic?.title ?? buyingGuide.title,
      outline: [],
      content: (
        <div className={articleClassName}>
          {!topic && <GuidebookFragment key={buyingGuide.slug} />}
          {!topic && <Link href={buyingGuide.productHref}>ดูสินค้าในหมวดนี้</Link>}
          {sections.map(({ id, title, advice, links }) => (
            <section id={id} key={id}>
              {!topic && <h2>{title}</h2>}
              <p>{advice}</p>
              {links.length > 0 && (
                <ul>
                  {links.map(({ href, label }) => (
                    <li key={href}>
                      <Link href={href}>{label}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      ),
    };
  }

  const manual = technicalManuals.find((entry) => entry.slug === guide) ?? technicalManuals[0];
  const { html, outline } = prepareTechnicalManualChapter(manual.html);
  return {
    slug: manual.slug,
    title: manual.title,
    outline,
    content: <div className={articleClassName} dangerouslySetInnerHTML={{ __html: html }} />,
  };
}

function GuideNavigation({ selected }: { selected: string }) {
  return (
    <nav className={styles.guideNavigation} aria-label="บทและคู่มือ">
      <p className={styles.navigationTitle}>{title}</p>
      {manualChapters.map(({ id, title, icon: Icon, links }) => (
        <details
          key={id}
          className={styles.navChapter}
          open={id === selected || links.some(({ slug }) => slug === selected)}
        >
          <summary>
            <Icon size={17} aria-hidden="true" />
            <span>{title}</span>
            <ChevronDown className={styles.chevron} size={15} aria-hidden="true" />
          </summary>
          <ul>
            {links.map(({ slug, label }) => (
              <li key={slug}>
                <Link
                  href={`${guidebookChapterPath(slug)}#guide-content`}
                  aria-current={slug === selected ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ))}
    </nav>
  );
}
