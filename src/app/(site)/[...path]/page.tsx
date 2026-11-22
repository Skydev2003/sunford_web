import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  getContentPage,
  getContentPages,
  importedPages,
} from "@/features/content/server/content-repository";
import { getStorefrontProducts, getProduct } from "@/features/catalog/server/product-repository";
import { ProductCatalog } from "@/features/catalog/components/product-catalog";
import { getClientProducts } from "@/features/catalog/server/client-products";
import { ContentDirectory } from "@/features/content/components/content-directory";
import { ProductImage } from "@/components/ui/product-image";
import { VideoGallery } from "@/features/content/components/video-gallery";
import { SoftwareCatalog } from "@/features/content/components/software-catalog";
import { ContactPage } from "@/features/content/components/contact-page";
import { AfterSalesPage } from "@/features/content/components/after-sales-page";
import { AboutPage } from "@/features/content/components/about-page";
import { SolutionsPage } from "@/features/content/components/solutions-page";
import { SolutionsOverview } from "@/features/content/components/solutions-overview";
import { solutionDetails } from "@/features/content/data/solution-details";
import { getProductSection } from "@/features/content/data/product-sections";
import {
  editorialUnavailable,
  getEditorialSection,
} from "@/features/content/data/editorial-sections";
import { technicalManualRedirects } from "@/features/content/data/technical-manuals";
import { softwareSupportPages } from "@/features/content/data/software-support";
import { resolveCategoryHref } from "@/features/catalog/data/category-destinations";
import { getProductSubcategoryPageByHref } from "@/features/catalog/data/product-subcategory-pages";
import {
  resolveContentPath,
  staticContentParams,
} from "@/features/content/data/static-content-params";

