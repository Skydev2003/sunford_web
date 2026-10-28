import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
let bundle: string;
let css: string;
test.beforeAll(async () => {
  const result = await build({
    stdin: {
      contents: `import React from "react";import{createRoot}from"react-dom/client";import{TrashList}from"./src/features/admin/components/trash-list";import{DocumentEditor}from"./src/features/cms/components/document-editor";import{ProductGalleryEditor}from"./src/features/admin/components/product-gallery-editor";
  const items=Array.from({length:23},(_,i)=>({id:"deleted-"+i,kind:i===22?"page":"product",title:i===0?"สินค้าสำหรับกู้คืน "+"ชื่อยาว".repeat(20):"ข้อมูลที่ลบ "+i,deletedAt:"2026-10-28T00:00:00.000Z",updatedAt:"2026-10-28T00:00:00.001Z",category:"food"}));window.__trash=items;
  function Harness(){const[rows,setRows]=React.useState(items);const[images,setImages]=React.useState(["/images/products/wps10ks.png","/images/products/rls1100.png"]);const[primary,setPrimary]=React.useState(images[0]);React.useEffect(()=>{const refresh=()=>setRows([...window.__trash]);window.addEventListener("refresh",refresh);return()=>window.removeEventListener("refresh",refresh)},[]);const screen=new URLSearchParams(location.search).get("screen");return screen==="category"?<DocumentEditor id="category:food" kind="category" title="หมวดหมู่สำหรับทดสอบ" data={{label:"หมวดหมู่สำหรับทดสอบ",english:"Test category"}} fields={[{key:"label",label:"ชื่อหมวดหมู่ภาษาไทย"},{key:"english",label:"ชื่อหมวดหมู่ภาษาอังกฤษ"}]} version="2026-10-28T00:00:00.001Z" categories={[{id:"food",label:"อาหาร"},{id:"accessories",label:"อุปกรณ์เสริม"}]}/>:screen==="gallery"?<ProductGalleryEditor images={images} primaryImage={primary} disabled={false} onChange={setImages} onPrimary={setPrimary} onBusy={()=>{}} onUploaded={()=>{}}/>:<TrashList items={rows} categories={[{id:"food",label:"อาหาร"},{id:"accessories",label:"อุปกรณ์เสริม"}]}/>};createRoot(document.getElementById("root")).render(<Harness/>);`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: {
      "process.env.NODE_ENV": '"production"',
      "process.env.NEXT_PUBLIC_SUPABASE_URL": '""',
    },
    plugins: [
      {
        name: "safety-fixture",
        setup(builder) {
          builder.onResolve(
            {
              filter:
                /^(next\/(link|image|navigation)|\.\.\/server\/(restore-actions|media-actions|actions)|@\/features\/admin\/server\/media-actions)$/,
            },
            ({ path }) => ({ path, namespace: "fixture" }),
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            loader: "js",
            resolveDir: process.cwd(),
            contents:
              path === "next/link"
                ? 'import React from"react";export default function Link(props){return React.createElement("a",props)}'
                : path === "next/image"
                  ? 'import React from"react";export default function Image({fill,...props}){return React.createElement("img",{...props,style:fill?{width:"100%",height:"100%",objectFit:"contain"}:props.style})}'
                  : path === "next/navigation"
                    ? 'export const useRouter=()=>({refresh:()=>window.dispatchEvent(new Event("refresh"))});'
                    : path.endsWith("restore-actions")
                      ? "export async function restoreItemAction(input){(window.__restoreCalls??=[]).push(input);if(window.__restoreError)return {error:window.__restoreError};window.__trash=window.__trash.filter(row=>row.id!==input.id);return{success:true}}"
                      : path.endsWith("/actions")
                        ? 'export async function saveDocumentAction(){return{}};export async function deleteDocumentAction(_,form){(window.__deleteCalls??=[]).push(Object.fromEntries(form));return{error:"Writes disabled in fixture"}}'
                        : 'export async function uploadProductImage(){throw Error("Writes disabled in fixture")};',
          }));
        },
      },
    ],
  });
  bundle = result.outputFiles[0].text;
  css = (
    await Promise.all(
      ["base", "admin", "cms-admin"].map((name) => readFile(`src/styles/${name}.css`, "utf8")),
    )
  ).join("\n");
});
async function open(page: Page, screen = "trash") {
  await page.route("**/__safety_fixture*", (route) =>
    route.fulfill({
      contentType: "text/html;charset=utf-8",
      body: `<!doctype html><html lang="th"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><main id="root" class="admin-app admin-main"></main><script>${bundle.replaceAll("</script", "<\\/script")}</script></body></html>`,
    }),
  );
  await page.goto(`/__safety_fixture?screen=${screen}`);
}
test("trash confirmation cancels safely and restores only the selected version", async ({
  page,
}) => {
  await open(page);
  await expect(page.locator(".admin-trash-list li")).toHaveCount(20);
  await page.locator(".admin-trash-list li").first().getByRole("button").click();
  const dialog = page.getByRole("dialog", { name: "ยืนยันกู้คืนข้อมูล" });
  await expect(dialog).toContainText("ยังไม่แสดงบนหน้าเว็บ");
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => "__restoreCalls" in window)).toBe(false);
  await page.locator(".admin-trash-list li").first().getByRole("button").click();
  await dialog.getByRole("combobox").selectOption("accessories");
  await dialog.getByRole("button", { name: "ยืนยันกู้คืน", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("เรียบร้อยแล้ว");
  const calls = await page.evaluate(
    () => (window as unknown as { __restoreCalls: unknown[] }).__restoreCalls,
  );
  expect(calls).toEqual([
    {
      id: "deleted-0",
      kind: "product",
      category: "accessories",
      updatedAt: "2026-10-28T00:00:00.001Z",
    },
  ]);
  await expect(page.locator(".admin-trash-list li").first()).toContainText("ข้อมูลที่ลบ 1");
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  await expect(page.locator(".admin-trash-list li")).toHaveCount(2);
  await page.getByRole("searchbox", { name: "ค้นหาในถังขยะ" }).fill("ข้อมูลที่ลบ 22");
  await expect(page.locator(".admin-trash-list li")).toHaveCount(1);
});
test("restore errors retain the selection and narrow screens keep actions visible", async ({
  page,
}) => {
  await open(page);
  await page.setViewportSize({ width: 320, height: 850 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator(".admin-trash-list li").first().getByRole("button").click();
  await page.evaluate(() => {
    (window as unknown as { __restoreError: string }).__restoreError =
      "ข้อมูลในถังขยะเปลี่ยนไปแล้ว";
  });
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "ยืนยันกู้คืน", exact: true }).click();
  await expect(dialog.getByRole("alert")).toContainText("เปลี่ยนไปแล้ว");
  await expect(dialog).toBeVisible();
  await expect(page.locator(".admin-trash-list li")).toHaveCount(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
test("category deletion has a separate danger area and a confirmation modal", async ({ page }) => {
  await open(page, "category");
  const remove = page.getByRole("button", { name: "ลบรายการนี้", exact: true });
  expect(await remove.evaluate((element) => getComputedStyle(element).color)).toBe(
    "rgb(161, 27, 35)",
  );
  await remove.click();
  const dialog = page.getByRole("dialog", { name: "ยืนยันลบหมวดหมู่" });
  await expect(dialog).toContainText("หมวดหมู่สำหรับทดสอบ");
  await dialog.getByRole("button", { name: "ยกเลิก", exact: true }).click();
  expect(await page.evaluate(() => "__deleteCalls" in window)).toBe(false);
  await remove.click();
  await dialog.getByRole("combobox").selectOption("accessories");
  await dialog.getByRole("button", { name: "ยืนยันการลบ", exact: true }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Writes disabled in fixture");
  expect(
    await page.evaluate(
      () => (window as unknown as { __deleteCalls: Record<string, string>[] }).__deleteCalls[0],
    ),
  ).toMatchObject({
    id: "category:food",
    kind: "category",
    replacement: "accessories",
    version: "2026-10-28T00:00:00.001Z",
  });
});
test("gallery removal requires confirmation and cancellation retains the image", async ({
  page,
}) => {
  await open(page, "gallery");
  await page.getByRole("button", { name: "นำรูปที่ 1 ออก", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "ยืนยันนำรูปออกจากแกลเลอรี" });
  await expect(dialog).toContainText("รูปหลักจะเปลี่ยน");
  await dialog.getByRole("button", { name: "ยกเลิก", exact: true }).click();
  await expect(page.locator(".admin-gallery-card")).toHaveCount(2);
  await page.getByRole("button", { name: "นำรูปที่ 1 ออก", exact: true }).click();
  await dialog.getByRole("button", { name: "ยืนยันนำรูปออก", exact: true }).click();
  await expect(page.locator(".admin-gallery-card")).toHaveCount(1);
  await expect(page.locator(".admin-gallery-card")).toContainText("รูปหลัก");
});
test("trash and audit require an administrator session", async ({ page }) => {
  for (const path of ["/admin/trash", "/admin/audit"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
});
