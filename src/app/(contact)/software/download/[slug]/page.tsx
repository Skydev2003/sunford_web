import { contactPath } from "@/features/content/data/contact-route";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import SourceContentPage, {
  generateMetadata as getSourceMetadata,
} from "@/app/(site)/[...path]/page";
import { softwareDownloadGroups } from "@/features/content/data/software-downloads";
import {
  getSoftwareSupportPage,
  softwareSupportPages,
} from "@/features/content/data/software-support";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { SiteLoading } from "@/features/site/components/site-loading";

type Props = { params: Promise<{ slug: string }> };

const rlsModels = [
  { slug: "sunford-rls1100", label: "SUNFORD RLS1100" },
  { slug: "sunford-rls1800", label: "SUNFORD RLS1800" },
];

export function generateStaticParams() {
  return softwareSupportPages.map(({ slug }) => ({ slug }));
}

async function getBuiltInSupportPage(slug: string) {
  const support = getSoftwareSupportPage(slug);
  if (!support) return;
  const pathname = `/software/download/${slug}`;
  const page = (await getContentPageIndex())[pathname];
  if (!page && support.standalone) return support;
  if (page?.path === pathname && !page.managed) return support;
}

function sourceParams(slug: string) {
  return { params: Promise.resolve({ path: ["software", "download", slug] }) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBuiltInSupportPage(slug);
  return page ? { title: page.title } : getSourceMetadata(sourceParams(slug));
}

export default async function SoftwareSupportPage({ params }: Props) {
  const { slug } = await params;
  const page = await getBuiltInSupportPage(slug);
  if (!page) {
    return (
      <Suspense fallback={<SiteLoading />}>
        <SourceContentPage {...sourceParams(slug)} />
      </Suspense>
    );
  }
  const downloads = softwareDownloadGroups
    .flatMap(({ products }) => products)
    .find((product) => product.slug === slug)?.downloads;
  const isRls = rlsModels.some((model) => model.slug === slug);
  const needsSupport = !downloads?.length && !page.guide;

  return (
    <main id="main-content" className="source-content-page">
      <header className="content-heading container">
        <h1>{page.title}</h1>
        {page.description && <p>{page.description}</p>}
      </header>
      {isRls && (
        <nav
          className="container source-section-links"
          aria-label="เลือกซอฟต์แวร์ตามรุ่นเครื่องชั่ง RLS"
        >
          {rlsModels.map((model) => (
            <Link
              key={model.slug}
              href={`/software/download/${model.slug}`}
              aria-current={model.slug === slug ? "page" : undefined}
            >
              {model.label}
            </Link>
          ))}
        </nav>
      )}
      <nav className="container source-section-links" aria-label="ดาวน์โหลดและคู่มือ">
        {downloads?.map(({ href, label, platform }) => (
          <a key={href} href={href}>
            {slug === "sunford-rls1800" ? "ดาวน์โหลดโปรแกรม" : `${label} (${platform})`}
          </a>
        ))}
        {page.guide && <Link href={page.guide.href}>{page.guide.label}</Link>}
        <Link href="/software">ดูรายการดาวน์โหลดทั้งหมด</Link>
        {needsSupport && <Link href={contactPath}>ติดต่อฝ่ายบริการ</Link>}
      </nav>
      {page.videos?.length ? (
        <section className="container source-prose" aria-labelledby="software-videos">
          <h2 id="software-videos">วิดีโอสอนใช้งาน</h2>
          <ul>
            {page.videos.map(({ href, label }) => (
              <li key={href}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
