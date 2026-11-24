import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  sanitizeTechnicalManual,
  technicalManuals,
} from "@/features/content/server/technical-manuals";
import { technicalManualIndex } from "@/features/content/data/technical-manuals";
import styles from "./manual.module.css";

type Props = { params: Promise<{ slug: string }> };
function readManual(slug: string) {
  const manual = technicalManuals.find((entry) => entry.slug === slug);
  if (!manual) notFound();
  return manual;
}

export function generateStaticParams() {
  return technicalManuals.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: readManual(slug).title };
}

export default async function ManualPage({ params }: Props) {
  const { slug } = await params;
  const manual = readManual(slug);
  const html = sanitizeTechnicalManual(manual.html);

  return (
    <main id="main-content" className="source-content-page">
      <header className={`content-heading container ${styles.heading}`}>
        <Link className="text-link" href={technicalManualIndex}>
          <ArrowLeft size={16} aria-hidden="true" /> กลับไปหน้าคู่มือและสเปก
        </Link>
        <h1>{manual.title}</h1>
      </header>
      <article
        className={`source-prose container ${styles.article}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </main>
  );
}
