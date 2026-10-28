import "server-only";
import { sourcePageId } from "./identity";
import { getPrisma } from "@/lib/prisma";
import { requireAdmin, type AdminSession } from "@/features/admin/server/auth";
import { getAdminProduct } from "@/features/admin/server/products";
import { importedPages, getSourceProduct } from "@/features/content/server/content-repository";
import { getSnapshotProducts } from "@/features/content/data/catalog-snapshot";
import { productPresentation } from "@/features/catalog/data/product-presentation";
import { categories } from "@/features/catalog/types";
import {
  BusinessSolutionsTemplate,
  BrandStoryTemplate,
  SupportSectionTemplate,
} from "@/features/home/components/sections";
import { FooterTemplate } from "@/components/layout/footer";
import { sectionFields } from "./section-tree";
import { solutionImages } from "@/features/home/data/business-solutions";
import {
  catalogDefaults,
  defaultHero,
  defaultSite,
  heroFields,
  linkFields,
  showcaseDefaults,
  siteFields,
  spotlightDefaults,
  storiesDefaults,
  textFields,
  videoFields,
} from "../data/settings";
import {
  defaultNavigation,
  defaultNavigationExtras,
  defaultNavigationGroups,
} from "../data/navigation";
import { getCategories } from "./categories";
import type { CmsData, Field } from "../types";
import {
  contactLocationImageFields,
  defaultContactLocationImages,
} from "@/features/content/data/contact-locations";

import { homeSettingCards, siteSettingCards } from "../data/admin-sections";
import { guidedFields } from "../data/editor-guidance";

