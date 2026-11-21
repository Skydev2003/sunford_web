import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import sanitizeHtml from "sanitize-html";
import usageManuals from "@/features/content/data/usage-manuals.json";
import installationManuals from "@/features/content/data/installation-manuals.json";
import { technicalManualIndex } from "@/features/content/data/technical-manuals";
import styles from "./manual.module.css";

type Props = { params: Promise<{ slug: string }> };
const manuals = [...usageManuals, ...installationManuals];

function readManual(slug: string) {
  const manual = manuals.find((entry) => entry.slug === slug);
  if (!manual) notFound();
  return manual;
}

export function generateStaticParams() {
  return manuals.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: readManual(slug).title };
}

export default async function ManualPage({ params }: Props) {
  const { slug } = await params;
  const manual = readManual(slug);
  const html = sanitizeHtml(manual.html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "details", "summary"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      "*": ["id", "class"],
      img: ["src", "alt", "width", "height", "loading", "decoding"],
      details: ["open"],
      th: ["scope", "colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      ol: ["start"],
      li: ["value"],
    },
    transformTags: { h1: "h2" },
  });

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
