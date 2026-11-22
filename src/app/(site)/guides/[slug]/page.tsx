import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { ArrowLeft } from "lucide-react";
import { buyingGuides } from "@/features/content/data/buying-guides";

export function generateStaticParams() {
  return buyingGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = buyingGuides.find((item) => item.slug === slug);
  return { title: guide?.title ?? "ไม่พบคู่มือ", description: guide?.introduction };
}

type GuidePageProps = { params: Promise<{ slug: string }> };

export default function BuyingGuidePage({ params }: GuidePageProps) {
  return (
    <Suspense fallback={<SiteLoading label="กำลังโหลดคู่มือ…" />}>
      <BuyingGuideContent params={params} />
    </Suspense>
  );
}

async function BuyingGuideContent({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = buyingGuides.find((item) => item.slug === slug);
  if (!guide) notFound();

  return (
    <main id="main-content" className="source-content-page">
      <div className="source-local-nav">
        <div className="container">
          <Link className="text-link" href={guide.productHref}>
            <ArrowLeft size={15} /> ดูสินค้าในหมวดนี้
          </Link>
          <span>SUNFORD</span>
        </div>
      </div>
      <header className="content-heading container">
        <p className="eyebrow">SUNFORD BUYING GUIDE</p>
        <h1>{guide.title}</h1>
        <p>
          {guide.introduction ||
            "คู่มือนี้ยังไม่มีคำอธิบายที่ยืนยันแล้ว เลือกหัวข้อเพื่อดูสินค้าหรือข้อมูลที่เกี่ยวข้องได้จากลิงก์ด้านล่าง"}
        </p>
      </header>
      <article className="source-prose source-article container">
        <nav aria-label="หัวข้อในคู่มือ">
          <ul>
            {guide.sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.title}</a>
              </li>
            ))}
          </ul>
        </nav>
        {guide.sections.map((section) => (
          <section id={section.id} key={section.id}>
            <h2>{section.title}</h2>
            {section.paragraphs.filter(Boolean).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <ul>
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
        <Link className="text-link" href="/contact-us">
          สอบถามเกี่ยวกับการเลือกสินค้า
        </Link>
      </article>
    </main>
  );
}
