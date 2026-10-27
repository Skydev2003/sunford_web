import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  getContentPage,
  getContentPages,
  importedPages,
} from "@/features/content/server/content-repository";
import { getProducts, getProduct } from "@/features/catalog/server/product-repository";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { ContentDirectory } from "@/features/content/components/content-directory";
import { ProductImage } from "@/components/ui/product-image";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { getProductSection } from "@/features/content/data/product-sections";
import {
  resolveContentPath,
  staticContentParams,
} from "@/features/content/data/static-content-params";

export const instant = false;
export function generateStaticParams() {
  return staticContentParams(importedPages);
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const page = await getContentPage(resolveContentPath(`/${path.join("/")}`));
  const section = page && !page.managed ? getProductSection(page.path) : undefined;
  return {
    title: section?.title ?? page?.title ?? "ไม่พบข้อมูล",
    description: page?.text.replace(/\s+/g, " ").slice(0, 160),
  };
}
export default async function SourceContentPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params;
  const pathname = resolveContentPath(`/${path.join("/")}`);
  if (path.includes("products")) {
    const product = await getProduct(path.at(-1)!);
    if (product) redirect(`/products/${product.slug}`);
  }
  const page = await getContentPage(pathname);
  if (!page) notFound();
  if (page.path !== pathname && page.managed) redirect(page.path);
  const section = !page.managed ? getProductSection(page.path) : undefined;
  const collections = section ? await Promise.all(section.collectionPaths.map(getContentPage)) : [];
  const productHandles = section?.collectionPaths.length
    ? [...new Set(collections.flatMap((collection) => collection?.productHandles ?? []))]
    : page.productHandles;
  const allProducts = await getProducts();
  let products = allProducts.filter((product) =>
    page.managed
      ? page.productIds?.includes(product.id)
      : productHandles.includes(product.sourceId || ""),
  );
  if (section?.category) {
    const category = section.category;
    products = products.map((product) => ({ ...product, category }));
  }
  const title =
    section?.title ??
    (page.managed
      ? page.title
      : page.path === "/about-us"
        ? "รู้จัก Sunford"
        : page.path === "/applications-and-softwares"
          ? "แอปพลิเคชันและซอฟต์แวร์"
          : page.path === "/software/download"
            ? "ดาวน์โหลดซอฟต์แวร์"
            : page.title.replace(/\s*\|\s*Sunford$/i, ""));
  const newsIndex = /news-and-activities|\/blogs\/editorial$|^\/business$/.test(page.path);
  const softwareIndex =
    page.path === "/software/download" || page.path === "/applications-and-softwares";
  const linkedPages = (await getContentPages()).filter(
    (item) =>
      item.path !== page.path &&
      item.kind !== "product" &&
      (newsIndex
        ? item.kind === "article"
        : softwareIndex
          ? item.path.startsWith("/software/download/")
          : item.path.startsWith(`${page.path}/`)),
  );
  const formPage = /warranty\/register|service\//.test(pathname);
  const hasContent = page.text.trim().length > 40 && !page.hasSourcePlaceholder;
  const introduction = section
    ? page.text
        .split(/สินค้าต่อหน้า|แท็กสินค้า|ขออภัย ไม่มีสินค้า/)[0]
        .trim()
        .split("\n")
        .slice(1)
        .join("\n")
        .trim()
    : "";
  const sectionIntro = introduction.length > 80 ? introduction : "";
  return (
    <main id="main-content" className="source-content-page">
      <div className="source-local-nav">
        <div className="container">
          <Link className="text-link" href="/explore">
            <ArrowLeft size={15} />
            สำรวจ Sunford
          </Link>
          <span>{page.kind === "collection" ? "ผลิตภัณฑ์" : "SUNFORD"}</span>
        </div>
      </div>
      <header className="content-heading container">
        <p className="eyebrow">
          {page.kind === "collection"
            ? "THE SUNFORD COLLECTION"
            : page.kind === "article"
              ? "SUNFORD STORIES"
              : "SUNFORD"}
        </p>
        <h1>{title}</h1>
        {sectionIntro && <p className="source-section-intro">{sectionIntro}</p>}
        {formPage && (
          <a className="button button-red" href={page.sourceUrl} target="_blank" rel="noreferrer">
            เปิดแบบฟอร์ม Sunford <ArrowUpRight size={17} />
          </a>
        )}
      </header>
      {section && section.links.length > 0 && (
        <nav className="container source-section-links" aria-label={`เลือกหมวด${title}`}>
          {section.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={
                link.href.toLowerCase() === page.path.toLowerCase() ? "page" : undefined
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
      {page.managed && page.images[0] && (
        <div className="container source-image-slot">
          <ProductImage src={page.images[0]} alt={page.title} width={1180} height={340} />
        </div>
      )}
      {page.managed && page.kind === "collection" && page.html && (
        <article
          className="source-prose container"
          dangerouslySetInnerHTML={{ __html: page.html }}
        />
      )}
      {page.kind === "collection" ? (
        <>
          {products.length ? (
            <ProductCatalog
              key={page.path}
              products={products}
              full
              heading={title}
              scoped
              categoryLabel={section?.title}
            />
          ) : (
            <div className="container source-empty">
              <p>ยังไม่มีสินค้าในหมวดหมู่นี้</p>
              <Link className="button button-outline" href="/products">
                ดูผลิตภัณฑ์ทั้งหมด
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          {!section && !page.images.length && (
            <div className="container source-image-slot">
              <ProductImage alt={page.title} width={1180} height={340} />
            </div>
          )}
          {!section && hasContent && (page.managed || (!newsIndex && !softwareIndex)) && (
            <article
              className={`source-prose container ${page.kind === "article" ? "source-article" : ""}`}
              dangerouslySetInnerHTML={{ __html: page.html }}
            />
          )}
          {newsIndex && !page.managed && (
            <div className="container source-prose source-article">
              <p>
                {page.text
                  .split(/\n\s*\n/)
                  .slice(0, 2)
                  .join("\n\n")}
              </p>
            </div>
          )}
          {!section && !hasContent && (
            <div className="container source-empty">
              <p>สอบถามรายละเอียดเพิ่มเติมจากทีม Sunford</p>
              <Link className="button button-red" href="/contact-us">
                ติดต่อเรา
              </Link>
            </div>
          )}
        </>
      )}
      {section &&
        page.kind !== "collection" &&
        (products.length > 0 ? (
          <ProductCatalog
            key={page.path}
            products={products}
            full
            heading={title}
            scoped
            categoryLabel={title}
          />
        ) : (
          <div className="container source-empty">
            <p>ยังไม่มีสินค้าในหมวดหมู่นี้</p>
            <Link className="button button-outline" href="/products">
              ดูผลิตภัณฑ์ทั้งหมด
            </Link>
          </div>
        ))}
      {page.videos?.length ? <VideoGallery videos={page.videos} /> : null}
      {linkedPages.length > 0 && (
        <section className="container source-related">
          <div className="section-heading">
            <h2>ค้นพบเพิ่มเติม.</h2>
          </div>
          <ContentDirectory
            pages={linkedPages.map(({ path, title, kind, images }) => ({
              path,
              title,
              kind,
              image: images[0],
            }))}
          />
        </section>
      )}
      <div className="container source-attribution">
        <a href={page.sourceUrl} target="_blank" rel="noreferrer">
          ดูข้อมูลต้นฉบับจาก Sunford <ArrowUpRight size={14} />
        </a>
      </div>
    </main>
  );
}
