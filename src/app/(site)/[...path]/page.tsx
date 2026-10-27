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
import type { Product } from "@/features/catalog/types";
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
  return {
    title: page?.title ?? "ไม่พบข้อมูล",
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
  const allProducts = await getProducts();
  let products = allProducts.filter((product) =>
    page.managed
      ? page.productIds?.includes(product.id)
      : page.productHandles.includes(product.sourceId || ""),
  );
  const categoryPaths: Record<string, Product["category"] | "all"> = {
    "/product/digital-weighing": "all",
    "/product/mes": "smart",
    "/product/pos": "pos",
    "/product/ห้องปฏิบัติการ": "laboratory",
    "/product/laboratory-balance": "laboratory",
    "/product/อุตสาหกรรม": "industrial",
    "/product/industrial-scale": "industrial",
    "/product/พาณิชยกรรมและบริการ": "commercial",
    "/product/commercial-scale": "commercial",
    "/product/ไลฟ์สไตล์": "lifestyle",
    "/product/household-scale": "lifestyle",
    "/product/อุปกรณ์ประกอบเครื่องชั่ง": "accessories",
  };
  const catalogCategory = categoryPaths[page.path.toLowerCase()];
  if (catalogCategory && !products.length && !page.managed)
    products = allProducts.filter((product) =>
      catalogCategory === "all"
        ? product.category !== "accessories"
        : product.category === catalogCategory,
    );
  const title = page.managed
    ? page.title
    : page.path === "/about-us"
      ? "รู้จัก Sunford"
      : page.path === "/applications-and-softwares"
        ? "แอปพลิเคชันและซอฟต์แวร์"
        : page.path === "/software/download"
          ? "ดาวน์โหลดซอฟต์แวร์"
          : catalogCategory === "all"
            ? "เครื่องชั่งดิจิทัล"
            : page.title.replace(/\s*\|\s*Sunford$/i, "");
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
        {formPage && (
          <a className="button button-red" href={page.sourceUrl} target="_blank" rel="noreferrer">
            เปิดแบบฟอร์ม Sunford <ArrowUpRight size={17} />
          </a>
        )}
      </header>
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
            <ProductCatalog products={products} full heading={page.title} scoped />
          ) : (
            <div className="container source-empty">
              <ProductImage alt={page.title} width={1180} height={380} />
              <p>สำรวจหมวดสินค้าอื่นเพิ่มเติม</p>
              <Link className="button button-outline" href="/products">
                ดูผลิตภัณฑ์ทั้งหมด
              </Link>
            </div>
          )}
        </>
      ) : (
        <>
          {!page.images.length && (
            <div className="container source-image-slot">
              <ProductImage alt={page.title} width={1180} height={340} />
            </div>
          )}
          {hasContent && (page.managed || (!newsIndex && !softwareIndex)) && (
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
          {!hasContent && (
            <div className="container source-empty">
              <p>สอบถามรายละเอียดเพิ่มเติมจากทีม Sunford</p>
              <Link className="button button-red" href="/contact-us">
                ติดต่อเรา
              </Link>
            </div>
          )}
        </>
      )}
      {catalogCategory && page.kind !== "collection" && products.length > 0 && (
        <ProductCatalog products={products} full heading={title} scoped />
      )}
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