const textLabels: Record<string, string> = {
  title: "หัวข้อ",
  accent: "หัวข้อเน้น",
  description: "คำอธิบาย",
  primaryLabel: "ข้อความปุ่มหลัก",
  secondaryLabel: "ข้อความปุ่มรอง",
  secondaryHref: "ลิงก์ปุ่มรอง",
  eyebrow: "ข้อความเหนือหัวข้อ",
  linkLabel: "ข้อความปุ่ม",
  href: "ลิงก์",
  cardLabel: "ป้ายบนการ์ดบทความ",
  readLabel: "ข้อความอ่านต่อ",
  videoTitle: "หัวข้อวิดีโอ",
  note: "ข้อความใต้รายการสินค้า",
  noteDetail: "คำแนะนำการเปรียบเทียบ",
  navEyebrow: "ข้อความเหนือแถบสินค้า",
  navTitle: "หัวข้อแถบสินค้า",
  navDigital: "ชื่อกลุ่มเครื่องชั่งดิจิทัล",
  navDigitalEnglish: "ชื่อกลุ่มเครื่องชั่งดิจิทัล (อังกฤษ)",
  navSmart: "ชื่อกลุ่มเครื่องชั่งอัจฉริยะ",
  navSmartEnglish: "ชื่อกลุ่มเครื่องชั่งอัจฉริยะ (อังกฤษ)",
  navAccessories: "ชื่อกลุ่มอุปกรณ์เสริม",
  navAccessoriesEnglish: "ชื่อกลุ่มอุปกรณ์เสริม (อังกฤษ)",
  navSoftware: "ชื่อกลุ่มซอฟต์แวร์",
  navSoftwareEnglish: "ชื่อกลุ่มซอฟต์แวร์ (อังกฤษ)",
  accessoriesHref: "ลิงก์กลุ่มอุปกรณ์เสริม",
  softwareHref: "ลิงก์กลุ่มซอฟต์แวร์",
};
for (const [id, label] of [
  ["digital", "เครื่องชั่งดิจิทัล"],
  ["smart", "เครื่องชั่งอัจฉริยะ"],
  ["accessories", "อุปกรณ์เสริม"],
  ["software", "ซอฟต์แวร์"],
]) {
  textLabels[`${id}Name`] = `${label}: หัวข้อ`;
  textLabels[`${id}English`] = `${label}: ข้อความเหนือหัวข้อ`;
  textLabels[`${id}Description`] = `${label}: คำอธิบาย`;
}
export async function getEditor(routeId: string, session?: AdminSession) {
  const admin = session ?? (await requireAdmin());
  // Dynamic route params can retain percent escapes in the current Next runtime.
  let id: string;
  try {
    id = decodeURIComponent(routeId);
  } catch {
    return null;
  }
  const row = await getPrisma().cmsDocument.findUnique({ where: { id } });
  if (row?.deletedAt) return null;
  const products =
    id === "hero" || id.startsWith("page:")
      ? await getPrisma().product.findMany({
          where: { deletedAt: null },
          select: { id: true, name: true, published: true },
          orderBy: { name: "asc" },
        })
      : [];
  const productOptions = [
    { value: "", label: "เลือกสินค้า" },
    ...products.map((product) => ({ value: product.id, label: product.name })),
  ];
  let kind = "settings",
    title = [...homeSettingCards, ...siteSettingCards].find((card) => card.id === id)?.title ?? "";
  let data: CmsData = {};
  let fields: Field[] = [];
  let productVersion: string | undefined;
  if (id === "hero") {
    data = defaultHero as unknown as CmsData;
    fields = heroFields(products.filter((p) => p.published));
  } else if (id === "site") {
    data = { ...defaultSite };
    fields = siteFields;
  } else if (id === "contact-locations") {
    data = { ...defaultContactLocationImages };
    fields = contactLocationImageFields;
  } else if (id === "navigation") {
    data = { items: defaultNavigation, ...defaultNavigationExtras };
    fields = [
      {
        key: "items",
        label: "เมนูหลัก",
        type: "array",
        initial: { label: "เมนูใหม่", href: "/", links: [], groups: [] },
        fields: [
          ...linkFields,
          {
            key: "submenuLabel",
            label: "ชื่อเต็มในเมนูย่อย",
            hint: "เว้นว่างเพื่อใช้ชื่อเมนูหลัก",
          },
          {
            key: "links",
            label: "เมนูย่อย",
            type: "array",
            initial: { label: "", href: "" },
            fields: linkFields,
          },
          {
            key: "groups",
            label: "คอลัมน์รอง (ไม่เกิน 2 คอลัมน์)",
            type: "array",
            initial: { label: "", links: [] },
            hint: "เมนูบริการฯ ใช้หัวข้อสำรวจเพิ่มเติมและให้เราช่วยคุณด้านล่าง",
            fields: [
              { key: "label", label: "หัวข้อคอลัมน์" },
              {
                key: "links",
                label: "ลิงก์ในคอลัมน์",
                type: "array",
                initial: { label: "", href: "" },
                fields: linkFields,
              },
            ],
          },
        ],
      },
    ];
    fields.push(
      { key: "exploreLabel", label: "หัวข้อเมนูสำรวจเพิ่มเติม" },
      {
        key: "exploreLinks",
        label: "ลิงก์สำรวจเพิ่มเติม",
        type: "array",
        initial: { label: "", href: "" },
        fields: linkFields,
      },
      { key: "helpLabel", label: "หัวข้อเมนูช่วยเหลือ" },
      {
        key: "helpLinks",
        label: "ลิงก์ช่วยเหลือ",
        type: "array",
        initial: { label: "", href: "" },
        fields: linkFields,
      },
      {
        key: "mobileLinks",
        label: "ลิงก์เพิ่มเติมบนมือถือ",
        type: "array",
        initial: { label: "", href: "" },
        fields: linkFields,
      },
    );
  } else if (id === "spotlight") {
    data = { ...spotlightDefaults };
    fields = textFields(spotlightDefaults, textLabels);
  } else if (id === "showcase") {
    data = { ...showcaseDefaults };
    fields = textFields(showcaseDefaults, textLabels);
  } else if (id === "stories") {
    data = { ...storiesDefaults };
    fields = textFields(storiesDefaults, textLabels);
  } else if (id === "catalog") {
    data = { ...catalogDefaults };
    fields = textFields(catalogDefaults, textLabels);
  } else if (id === "videos") {
    data = { videos: importedPages.find((page) => page.path === "/")?.videos ?? [] };
    fields = [
      {
        key: "videos",
        label: "วิดีโอ",
        type: "array",
        fields: videoFields,
        initial: { id: "", image: "" },
      },
    ];
  } else if (id.startsWith("section:")) {
    const template = {
      "section:solutions": BusinessSolutionsTemplate,
      "section:story": BrandStoryTemplate,
      "section:support": SupportSectionTemplate,
      "section:footer": FooterTemplate,
    }[id];
    if (!template) return null;
    ({ data, fields } = sectionFields(template()));
    if (id === "section:solutions") {
      const labels: Record<string, { label: string; hint: string }> = {
        [solutionImages.feature]: {
          label: "รูปการ์ดหลัก · SUNFORD POS",
          hint: "ภาพแนวสี่เหลี่ยมจัตุรัส วางสินค้าไว้ช่วงล่าง และเว้นพื้นที่ด้านบนสำหรับข้อความ",
        },
        [solutionImages.accessories]: {
          label: "รูปการ์ดอุปกรณ์เสริม",
          hint: "แนะนำภาพสินค้าพื้นหลังโปร่งใส รูปจะแสดงด้านขวาของการ์ด",
        },
        [solutionImages.software]: {
          label: "รูปการ์ดแอปพลิเคชันและซอฟต์แวร์",
          hint: "แนะนำภาพพื้นหลังโปร่งใส รูปจะแสดงด้านขวาของการ์ด",
        },
        [solutionImages.connections]: {
          label: "รูปชุดไอคอนเชื่อมต่อบนการ์ดหลัก",
          hint: "ภาพเดียวรวมรถเข็น กราฟ และคลาวด์ แนะนำ PNG พื้นหลังโปร่งใสแนวตั้ง",
        },
      };
      fields = fields.map((field) => {
        const image = field.type === "image" && labels[String(data[field.key])];
        return image ? { ...field, ...image } : field;
      });
    }
    if (id === "section:footer") {
      data.customerMapEnabled = true;
      fields.unshift({
        key: "customerMapEnabled",
        label: "เปิดให้ดูแผนที่ลูกค้า — ครอบคลุมทั่วประเทศ",
        type: "switch",
        hint: "เปิด: กดดูแผนที่ลูกค้าได้ · ปิด: แสดงรูปและข้อความ แต่กดดูแผนที่ไม่ได้ · กดบันทึกเพื่อใช้งาน",
      });
    }
  } else if (id.startsWith("category:")) {
    kind = "category";
    const original = categories.find((category) => `category:${category.id}` === id);
    if (id === "category:all") return null;
    title = original
      ? `หมวดหมู่: ${(row?.data && (row.data as { label: string }).label) || original.label}`
      : row
        ? "แก้ไขหมวดหมู่"
        : "เพิ่มหมวดหมู่";
    data = { label: original?.label ?? "", english: original?.english ?? "" };
    fields = [
      { key: "label", label: "ชื่อหมวดหมู่ภาษาไทย" },
      { key: "english", label: "ชื่อหมวดหมู่ภาษาอังกฤษ" },
    ];
  } else if (id.startsWith("product-media:")) {
    kind = "product-media";
    const product = await getAdminProduct(id.slice(14), admin);
    if (!product) return null;
    const snapshot = getSnapshotProducts().find((p) => p.id === product.id);
    const source = getSourceProduct(snapshot?.sourceId ?? product.slug);
    const presentation = productPresentation(product, snapshot, source);
    const sourcePage = importedPages.find((page) => page.path === source?.path);
    title = `รูปและเนื้อหา: ${product.name}`;
    productVersion = product.updatedAt;
    data = {
      price: source?.price ?? snapshot?.price ?? null,
      gallery: presentation.images.map((image) => ({ image })),
      descriptionHtml: presentation.descriptionHtml ?? `<p>${escapeHtml(product.description)}</p>`,
      detailsHtml: source?.detailsHtml ?? "",
      specifications: presentation.specifications,
      videos: sourcePage?.videos ?? [],
    };
    fields = [
      {
        key: "price",
        label: "ราคา (บาท)",
        type: "number",
        hint: "เว้นว่างหากต้องการให้ลูกค้าสอบถามราคา",
      },
      {
        key: "gallery",
        label: "รูปภาพในหน้าสินค้า",
        type: "array",
        fields: [{ key: "image", label: "รูปภาพ", type: "image" }],
        initial: { image: "" },
        hint: "เรียงลำดับรูปในหน้ารายละเอียด รูปหลักบนการ์ดแก้ได้ในข้อมูลสินค้า",
      },
      { key: "descriptionHtml", label: "เนื้อหาแนะนำสินค้า", type: "html" },
      { key: "detailsHtml", label: "รายละเอียดเพิ่มเติมและตาราง", type: "html" },
      {
        key: "specifications",
        label: "คุณสมบัติ",
        type: "array",
        fields: [
          { key: "label", label: "หัวข้อ" },
          { key: "value", label: "ค่า" },
        ],
        initial: { label: "", value: "" },
      },
      {
        key: "videos",
        label: "วิดีโอสินค้า",
        type: "array",
        fields: videoFields,
        initial: { id: "", image: "" },
      },
    ];
  } else if (id.startsWith("page:")) {
    kind = "page";
    const original = importedPages.find(
      (page) => sourcePageId(page.path) === id && page.kind !== "product" && page.path !== "/",
    );
    title = row || original ? "แก้ไขหน้าข้อมูล / บทความ" : "เพิ่มหน้าข้อมูล / บทความ";
    const originalProducts = original
      ? products.filter((product) =>
          original.productHandles.includes(
            getSnapshotProducts().find((p) => p.id === product.id)?.sourceId ?? "",
          ),
        )
      : [];
    data = {
      sourcePath: original?.path ?? "",
      path: original?.path ?? "/new-page",
      title: original?.title ?? "",
      kind: original?.kind ?? "page",
      html: original?.html ?? "",
      images: original?.images.map((image) => ({ image })) ?? [],
      videos: original?.videos ?? [],
      productIds: originalProducts.map((product) => ({ id: product.id })),
      published: true,
      order: 0,
    };
    fields = [
      { key: "title", label: "หัวข้อ" },
      {
        key: "path",
        label: "URL หน้าข้อมูล",
        hint: "ขึ้นต้นด้วย / เช่น /news/new-story เมื่อเปลี่ยน URL เดิมจะส่งต่อมายัง URL ใหม่",
      },
      {
        key: "kind",
        label: "ประเภท",
        type: "select",
        options: [
          { value: "page", label: "หน้าข้อมูล / ซอฟต์แวร์ / โซลูชัน" },
          { value: "article", label: "ข่าว / บทความ" },
          { value: "collection", label: "กลุ่มสินค้า" },
        ],
      },
      { key: "order", label: "ลำดับแสดงผล", type: "number" },
      { key: "published", label: "เผยแพร่บนเว็บไซต์", type: "boolean" },
      { key: "html", label: "เนื้อหา (รวมลิงก์ดาวน์โหลดและรูปประกอบ)", type: "html" },
      {
        key: "images",
        label: "รูปปกและภาพประกอบ",
        type: "array",
        initial: { image: "" },
        fields: [{ key: "image", label: "รูปภาพ", type: "image" }],
      },
      {
        key: "videos",
        label: "วิดีโอ",
        type: "array",
        initial: { id: "", image: "" },
        fields: videoFields,
      },
      {
        key: "productIds",
        label: "สินค้าที่เชื่อมโยง",
        type: "array",
        initial: { id: "" },
        fields: [{ key: "id", label: "สินค้า", type: "select", options: productOptions }],
      },
    ];
  } else return null;
  if (row && row.kind !== kind) return null;
  const editorData = { ...data, ...((row?.data as CmsData) ?? {}) };
  if (id === "navigation") {
    editorData.items = (editorData.items as CmsData[]).map((item) => ({
      ...item,
      groups: item.groups ?? defaultNavigationGroups[String(item.href)] ?? [],
    }));
  }
  return {
    id,
    kind,
    title,
    data: editorData,
    fields: guidedFields(id, kind, fields),
    version: row?.updatedAt.toISOString() ?? "",
    productVersion,
    categories: kind === "category" ? await getCategories() : [],
  };
}
function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
export async function listContentEditors() {
  await requireAdmin();
  const rows = await getPrisma().cmsDocument.findMany({ where: { kind: "page" } });
  const originals = importedPages
    .filter(
      (page) =>
        page.kind !== "product" &&
        page.path !== "/" &&
        !rows.some(
          (row) =>
            (row.data as CmsData).sourcePath &&
            decodeURIComponent(String((row.data as CmsData).sourcePath)).toLowerCase() ===
              decodeURIComponent(page.path).toLowerCase(),
        ),
    )
    .filter(
      (page, index, pages) =>
        pages.findIndex(
          (candidate) =>
            decodeURIComponent(candidate.path).toLowerCase() ===
            decodeURIComponent(page.path).toLowerCase(),
        ) === index,
    )
    .map((page) => ({
      id: sourcePageId(page.path),
      title: page.title,
      path: page.path,
      kind: page.kind,
      published: true,
    }));
  return [
    ...rows
      .filter((row) => !row.deletedAt)
      .map((row) => ({
        id: row.id,
        title: String((row.data as CmsData).title),
        path: String((row.data as CmsData).path),
        kind: String((row.data as CmsData).kind),
        published: (row.data as CmsData).published !== false,
      })),
    ...originals,
  ];
}
