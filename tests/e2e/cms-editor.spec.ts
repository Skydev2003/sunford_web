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
          ["hero", "product-media:feh5ks", "navigation", "section:solutions", "section:footer"].map(
            async (id) => [id, await server.getEditor(id)],
          ),
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
      define: { "process.env.NODE_ENV": '"production"' },
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
                      ? 'export async function uploadProductImage(){return {url:"/images/products/wps10ks.png"}}'
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
  test("footer map switch saves both states while retaining footer content", async ({ page }) => {
    await open(page, "section:footer");
    const toggle = page.getByRole("switch", {
      name: "เปิดให้ดูแผนที่ลูกค้า — ครอบคลุมทั่วประเทศ",
    });
    for (const enabled of [false, true]) {
      if ((await toggle.getAttribute("aria-checked")) !== String(enabled)) {
        await toggle.focus();
        await page.keyboard.press("Space");
      }
      await expect(toggle).toHaveAttribute("aria-checked", String(enabled));
      await page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).first().click();
      await expect
        .poll(() => page.evaluate(() => (window as unknown as { __cmsSaved: CmsData }).__cmsSaved))
        .toEqual({ ...models["section:footer"].data, customerMapEnabled: enabled });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await toggle.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: test.info().outputPath("cms-footer-switch-mobile.png") });
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
        buffer: Buffer.from("ui-fixture"),
      });
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
  test("each original product image can be replaced, ordered, removed or made primary", async ({
    page,
  }) => {
    await open(page, "gallery");
    const original = models.gallery.data.images as string[];
    await expect(page.locator(".admin-gallery-card")).toHaveCount(4);
    await page.getByLabel("เปลี่ยนรูปที่ 3", { exact: true }).setInputFiles({
      name: "replacement.png",
      mimeType: "image/png",
      buffer: Buffer.from("fixture"),
    });
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
