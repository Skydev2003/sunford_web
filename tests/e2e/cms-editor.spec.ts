import "dotenv/config";
import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFile, mkdir, unlink } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { CmsData, Field } from "../../src/features/cms/types";

type Model = {
  id: string;
  kind: string;
  title: string;
  data: CmsData;
  fields: Field[];
  version: string;
};
let models: Record<string, Model>;
let bundle: string;
let css: string;

test("all content management routes require an administrator session", async ({ page }) => {
  for (const route of [
    "/admin/categories",
    "/admin/content",
    "/admin/content/hero",
    "/admin/content/site",
    "/admin/content/product-media:feh5ks",
  ]) {
    await page.goto(route);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "เข้าสู่พื้นที่แอดมิน" })).toBeVisible();
  }
});

// The fixture uses the real editor and server-generated models. It stubs only
// auth, Next's request context and writes, so browser checks never change content.
test.describe("content editor interface", () => {
  test.skip(!process.env.DATABASE_URL, "Requires the read-only model lookup database.");
  test.beforeAll(async () => {
    await mkdir(resolve("node_modules/.cache"), { recursive: true });
    const output = resolve("node_modules/.cache/cms-model-test.cjs");
    await build({
      stdin: {
        contents:
          'export {getEditor} from "./src/features/cms/server/editors"; export {getAdminProduct} from "./src/features/admin/server/products"; export {getPrisma} from "./src/lib/prisma";',
        resolveDir: process.cwd(),
        loader: "ts",
      },
      outfile: output,
      bundle: true,
      platform: "node",
      format: "cjs",
      packages: "external",
      jsx: "automatic",
      define: {
        "import.meta.url": JSON.stringify(
          pathToFileURL(resolve("src/generated/prisma/client.ts")).href,
        ),
      },
      plugins: [
        {
          name: "model-context",
          setup(builder) {
            builder.onResolve(
              { filter: /^(server-only|next\/cache|@\/features\/admin\/server\/auth|\.\/auth)$/ },
              ({ path }) => ({ path, namespace: "context" }),
            );
            builder.onLoad({ filter: /.*/, namespace: "context" }, ({ path }) => ({
              contents:
                path === "server-only"
                  ? "export {};"
                  : path === "next/cache"
                    ? "export const cacheLife=()=>{};export const cacheTag=()=>{};"
                    : "export const requireAdmin=async()=>({});export const getAdminSession=async()=>({});",
              loader: "js",
            }));
          },
        },
      ],
    });
    const server = createRequire(resolve("package.json"))(output);
    try {
      models = Object.fromEntries(
        await Promise.all(
          [
            "hero",
            "product-media:feh5ks",
            "navigation",
            "section:solutions",
            "page:visual-mapping-qa",
          ].map(async (id) => [id, await server.getEditor(id)]),
        ),
      );
      const product = await server.getAdminProduct("feh5ks");
      models.gallery = {
        id: "gallery",
        kind: "gallery",
        title: "รูปภาพทั้งหมดของสินค้า",
        data: { images: product.gallery, primaryImage: product.image },
        fields: [],
        version: product.updatedAt,
      };
    } finally {
      await server.getPrisma().$disconnect();
      await unlink(output);
    }
    const result = await build({
      stdin: {
        contents:
          'import React from "react";import {createRoot} from "react-dom/client";import {DocumentEditor} from "./src/features/cms/components/document-editor";import {ProductGalleryEditor} from "./src/features/admin/components/product-gallery-editor";function GalleryHarness(){const [images,setImages]=React.useState(window.__cmsModel.data.images);const [primary,setPrimary]=React.useState(window.__cmsModel.data.primaryImage);const [busy,setBusy]=React.useState(false);return <><h1>รูปภาพทั้งหมดของสินค้า</h1><ProductGalleryEditor images={images} primaryImage={primary} disabled={busy} onChange={setImages} onPrimary={setPrimary} onBusy={setBusy} onUploaded={()=>{}}/><button type="button" onClick={()=>window.__cmsSaved={images,primary}}>บันทึกตัวอย่าง</button></>}createRoot(document.getElementById("root")).render(window.__cmsModel.id==="gallery"?<GalleryHarness/>:React.createElement(DocumentEditor,window.__cmsModel));',
        resolveDir: process.cwd(),
        loader: "tsx",
      },
      write: false,
      bundle: true,
      platform: "browser",
      format: "iife",
      jsx: "automatic",
      define: {
        "process.env.NODE_ENV": '"production"',
        "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(
          process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
        ),
      },
      plugins: [
        {
          name: "browser-write-boundary",
          setup(builder) {
            builder.onResolve(
              {
                filter:
                  /^(\.\.\/server\/(actions|media-actions)|@\/features\/admin\/server\/media-actions|next\/(link|image))$/,
              },
              ({ path }) => ({ path, namespace: "fixture" }),
            );
            builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
              resolveDir: process.cwd(),
              contents:
                path === "next/link"
                  ? 'import React from "react"; export default function Link(props){return React.createElement("a",props)}'
                  : path === "next/image"
                    ? 'import React from "react";export default function Image({fill,src,alt,width,height,...props}){return React.createElement("img",{...props,src,alt,width:fill?undefined:width,height:fill?undefined:height,style:fill?{width:"100%",height:"100%",objectFit:"contain"}:undefined})}'
                    : path.includes("media-actions")
                      ? 'export async function uploadProductImage(form){const file=form.get("file");(window.__uploads??=[]).push({name:file.name,type:file.type,size:file.size});const bitmap=await createImageBitmap(file);window.__lastUpload={width:bitmap.width,height:bitmap.height};bitmap.close();return {url:"/images/products/wps10ks.png"}}'
                      : 'export async function saveDocumentAction(_,form){window.__cmsSaved=JSON.parse(form.get("data"));return {}};export async function deleteDocumentAction(){return {error:"Writes disabled in UI fixture"}}',
              loader: "js",
            }));
          },
        },
      ],
    });
    bundle = result.outputFiles[0].text;
    css = (
      await Promise.all(
        ["base", "content", "admin", "cms-admin"].map((name) =>
          readFile(`src/styles/${name}.css`, "utf8"),
        ),
      )
    ).join("\n");
  });
  async function open(page: Page, id: string) {
    const model = JSON.stringify(models[id]).replaceAll("<", "\\u003c");
    await page.route("**/__cms_editor_fixture", (route) =>
      route.fulfill({
        contentType: "text/html; charset=utf-8",
        body: `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main class="admin-app admin-main" id="root"></main><script>window.__cmsModel=${model}</script><script>${bundle.replaceAll("</script", "<\\/script")}</script></body></html>`,
      }),
    );
    await page.goto("/__cms_editor_fixture");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(models[id].title);
  }
  test("hero preview follows draft text and slide order without saving", async ({ page }) => {
    await open(page, "hero");
    await page.getByRole("button", { name: "ดูตัวอย่างฉบับร่าง", exact: true }).click();
    const preview = page.frameLocator(".admin-draft-preview iframe");
    await page.getByLabel("ข้อความแถบประกาศ", { exact: true }).fill("ประกาศในฉบับร่าง");
    await page.getByLabel("หัวข้อ (เว้นว่างเพื่อใช้ชื่อสินค้า)").first().fill("หัวข้อสไลด์ใหม่");
    await expect(preview.locator("aside")).toContainText("ประกาศในฉบับร่าง");
    await expect(preview.locator("h1").first()).toHaveText("หัวข้อสไลด์ใหม่");
    await page.getByRole("button", { name: "เลื่อนรายการ 1 ลง", exact: true }).click();
    await expect(preview.locator("h1").nth(1)).toHaveText("หัวข้อสไลด์ใหม่");
    await page.getByRole("button", { name: "ขนาดมือถือ 390px", exact: true }).click();
    await expect(page.locator(".admin-draft-preview iframe")).toHaveCSS("width", "390px");
    expect(await page.evaluate(() => "__cmsSaved" in window)).toBe(false);
  });
  test("page preview shows formatted content and SEO while removing executable HTML", async ({
    page,
  }) => {
    await open(page, "page:visual-mapping-qa");
    const title = page.getByLabel("หัวข้อ", { exact: true });
    await title.fill("A".repeat(61));
    await expect(title.locator("..").locator(".admin-character-count")).toContainText("61 / 5,000");
    await expect(title.locator("..").locator(".admin-character-count")).toContainText(
      "ยาวกว่าที่แนะนำ",
    );
    await title.fill("หัวข้อบทความฉบับร่าง");
    await page.getByRole("button", { name: "แก้ไข HTML", exact: true }).click();
    await page
      .getByRole("textbox", { name: "เนื้อหา HTML", exact: true })
      .fill(
        '<p><strong>เนื้อหาฉบับร่าง</strong></p><script>parent.__previewExecuted=true</script><img src="https://example.invalid/leak" onerror="parent.__previewExecuted=true"><iframe src="https://example.invalid/frame"></iframe><meta http-equiv="refresh" content="0;url=https://example.invalid"><a href="javascript:alert(1)">ลิงก์</a>',
      );
    await page.getByRole("button", { name: "ดูตัวอย่างฉบับร่าง", exact: true }).click();
    const preview = page.frameLocator(".admin-draft-preview iframe");
    await expect(preview.locator("h1")).toHaveText("หัวข้อบทความฉบับร่าง");
    await expect(preview.locator("strong")).toHaveText("เนื้อหาฉบับร่าง");
    await expect(preview.locator("script,iframe,img,[onclick],[onerror],a[href]")).toHaveCount(0);
    await expect(preview.locator("h3").last()).toHaveText("หัวข้อบทความฉบับร่าง | SUNFORD");
    expect(await page.evaluate(() => "__previewExecuted" in window || "__cmsSaved" in window)).toBe(
      false,
    );
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
  test("cropper cancels without uploading and creates a cropped image only after confirmation", async ({
    page,
  }) => {
    await open(page, "gallery");
    const buffer = Buffer.from(
      await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 120;
        canvas.height = 60;
        const context = canvas.getContext("2d")!;
        context.fillStyle = "red";
        context.fillRect(0, 0, 60, 60);
        context.fillStyle = "blue";
        context.fillRect(60, 0, 60, 60);
        return canvas.toDataURL("image/png").split(",")[1];
      }),
      "base64",
    );
    const input = page.getByLabel("เปลี่ยนรูปที่ 3", { exact: true });
    await input.setInputFiles({ name: "crop.png", mimeType: "image/png", buffer });
    const dialog = page.getByRole("dialog", { name: "ตัดภาพก่อนอัปโหลด" });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => "__uploads" in window)).toBe(false);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => "__uploads" in window)).toBe(false);
    await input.setInputFiles({ name: "crop.png", mimeType: "image/png", buffer });
    await dialog.getByLabel("สัดส่วนภาพ", { exact: true }).selectOption("1");
    await dialog.getByLabel("ตำแหน่งแนวนอน", { exact: true }).fill("100");
    await expect(dialog).toContainText("กรอบที่เลือก 60 × 60");
    const color = await dialog
      .locator("canvas")
      .evaluate((canvas) =>
        Array.from((canvas as HTMLCanvasElement).getContext("2d")!.getImageData(30, 30, 1, 1).data),
      );
    expect(color).toEqual([0, 0, 255, 255]);
    await dialog.getByRole("button", { name: "ใช้ภาพที่ตัด", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.locator(".admin-gallery-card img").nth(2)).toHaveAttribute(
      "src",
      "/images/products/wps10ks.png",
    );
    const uploaded = await page.evaluate(() => {
      const { __uploads, __lastUpload } = window as unknown as {
        __uploads: { name: string; type: string; size: number }[];
        __lastUpload: { width: number; height: number };
      };
      return { __uploads, __lastUpload };
    });
    expect(uploaded.__uploads).toHaveLength(1);
    expect(uploaded.__uploads[0]).toMatchObject({ name: "crop-crop.webp", type: "image/webp" });
    expect(uploaded.__lastUpload).toEqual({ width: 60, height: 60 });
  });
  test("invalid and oversized images keep the gallery unchanged", async ({ page }) => {
    await open(page, "gallery");
    const original = await page.locator(".admin-gallery-card img").nth(2).getAttribute("src");
    const input = page.getByLabel("เปลี่ยนรูปที่ 3", { exact: true });
    await input.setInputFiles({
      name: "broken.png",
      mimeType: "image/png",
      buffer: Buffer.from("not an image"),
    });
    const dialog = page.getByRole("dialog", { name: "ตัดภาพก่อนอัปโหลด" });
    await expect(dialog.getByRole("alert")).toContainText("ไฟล์นี้ไม่ใช่รูป");
    await expect(dialog.getByRole("button", { name: "ใช้ภาพที่ตัด", exact: true })).toBeDisabled();
    await dialog.getByRole("button", { name: "ยกเลิกการเลือกรูป", exact: true }).click();
    await input.setInputFiles({
      name: "large.png",
      mimeType: "image/png",
      buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
    });
    await expect(page.getByRole("alert")).toContainText("ไม่เกิน 4 MB");
    await expect(dialog).toHaveCount(0);
    await expect(page.locator(".admin-gallery-card img").nth(2)).toHaveAttribute("src", original!);
    expect(await page.evaluate(() => "__uploads" in window)).toBe(false);
  });
  test("hero slide selection, ordering and text are submitted together", async ({ page }) => {
    await open(page, "hero");
    await page.getByLabel("ข้อความแถบประกาศ", { exact: true }).fill("ประกาศใหม่จากแอดมิน");
    await page.getByLabel("หัวข้อ (เว้นว่างเพื่อใช้ชื่อสินค้า)").first().fill("สไลด์แรกที่แก้ไข");
    await page.getByRole("button", { name: "เลื่อนรายการ 1 ลง", exact: true }).click();
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).first().click();
    const saved = await page.evaluate(
      () => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved,
    );
    expect(saved.announcement).toBe("ประกาศใหม่จากแอดมิน");
    expect((saved.slides as CmsData[])[1].title).toBe("สไลด์แรกที่แก้ไข");
    expect((saved.slides as CmsData[])[1].productId).toBe("acs30-jc21");
    await page.screenshot({
      path: test.info().outputPath("cms-hero-desktop.png"),
      animations: "disabled",
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath("cms-hero-mobile.png"),
      animations: "disabled",
    });
  });
  test("product gallery, price, rich content and video fields submit edits", async ({ page }) => {
    await open(page, "product-media:feh5ks");
    await page.getByLabel("ราคา (บาท)", { exact: true }).fill("2500");
    const description = page.getByRole("textbox", { name: "เนื้อหาแนะนำสินค้า", exact: true });
    await description.fill("รายละเอียดที่แอดมินแก้ไข");
    const gallery = page
      .locator(".cms-array")
      .filter({ has: page.getByRole("heading", { name: "รูปภาพในหน้าสินค้า", exact: true }) });
    const before = await gallery.locator(".cms-array-row").count();
    await gallery.getByRole("button", { name: "เพิ่มรายการ", exact: true }).click();
    await expect(gallery.locator(".cms-array-row")).toHaveCount(before + 1);
    await gallery
      .locator('input[type="file"]')
      .last()
      .setInputFiles({
        name: "test.png",
        mimeType: "image/png",
        buffer: await readFile("public/images/products/wps10ks.png"),
      });
    await page.getByRole("button", { name: "ใช้รูปต้นฉบับ", exact: true }).click();
    await expect(gallery.locator("img").last()).toHaveAttribute(
      "src",
      "/images/products/wps10ks.png",
    );
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).first().click();
    const saved = await page.evaluate(
      () => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved,
    );
    expect(saved.price).toBe("2500");
    expect(saved.descriptionHtml).toContain("รายละเอียดที่แอดมินแก้ไข");
    expect((saved.gallery as CmsData[]).at(-1)?.image).toBe("/images/products/wps10ks.png");
  });
  test("navigation and solution fields retain their existing content on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const id of ["navigation", "section:solutions"]) {
      await open(page, id);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).first().click();
      const saved = await page.evaluate(
        () => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved,
      );
      expect(saved).toEqual(models[id].data);
    }
  });
  test("menu rows expand one sibling at a time and retain unsaved edits when folded", async ({
    page,
  }, testInfo) => {
    await open(page, "navigation");
    const menu = page.locator(".cms-fieldset > .cms-fields > .cms-array").first();
    const rows = menu.locator(":scope > .cms-array-row");
    const first = rows.nth(0);
    const second = rows.nth(1);
    const firstToggle = first.locator(":scope > .cms-row-actions > .cms-array-toggle");
    const secondToggle = second.locator(":scope > .cms-row-actions > .cms-array-toggle");
    await expect(menu.locator('.cms-array-toggle[aria-expanded="true"]')).toHaveCount(0);
    await firstToggle.click();
    await expect(firstToggle).toHaveAttribute("aria-expanded", "true");
    await expect(first.locator(":scope > .cms-fields")).toBeVisible();
    const nested = first.locator(".cms-fields .cms-array-toggle").first();
    await nested.press("Space");
    await expect(nested).toHaveAttribute("aria-expanded", "true");
    await secondToggle.click();
    await expect(firstToggle).toHaveAttribute("aria-expanded", "false");
    await expect(first.locator(":scope > .cms-fields")).toBeHidden();
    await expect(secondToggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator('.admin-form-bottom [role="status"]')).toHaveCount(0);
    await firstToggle.press("Enter");
    await expect(secondToggle).toHaveAttribute("aria-expanded", "false");
    await expect(nested).toHaveAttribute("aria-expanded", "true");
    const label = first.getByLabel("ข้อความ", { exact: true }).first();
    await label.fill("เมนูที่กำลังแก้ไข");
    await secondToggle.click();
    await firstToggle.click();
    await expect(label).toHaveValue("เมนูที่กำลังแก้ไข");
    for (const width of [1440, 390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(firstToggle).toHaveAttribute(
        "aria-controls",
        (await first.locator(":scope > .cms-fields").getAttribute("id"))!,
      );
    }
    await page.screenshot({ path: testInfo.outputPath("menu-accordion-mobile.png") });
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).first().click();
    const saved = await page.evaluate(
      () => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved,
    );
    const expected = structuredClone(models.navigation.data);
    (expected.items as CmsData[])[0].label = "เมนูที่กำลังแก้ไข";
    expect(saved).toEqual(expected);
  });
  test("menu expansion follows reordered rows and opens new items without losing selection after removal", async ({
    page,
  }) => {
    await open(page, "navigation");
    const menu = page.locator(".cms-fieldset > .cms-fields > .cms-array").first();
    const rows = menu.locator(":scope > .cms-array-row");
    const original = models.navigation.data.items as CmsData[];
    await rows.nth(0).locator(":scope > .cms-row-actions > .cms-array-toggle").click();
    await rows.nth(0).locator(".cms-fields .cms-array-toggle").first().click();
    await rows
      .nth(0)
      .locator(":scope > .cms-row-actions")
      .getByRole("button", { name: "เลื่อนรายการ 1 ลง", exact: true })
      .click();
    await expect(
      rows.nth(1).locator(":scope > .cms-row-actions > .cms-array-toggle"),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(rows.nth(1).getByLabel("ข้อความ", { exact: true }).first()).toHaveValue(
      String(original[0].label),
    );
    await expect(rows.nth(1).locator(".cms-fields .cms-array-toggle").first()).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await menu.locator(":scope > button").click();
    await expect(rows).toHaveCount(original.length + 1);
    await expect(
      rows.last().locator(":scope > .cms-row-actions > .cms-array-toggle"),
    ).toHaveAttribute("aria-expanded", "true");
    await expect(
      rows.nth(1).locator(":scope > .cms-row-actions > .cms-array-toggle"),
    ).toHaveAttribute("aria-expanded", "false");
    await rows
      .nth(0)
      .locator(":scope > .cms-row-actions")
      .getByRole("button", { name: "นำรายการ 1 ออก", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "ยืนยันนำรายการออก", exact: true })
      .getByRole("button", { name: "ยืนยันนำรายการออก", exact: true })
      .click();
    await expect(rows).toHaveCount(original.length);
    await expect(
      rows.last().locator(":scope > .cms-row-actions > .cms-array-toggle"),
    ).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).first().click();
    const saved = await page.evaluate(
      () => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved,
    );
    expect((saved.items as CmsData[])[0]).toEqual(original[0]);
    expect((saved.items as CmsData[]).slice(1, -1)).toEqual(original.slice(2));
    expect((saved.items as CmsData[]).at(-1)).toEqual(
      models.navigation.fields.find((field) => field.key === "items")?.initial,
    );
  });
  test("each original product image can be replaced, ordered, removed or made primary", async ({
    page,
  }) => {
    await open(page, "gallery");
    const original = models.gallery.data.images as string[];
    await expect(page.locator(".admin-gallery-card")).toHaveCount(4);
    await page.getByLabel("เปลี่ยนรูปที่ 3", { exact: true }).setInputFiles({
      name: "replacement.png",
      mimeType: "image/png",
      buffer: await readFile("public/images/products/wps10ks.png"),
    });
    await page.getByRole("button", { name: "ใช้รูปต้นฉบับ", exact: true }).click();
    await expect(page.locator(".admin-gallery-card img").nth(2)).toHaveAttribute(
      "src",
      "/images/products/wps10ks.png",
    );
    await expect(page.locator(".admin-gallery-card img").nth(0)).toHaveAttribute(
      "src",
      original[0],
    );
    await expect(page.locator(".admin-gallery-card img").nth(3)).toHaveAttribute(
      "src",
      original[3],
    );
    await page.getByRole("button", { name: "ใช้รูปที่ 3 เป็นรูปหลัก", exact: true }).click();
    await page.getByRole("button", { name: "เลื่อนรูปที่ 3 ขึ้น", exact: true }).click();
    await page.getByRole("button", { name: "นำรูปที่ 4 ออก", exact: true }).click();
    await page.getByRole("button", { name: "ยืนยันนำรูปออก", exact: true }).click();
    await page.getByRole("button", { name: "บันทึกตัวอย่าง", exact: true }).click();
    const saved = await page.evaluate(
      () => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved,
    );
    expect(saved.images).toEqual([original[0], "/images/products/wps10ks.png", original[1]]);
    expect(saved.primary).toBe("/images/products/wps10ks.png");
    await page.screenshot({
      path: test.info().outputPath("product-gallery-editor-desktop.png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath("product-gallery-editor-mobile.png"),
      fullPage: true,
    });
  });
});