export const instant = false;
export function generateStaticParams() {
  const explicitPaths = [
    "/contact-us",
    "/service",
    "/warranty/register",
    "/technical-specification",
    "/software/download",
    ...softwareSupportPages.map(({ slug }) => `/software/download/${slug}`),
    ...technicalManualRedirects.map(({ source }) => source),
  ];
  return staticContentParams(
    importedPages.filter(
      ({ path, kind }) =>
        !explicitPaths.includes(path) && (kind !== "article" || Boolean(getEditorialSection(path))),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string[] }>;
}): Promise<Metadata> {
  const { path } = await params;
  const pathname = resolveContentPath(`/${path.join("/")}`);
  const editorial = getEditorialSection(pathname);
  if (editorial) return { title: editorial.title, description: editorialUnavailable };
  if (solutionDetails[pathname]) return { title: solutionDetails[pathname].title };
  const page = await getContentPage(pathname);
  const section = page && !page.managed ? getProductSection(page.path) : undefined;
  if (page?.path === "/about-us" && !page.managed) {
    return {
      title: "รู้จักซันฟอร์ด",
      description:
        "รู้จักซันฟอร์ด (SUNFORD) และความตั้งใจในการพัฒนาเครื่องชั่งดิจิทัลที่มีคุณภาพ แข็งแรงทนทาน ใช้งานง่าย พร้อมบริการหลังการขาย",
    };
  }
  if (page?.path === "/service" && !page.managed) {
    return {
      title: "บริการหลังการขาย",
      description:
        "ขั้นตอนการส่งซ่อม เปลี่ยน เคลม คืนสินค้า และนัดรับสินค้าที่โรงงานซันฟอร์ด พร้อมที่อยู่ เบอร์โทร และช่องทางติดต่อฝ่ายบริการลูกค้า",
    };
  }
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
  const editorial = getEditorialSection(pathname);
  if (editorial) {
    return (
      <main id="main-content" className="source-content-page">
        <header className="content-heading container">
          <h1>{editorial.title}</h1>
          <p>{editorialUnavailable}</p>
        </header>
        <nav className="container source-section-links" aria-label="ข้อมูลที่เปิดอ่านได้">
          <Link href="/products">ดูแค็ตตาล็อกสินค้า</Link>
          <Link href="/technical-specification">ดูข้อมูลทางเทคนิคและคู่มือ</Link>
          <Link href="/products/category/scales/applications">เลือกเครื่องชั่งตามการใช้งาน</Link>
        </nav>
      </main>
    );
  }
  const subcategoryDestination = resolveCategoryHref(pathname);
  if (getProductSubcategoryPageByHref(subcategoryDestination)) redirect(subcategoryDestination);
  if (path.includes("products")) {
    const product = await getProduct(path.at(-1)!);
    if (product) redirect(`/products/${product.slug}`);
  }
  if (pathname === "/solutions") return <SolutionsOverview />;
  if (solutionDetails[pathname]) return <SolutionsPage path={pathname} />;
  const page = await getContentPage(pathname);
  if (!page) notFound();
  if (!page.managed && getProductSection(page.path)) redirect("/products");
  if (page.path === "/solutions") return <SolutionsOverview />;
  if (solutionDetails[page.path]) return <SolutionsPage path={page.path} />;
  if (page.path !== pathname && page.managed) redirect(page.path);
  if (page.path === "/contact-us" && !page.managed) return <ContactPage />;
  if (page.path === "/service" && !page.managed) return <AfterSalesPage />;
  if (page.path === "/about-us" && !page.managed) return <AboutPage />;
  const section = !page.managed ? getProductSection(page.path) : undefined;
  const collections = section ? await Promise.all(section.collectionPaths.map(getContentPage)) : [];
  const productHandles = section?.collectionPaths.length
    ? [...new Set(collections.flatMap((collection) => collection?.productHandles ?? []))]
    : page.productHandles;
  const allProducts = await getStorefrontProducts();
  const productIds = new Set(
    allProducts
      .filter((product) =>
        page.managed
          ? page.productIds?.includes(product.id)
          : productHandles.includes(product.sourceId || ""),
      )
      .map((product) => product.id),
  );
  const clientProducts = await getClientProducts();
  let products = clientProducts.filter((product) => productIds.has(product.id));
  if (section?.category) {
    const category = section.category;
    products = products.map((product) =>
      product.category === category ? product : { ...product, category },
    );
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
  const softwareIndex =
    page.path === "/software/download" || page.path === "/applications-and-softwares";
  const softwareDetail = page.path.startsWith("/software/download/");
  const softwarePage =
    softwareIndex || softwareDetail
      ? page.path === "/software/download"
        ? page
        : await getContentPage("/software/download")
      : undefined;
  const softwareCatalog = softwarePage?.softwareCatalog;
  const softwareEntry = softwareCatalog?.items.find((item) => item.path === page.path);
  const linkedPages = (await getContentPages()).filter(
    (item) =>
      !(softwareIndex && softwareCatalog) &&
      item.path !== page.path &&
      item.kind !== "product" &&
      (softwareIndex
        ? item.path.startsWith("/software/download/")
        : item.path.startsWith(`${page.path}/`)),
  );
  const formPage = /service\//.test(pathname);
  const hasContent =
    (page.text.trim().length > 40 ||
      ((page.warehouseOnly || softwareDetail) && Boolean(page.html.trim()))) &&
    !page.hasSourcePlaceholder;
  const proseHtml = softwareDetail ? page.html.replace(/<(\/?)h1(?=[\s>])/g, "<$1h2") : page.html;
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
            เปิดแบบฟอร์ม Sunford
          </a>
        )}
      </header>
      {softwareIndex && softwareCatalog && (
        <SoftwareCatalog
          catalog={softwareCatalog}
          showDownloadLinks={page.path === "/applications-and-softwares"}
        />
      )}
      {/^\/software\/download\/sunford-rls(1100|1800)$/.test(page.path) && (
        <nav
          className="container source-section-links"
          aria-label="เลือกซอฟต์แวร์ตามรุ่นเครื่องชั่ง RLS"
        >
          {["1100", "1800"].map((model) => (
            <Link
              key={model}
              href={`/software/download/sunford-rls${model}`}
              aria-current={page.path.endsWith(model) ? "page" : undefined}
            >
              SUNFORD RLS{model}
            </Link>
          ))}
        </nav>
      )}
      {softwareDetail && !page.images.length && softwareEntry?.image && (
        <div className="container software-detail-image">
          <ProductImage
            src={softwareEntry.image}
            alt={softwareEntry.title}
            width={480}
            height={360}
          />
        </div>
      )}
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
          {!section && !softwareIndex && !softwareDetail && !page.images.length && (
            <div className="container source-image-slot">
              <ProductImage alt={page.title} width={1180} height={340} />
            </div>
          )}
          {!section && hasContent && (page.managed || !softwareIndex) && (
            <article
              className={`source-prose container ${page.kind === "article" ? "source-article" : ""}`}
              dangerouslySetInnerHTML={{ __html: proseHtml }}
            />
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
          ดูข้อมูลต้นฉบับจาก Sunford
        </a>
      </div>
    </main>
  );
}
