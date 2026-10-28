import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";
import type { AdminProduct } from "../../src/features/admin/types";

let bundle: string;
let css: string;
const products: AdminProduct[] = Array.from({ length: 45 }, (_, index) => ({
  id: `fixture-${index + 1}`,
  slug: `fixture-${index + 1}`,
  name:
    index === 0
      ? `เครื่องชั่งน้ำหนักสำหรับโรงงาน ${"long-product-name-".repeat(12)}`
      : `สินค้า ${index + 1}`,
  category: index < 40 ? "food" : "pos",
  subtitle: "Test subtitle",
  description: "Test description",
  image: "",
  capacity: "10 kg",
  readability: "1 g",
  connection: "USB",
  badge: null,
  featured: false,
  published: index < 40,
  sortOrder: index,
  updatedAt: "2026-10-27T00:00:00.000Z",
}));

test.beforeAll(async () => {
  const result = await build({
    stdin: {
      contents: `import React from "react";
        import {createRoot} from "react-dom/client";
        import {AdminShell} from "./src/features/admin/components/admin-shell";
        import {AdminProductList} from "./src/features/admin/components/product-list";
        import {AdminDetailLink} from "./src/features/admin/components/admin-detail-link";
        import {ProductForm} from "./src/features/admin/components/product-form";
        const patternLinks=<><AdminDetailLink href="/admin/content/category%3Anew-fixture" kind="content" recordId="category:new-fixture" detailTitle="เพิ่มหมวดหมู่">เพิ่มหมวดหมู่แบบด่วน</AdminDetailLink><AdminDetailLink href="/admin/content/spotlight" kind="content" recordId="spotlight" detailTitle="ข้อความสินค้าเด่น">ข้อความสินค้าเด่น</AdminDetailLink><AdminDetailLink href="/admin/content/page%3Aarticle-fixture" kind="content" recordId="page:article-fixture" detailTitle="บทความ">เขียนบทความ</AdminDetailLink><AdminDetailLink href="/admin/content/hero" kind="content" recordId="hero" detailTitle="แบนเนอร์">แก้ไขแบนเนอร์</AdminDetailLink></>;
        window.__adminProducts=${JSON.stringify(products)};
        window.__detailEditors={"category:new-fixture":{id:"category:new-fixture",kind:"category",title:"เพิ่มหมวดหมู่",data:{label:"",english:""},fields:[{key:"label",label:"ชื่อหมวดหมู่ภาษาไทย"},{key:"english",label:"ชื่อหมวดหมู่ภาษาอังกฤษ"}],version:"",categories:[]},spotlight:{id:"spotlight",kind:"settings",title:"ข้อความสินค้าเด่น",data:{title:"หัวข้อเดิม",accent:"คำเน้น",description:"คำอธิบาย",primaryLabel:"ดูเพิ่มเติม",secondaryLabel:"ติดต่อ",secondaryHref:"#contact"},fields:[{key:"title",label:"หัวข้อ"},{key:"accent",label:"คำเน้น"},{key:"description",label:"คำอธิบาย"},{key:"primaryLabel",label:"ปุ่มหลัก"},{key:"secondaryLabel",label:"ปุ่มรอง"},{key:"secondaryHref",label:"ปลายทาง"}],version:"",categories:[]}};
        function Harness(){const [rows,setRows]=React.useState(window.__adminProducts);React.useEffect(()=>{const refresh=()=>setRows([...window.__adminProducts]);window.addEventListener("admin-refresh",refresh);return()=>window.removeEventListener("admin-refresh",refresh)},[]);return <AdminShell email="admin@example.test">{patternLinks}{new URLSearchParams(window.location.search).has("standalone")?<ProductForm product={rows[1]}/>:<><AdminDetailLink href="/admin/content/category%3Afood" kind="content" recordId="category:food" detailTitle="หมวดหมู่ทดสอบ">แก้ไขหมวดหมู่ทดสอบ</AdminDetailLink><AdminProductList categoryId={new URLSearchParams(window.location.search).get("category") ?? undefined} products={rows} /></>}</AdminShell>}
        createRoot(document.getElementById("root")).render(<Harness/>);`,
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
      "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(
        process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      ),
    },
    plugins: [
      {
        name: "admin-list-fixture",
        setup(builder) {
          builder.onResolve(
            {
              filter:
                /^(next\/(link|image|navigation)|\.\.\/server\/(product-actions|product-table-actions|auth-actions|detail-actions|media-actions|actions)|@\/features\/admin\/server\/media-actions)$/,
            },
            ({ path }) => ({ path, namespace: "fixture" }),
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            contents:
              path === "next/link"
                ? 'import React from "react";export default function Link(props){return React.createElement("a",props)}'
                : path === "next/image"
                  ? 'import React from "react";export default function Image(props){return React.createElement("img",props)}'
                  : path === "next/navigation"
                    ? 'export const useRouter=()=>({refresh(){window.dispatchEvent(new Event("admin-refresh"))}});export const usePathname=()=>"/admin/products";'
                    : path.endsWith("product-table-actions")
                      ? `export async function manageProductsAction(command){(window.__tableCalls??=[]).push(command);if(window.__tableError)return {error:window.__tableError};const chosen=new Set(command.items.map(p=>p.id));let rows=window.__adminProducts;if(command.items.some(p=>rows.find(row=>row.id===p.id)?.updatedAt!==p.updatedAt))return {error:"ข้อมูลเก่า"};window.__adminProducts=rows.flatMap(row=>{if(!chosen.has(row.id))return [row];if(command.type==="delete")return [];const changes=command.type==="update"?command.changes:command.type==="hide"?{published:false}:command.type==="publish"?{published:true}:command.type==="category"?{category:command.categoryId}:{sortOrder:command.items.findIndex(p=>p.id===row.id)};return [{...row,...changes,updatedAt:new Date(Math.max(Date.now(),Date.parse(row.updatedAt)+1)).toISOString()}]});return {success:true}}`
                      : path.endsWith("detail-actions")
                        ? `const products=${JSON.stringify(products)};export async function loadAdminDetail(kind,id){await new Promise(resolve=>setTimeout(resolve,window.__loadDelays?.[id]??0));if(window.__loadFailure)return {error:"โหลดข้อมูลไม่สำเร็จ"};if(kind==="content"&&window.__detailEditors?.[id])return{kind,editor:window.__detailEditors[id]};return kind==="product"?{kind,product:(window.__adminProducts??products).find(p=>p.id===id)}:{kind,editor:{id,kind:"category",title:"หมวดหมู่ทดสอบ",data:{label:"หมวดหมู่ทดสอบ",english:"Test category"},fields:[{key:"label",label:"ชื่อหมวดหมู่ภาษาไทย"},{key:"english",label:"ชื่อหมวดหมู่ภาษาอังกฤษ"}],version:"",categories:[]}};}`
                        : path.endsWith("media-actions")
                          ? 'export async function uploadProductImage(){return {error:"Uploads disabled in fixture"}};export async function discardProductImage(){}'
                          : path.endsWith("product-actions")
                            ? 'export async function saveProductAction(_,form){window.__adminSaved=Object.fromEntries(form);return window.__saveError?{error:window.__saveError}:{success:true}};export async function deleteProductAction(){throw new Error("Writes disabled in fixture")}'
                            : path.endsWith("/actions")
                              ? 'export async function saveDocumentAction(_,form){window.__adminSaved=Object.fromEntries(form);return {success:true}};export async function deleteDocumentAction(){return {error:"Writes disabled in fixture"}}'
                              : "export async function logoutAction(){}",
            loader: "js",
            resolveDir: process.cwd(),
          }));
        },
      },
    ],
  });
  bundle = result.outputFiles[0].text;
  css = (
    await Promise.all(
      ["base", "admin", "cms-admin", "admin-workspace"].map((name) =>
        readFile(`src/styles/${name}.css`, "utf8"),
      ),
    )
  ).join("\n");
});

async function open(page: Page, category?: string, expectedRows = 20) {
  await page.route("**/__admin_list_fixture*", (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html lang="th"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div class="admin-app" id="root"></div><script>${bundle.replaceAll("</script", "<\\/script")}</script></body></html>`,
    }),
  );
  await page.goto(`/__admin_list_fixture${category ? `?category=${category}` : ""}`);
  await expect(page.locator(".admin-product-table tbody tr")).toHaveCount(expectedRows);
}

test("category quick creation uses a compact modal and protects unsaved edits", async ({
  page,
}, testInfo) => {
  await open(page);
  const original = page.url();
  await page.getByRole("link", { name: "เพิ่มหมวดหมู่แบบด่วน", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "เพิ่มหมวดหมู่", exact: true });
  await expect(modal.getByRole("textbox")).toHaveCount(2);
  await expect(modal.getByRole("button", { name: "ลบรายการนี้", exact: true })).toHaveCount(0);
  await expect(page.locator(".admin-detail-panel")).toHaveCount(0);
  await modal
    .getByRole("textbox", { name: "ชื่อหมวดหมู่ภาษาไทย", exact: true })
    .fill("หมวดหมู่ใหม่");
  await modal
    .getByRole("textbox", { name: "ชื่อหมวดหมู่ภาษาอังกฤษ", exact: true })
    .fill("New category");
  await expect(modal.getByRole("status")).toHaveText("มีการแก้ไขที่ยังไม่ได้บันทึก");
  await expect(page.locator(".admin-unsaved-bar")).toHaveCount(0);
  await page.keyboard.press("Escape");
  const warning = page.getByRole("dialog", { name: "ยังไม่ได้บันทึกการแก้ไข", exact: true });
  await warning.getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
  await expect(
    modal.getByRole("textbox", { name: "ชื่อหมวดหมู่ภาษาไทย", exact: true }),
  ).toHaveValue("หมวดหมู่ใหม่");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 720 });
    const bounds = await modal.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await expect(
      modal.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }),
    ).toBeInViewport();
  }
  await page.screenshot({ path: testInfo.outputPath("category-modal-mobile.png") });
  await modal.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
  await expect(modal).not.toBeVisible();
  expect(
    await page.evaluate(() => (window as unknown as { __adminSaved: object }).__adminSaved),
  ).toMatchObject({
    id: "category:new-fixture",
    detail: "1",
    data: JSON.stringify({ label: "หมวดหมู่ใหม่", english: "New category" }),
  });
  await expect(page).toHaveURL(original);
});

test("the product card drawer preserves technical data and offers a guarded full-page editor", async ({
  page,
}, testInfo) => {
  await open(page);
  await page.getByRole("link", { name: "แก้ไข สินค้า 2", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await expect(detail.getByRole("textbox", { name: "URL สินค้า", exact: false })).toHaveCount(0);
  await expect(detail.getByRole("textbox", { name: "พิกัดน้ำหนัก", exact: false })).toHaveCount(0);
  await expect(
    detail.getByRole("heading", { name: "รูปภาพทั้งหมดของสินค้า", exact: true }),
  ).toHaveCount(0);
  await expect(detail.getByRole("checkbox")).toHaveCount(2);
  await detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false }).fill("แก้การ์ดสินค้า");
  await page
    .getByRole("region", { name: "การแก้ไขที่ยังไม่บันทึก", exact: true })
    .getByRole("button")
    .click();
  await expect(detail).toHaveCount(0);
  expect(
    await page.evaluate(() => (window as unknown as { __adminSaved: object }).__adminSaved),
  ).toMatchObject({
    id: "fixture-2",
    name: "แก้การ์ดสินค้า",
    slug: "fixture-2",
    capacity: "10 kg",
    readability: "1 g",
    connection: "USB",
    sortOrder: "1",
    gallery: "[]",
    detail: "1",
  });
  await page.getByRole("link", { name: "แก้ไข สินค้า 2", exact: true }).click();
  await detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false }).fill("ยังไม่บันทึก");
  await detail.getByRole("link", { name: "แก้ไขรายละเอียดทั้งหมด", exact: false }).click();
  await page
    .getByRole("dialog", { name: "ยังไม่ได้บันทึกการแก้ไข", exact: true })
    .getByRole("button", { name: "แก้ไขต่อ", exact: true })
    .click();
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "ยังไม่บันทึก",
  );
  await page.screenshot({ path: testInfo.outputPath("product-card-drawer.png") });
});

test("short text settings use a drawer and complex editors navigate to their full pages", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("link", { name: "ข้อความสินค้าเด่น", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await expect(detail.getByRole("textbox")).toHaveCount(6);
  await expect(detail.getByRole("textbox", { name: "หัวข้อ", exact: true })).toHaveValue(
    "หัวข้อเดิม",
  );
  await detail.getByRole("button", { name: "ปิดแผงรายละเอียด", exact: true }).click();
  for (const [name, path] of [
    ["เขียนบทความ", "/admin/content/page%3Aarticle-fixture"],
    ["แก้ไขแบนเนอร์", "/admin/content/hero"],
  ]) {
    await expect(page.getByRole("link", { name, exact: true })).not.toHaveAttribute(
      "data-admin-detail",
    );
    await page.route(`**${path}`, (route) =>
      route.fulfill({ contentType: "text/html;charset=utf-8", body: "<h1>หน้าแก้ไขเต็ม</h1>" }),
    );
    await page.getByRole("link", { name, exact: true }).click();
    await expect(page.getByRole("heading", { name: "หน้าแก้ไขเต็ม", exact: true })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(path);
    await open(page);
  }
  await expect(
    page.getByRole("link", { name: "เพิ่มสินค้าใหม่", exact: true }),
  ).not.toHaveAttribute("data-admin-detail");
});

test("product draft preview and counters follow unsaved form edits inside the drawer", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("link", { name: "แก้ไข สินค้า 2", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await detail.getByRole("button", { name: "ดูตัวอย่างฉบับร่าง", exact: true }).click();
  const name = detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false });
  await name.fill("หัวข้อสินค้าสำหรับตัวอย่าง");
  const preview = page.frameLocator(".admin-detail-panel .admin-draft-preview iframe");
  await expect(preview.locator("h1")).toHaveText("หัวข้อสินค้าสำหรับตัวอย่าง");
  await expect(name.locator("..").locator(".admin-character-count")).toContainText("/ 300");
  await name.fill("A".repeat(61));
  await expect(name.locator("..").locator(".admin-character-count")).toContainText(
    "ยาวกว่าที่แนะนำ",
  );
  await detail
    .getByRole("textbox", { name: "รายละเอียดสินค้า", exact: false })
    .fill("คำอธิบาย SEO ที่ยังไม่บันทึก");
  await expect(preview.locator("section").last()).toContainText("คำอธิบาย SEO ที่ยังไม่บันทึก");
  expect(await page.evaluate(() => "__adminSaved" in window)).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("full-page save errors preserve the form, counter and preview together", async ({ page }) => {
  await open(page);
  await page.goto("/__admin_list_fixture?standalone=1");
  const name = page.getByRole("textbox", { name: "ชื่อสินค้า", exact: false });
  await name.fill("แก้ไขชื่อแล้วยังบันทึกไม่สำเร็จ");
  await page.getByRole("button", { name: "ดูตัวอย่างฉบับร่าง", exact: true }).click();
  await page.evaluate(() => {
    (window as unknown as { __saveError: string }).__saveError = "ข้อมูลถูกแก้ไขจากอีกหน้า";
  });
  await page.getByRole("button", { name: "บันทึกสินค้า", exact: true }).first().click();
  await expect(page.getByRole("alert")).toContainText("ข้อมูลถูกแก้ไขจากอีกหน้า");
  await expect(name).toHaveValue("แก้ไขชื่อแล้วยังบันทึกไม่สำเร็จ");
  await expect(name.locator("..").locator(".admin-character-count")).toContainText(
    String("แก้ไขชื่อแล้วยังบันทึกไม่สำเร็จ".length),
  );
  await expect(page.frameLocator(".admin-draft-preview iframe").locator("h1")).toHaveText(
    "แก้ไขชื่อแล้วยังบันทึกไม่สำเร็จ",
  );
});

test("category links scope counts, search, status and pagination and survive reloads", async ({
  page,
}) => {
  await open(page, "food");
  await expect(page.locator(".admin-category-filter")).toContainText("หมวดหมู่: เครื่องชั่งอาหาร");
  await expect(page.locator(".admin-stats strong")).toHaveText(["40", "40", "00"]);
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("แสดง 21–40 จาก 40 รายการ");
  await expect(page.getByRole("button", { name: "ถัดไป", exact: true })).toBeDisabled();
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("fixture-45");
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("แสดง 0–0 จาก 0 รายการ (ทั้งหมด 40 รายการ)");
  await page.reload();
  await expect(page.locator("tbody tr")).toHaveCount(20);
  await expect(page.locator(".admin-category-filter")).toContainText("เครื่องชั่งอาหาร");
  await page.getByRole("button", { name: "ฉบับร่าง", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
  await open(page, "pos", 5);
  await expect(page.locator(".admin-stats strong")).toHaveText(["05", "00", "05"]);
  await expect(page.locator(".admin-category-filter a")).toHaveAttribute("href", "/admin/products");
  await page.getByRole("button", { name: "เผยแพร่แล้ว", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(0);
});

test("empty categories remain accessible and unknown filters show the full catalogue", async ({
  page,
}) => {
  await open(page, "laboratory", 0);
  await expect(page.getByRole("heading", { name: "ยังไม่มีสินค้าในหมวดหมู่นี้" })).toBeVisible();
  await expect(page.locator(".admin-stats strong")).toHaveText(["00", "00", "00"]);
  await expect(page.getByRole("button", { name: "ถัดไป", exact: true })).toBeDisabled();
  await open(page, "unknown-category");
  await expect(page.locator(".admin-category-filter")).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("แสดง 1–20 จาก 45 รายการ");
});

test("product pages show distinct rows and stop at both boundaries", async ({ page }) => {
  await open(page);
  const pagination = page.getByRole("navigation", { name: "แบ่งหน้ารายการสินค้า" });
  await expect(pagination.getByRole("button", { name: "ก่อนหน้า" })).toBeDisabled();
  await expect(page.getByRole("status")).toHaveText("แสดง 1–20 จาก 45 รายการ");
  await pagination.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.getByRole("status")).toHaveText("แสดง 21–40 จาก 45 รายการ");
  await expect(page.locator("tbody tr").first()).toContainText("/fixture-21");
  await pagination.getByRole("button", { name: "ถัดไป" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.getByRole("status")).toHaveText("แสดง 41–45 จาก 45 รายการ");
  await expect(pagination.getByRole("button", { name: "ถัดไป" })).toBeDisabled();
  await pagination.getByRole("button", { name: "ก่อนหน้า" }).click();
  await expect(page.getByRole("status")).toHaveText("แสดง 21–40 จาก 45 รายการ");
});

test("search and status filters reset pagination and handle empty results", async ({ page }) => {
  await open(page);
  const next = page.getByRole("button", { name: "ถัดไป", exact: true });
  await next.click();
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("fixture-45");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("แสดง 1–1 จาก 1 รายการ (ทั้งหมด 45 รายการ)");
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("");
  await next.click();
  await page.getByRole("button", { name: "ฉบับร่าง", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await expect(page.locator(".admin-pagination")).toContainText("หน้า 1 จาก 1");
  await page.getByRole("button", { name: "เผยแพร่แล้ว", exact: true }).click();
  await next.click();
  await expect(next).toBeDisabled();
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("no-matching-product");
  await expect(page.getByRole("heading", { name: "ไม่พบสินค้าที่ค้นหา" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("แสดง 0–0 จาก 0 รายการ (ทั้งหมด 45 รายการ)");
  await expect(next).toBeDisabled();
});

test("long product names keep status and actions inside desktop and narrow layouts", async ({
  page,
}) => {
  await open(page);
  for (const width of [320, 390, 650, 768, 850, 900, 982, 1200, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.locator(".admin-list-panel").evaluate((panel) => {
      const bounds = panel.getBoundingClientRect();
      const scroll = panel.querySelector(".admin-table-scroll")!;
      return {
        overflow: scroll.scrollWidth - scroll.clientWidth,
        outside: [
          ...panel.querySelectorAll(".admin-status, .admin-row-actions > *, .admin-pagination > *"),
        ].some((element) => {
          const rect = element.getBoundingClientRect();
          return rect.left < bounds.left || rect.right > bounds.right + 1;
        }),
      };
    });
    expect(layout, `viewport ${width}`).toEqual({ overflow: 0, outside: false });
  }
  await page.screenshot({
    path: test.info().outputPath("admin-products-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: test.info().outputPath("admin-products-mobile.png"),
    fullPage: true,
  });
});

test("detail editing preserves the master search and page after cancel and save", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("fixture-");
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  const originalUrl = page.url();
  await page.getByRole("link", { name: "แก้ไข สินค้า 21", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "สินค้า 21",
  );
  await expect(page.locator(".admin-workspace")).toBeVisible();
  await expect(detail).toHaveCSS("transform", "none");
  const split = await detail.evaluate((panel) => ({
    masterRight: document.querySelector(".admin-workspace")!.getBoundingClientRect().right,
    detailLeft: panel.getBoundingClientRect().left,
    detailRight: panel.getBoundingClientRect().right,
    viewport: innerWidth,
  }));
  expect(split.masterRight).toBeLessThanOrEqual(split.detailLeft + 1);
  expect(split.detailRight).toBeLessThanOrEqual(split.viewport);
  await page.screenshot({ path: test.info().outputPath("admin-master-detail-desktop.png") });
  await expect(page).toHaveURL(originalUrl);
  await detail.getByRole("button", { name: "ปิดแผงรายละเอียด" }).click();
  await expect(detail).toHaveCount(0);
  await expect(page.getByRole("link", { name: "แก้ไข สินค้า 21", exact: true })).toBeFocused();
  await expect(page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" })).toHaveValue("fixture-");
  await expect(page.getByRole("status")).toHaveText("แสดง 21–40 จาก 45 รายการ");
  await page.getByRole("link", { name: "แก้ไข สินค้า 22", exact: true }).click();
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "สินค้า 22",
  );
  await detail
    .getByRole("textbox", { name: "ชื่อสินค้า", exact: false })
    .fill("แก้ไขในแผงรายละเอียด");
  await detail.getByRole("button", { name: "บันทึกสินค้า", exact: true }).first().click();
  await expect(detail).toHaveCount(0);
  const saved = await page.evaluate(
    () => (window as unknown as { __adminSaved: Record<string, string> }).__adminSaved,
  );
  expect(saved).toMatchObject({ id: "fixture-22", detail: "1", name: "แก้ไขในแผงรายละเอียด" });
  await expect(page.getByRole("status")).toHaveText("แสดง 21–40 จาก 45 รายการ");
  await expect(page).toHaveURL(originalUrl);
});

test("save errors preserve entered values and category editors save without leaving the master", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  const originalUrl = page.url();
  await page.getByRole("link", { name: "แก้ไข สินค้า 2", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await detail
    .getByRole("textbox", { name: "ชื่อสินค้า", exact: false })
    .fill("ข้อมูลที่ยังต้องแก้");
  await page.evaluate(() => {
    (window as unknown as { __saveError: string }).__saveError = "ข้อมูลถูกแก้ไขจากอีกหน้า";
  });
  await detail.getByRole("button", { name: "บันทึกสินค้า", exact: true }).first().click();
  await expect(detail.getByRole("alert")).toContainText("ข้อมูลถูกแก้ไขจากอีกหน้า");
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "ข้อมูลที่ยังต้องแก้",
  );
  await detail.getByRole("button", { name: "ปิดแผงรายละเอียด" }).click();
  await page
    .getByRole("dialog", { name: "ยังไม่ได้บันทึกการแก้ไข" })
    .getByRole("button", { name: "ทิ้งการเปลี่ยนแปลง", exact: true })
    .click();
  await page.getByRole("link", { name: "แก้ไขหมวดหมู่ทดสอบ", exact: true }).click();
  const modal = page.getByRole("dialog", { name: "หมวดหมู่ทดสอบ", exact: true });
  await expect(
    modal.getByRole("textbox", { name: "ชื่อหมวดหมู่ภาษาไทย", exact: true }),
  ).toHaveValue("หมวดหมู่ทดสอบ");
  await modal
    .getByRole("textbox", { name: "ชื่อหมวดหมู่ภาษาไทย", exact: true })
    .fill("ชื่อหมวดที่แก้ไข");
  await modal.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง", exact: true }).click();
  await expect(modal).not.toBeVisible();
  const saved = await page.evaluate(
    () => (window as unknown as { __adminSaved: Record<string, string> }).__adminSaved,
  );
  expect(saved).toMatchObject({ id: "category:food", detail: "1" });
  expect(JSON.parse(saved.data).label).toBe("ชื่อหมวดที่แก้ไข");
  await expect(page).toHaveURL(originalUrl);
});

test("switching records protects unsaved edits and ignores stale detail responses", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await page.getByRole("link", { name: "แก้ไข สินค้า 21", exact: true }).click();
  await detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false }).fill("ยังไม่ได้บันทึก");
  await page.getByRole("link", { name: "แก้ไข สินค้า 22", exact: true }).click();
  await page
    .getByRole("dialog", { name: "ยังไม่ได้บันทึกการแก้ไข" })
    .getByRole("button", { name: "แก้ไขต่อ", exact: true })
    .click();
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "ยังไม่ได้บันทึก",
  );
  await page.getByRole("link", { name: "แก้ไข สินค้า 22", exact: true }).click();
  await page
    .getByRole("dialog", { name: "ยังไม่ได้บันทึกการแก้ไข" })
    .getByRole("button", { name: "ทิ้งการเปลี่ยนแปลง", exact: true })
    .click();
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "สินค้า 22",
  );
  await detail.getByRole("button", { name: "ปิดแผงรายละเอียด" }).click();
  await page.evaluate(() => {
    (window as unknown as { __loadDelays: Record<string, number> }).__loadDelays = {
      "fixture-21": 800,
    };
  });
  await page.getByRole("link", { name: "แก้ไข สินค้า 21", exact: true }).click();
  await page.getByRole("link", { name: "แก้ไข สินค้า 22", exact: true }).click();
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "สินค้า 22",
  );
  await expect
    .poll(async () => {
      await page.waitForTimeout(850);
      return detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false }).inputValue();
    })
    .toBe("สินค้า 22");
});

test("detail panel shows errors and stays usable on narrow screens", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  await page.evaluate(() => {
    (window as unknown as { __loadFailure: boolean }).__loadFailure = true;
  });
  await page.getByRole("link", { name: "แก้ไข สินค้า 2", exact: true }).click();
  const detail = page.locator(".admin-detail-panel");
  await expect(detail.getByRole("alert")).toContainText("โหลดข้อมูลไม่สำเร็จ");
  await detail.getByRole("button", { name: "ปิดแผงรายละเอียด" }).click();
  await expect(page.locator(".admin-workspace")).toBeVisible();
  await page.evaluate(() => {
    (window as unknown as { __loadFailure: boolean }).__loadFailure = false;
  });
  await page.getByRole("link", { name: "แก้ไข สินค้า 2", exact: true }).click();
  await expect(detail.getByRole("textbox", { name: "ชื่อสินค้า", exact: false })).toHaveValue(
    "สินค้า 2",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await detail.getByRole("button", { name: "ปิดแผงรายละเอียด" }).click();
  await expect(page.locator(".admin-workspace")).toBeVisible();
  await page.getByRole("button", { name: "เปิดเมนูแอดมิน" }).click();
  const navigation = page.getByRole("dialog", { name: "เมนูแอดมิน" });
  await expect(navigation.getByRole("link", { name: "หมวดหมู่สินค้า", exact: true })).toBeVisible();
  await navigation.getByRole("button", { name: "ปิดเมนูแอดมิน" }).click();
});

test("latest edits sort first and quick switches and inline order save fresh versions", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("fixture-2");
  const publish = page.getByRole("button", { name: "เผยแพร่ สินค้า 2", exact: true });
  await publish.click();
  await expect(publish).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator(".admin-stats strong")).toHaveText(["45", "39", "06"]);
  const featured = page.getByRole("button", { name: "สินค้าแนะนำ สินค้า 2", exact: true });
  await featured.click();
  await expect(featured).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("spinbutton", { name: "ลำดับ สินค้า 2", exact: true }).fill("7");
  await page.getByRole("button", { name: "บันทึกลำดับ สินค้า 2", exact: true }).click();
  await expect(page.getByRole("spinbutton", { name: "ลำดับ สินค้า 2", exact: true })).toHaveValue(
    "7",
  );
  await expect(page.locator("tbody tr").first()).toContainText("/fixture-2");
  await page.getByRole("combobox", { name: "เรียงลำดับสินค้า" }).selectOption("order");
  await expect(page.locator("tbody tr").first()).toContainText("/fixture-2");
  const calls = await page.evaluate(
    () =>
      (window as unknown as { __tableCalls: { items: { updatedAt: string }[] }[] }).__tableCalls,
  );
  expect(calls).toHaveLength(3);
  expect(new Set(calls.map((call) => call.items[0].updatedAt)).size).toBe(3);
});

test("selection spans pages, selects filtered results and clears when filters change", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("checkbox", { name: "เลือกสินค้าทั้งหมดในหน้านี้" }).check();
  const bar = page.getByRole("region", { name: "คำสั่งสำหรับสินค้าที่เลือก" });
  await expect(bar).toContainText("เลือก 20 รายการ");
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  await page.getByRole("checkbox", { name: "เลือก สินค้า 21", exact: true }).check();
  await expect(bar).toContainText("เลือก 21 รายการ");
  await bar.getByRole("button", { name: "เลือกทั้งหมด 45 รายการที่กรองไว้", exact: true }).click();
  await expect(bar).toContainText("เลือก 45 รายการ");
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("fixture-45");
  await expect(bar).toHaveCount(0);
  await page.getByRole("checkbox", { name: "เลือก สินค้า 45", exact: true }).check();
  await page.getByRole("button", { name: "ฉบับร่าง", exact: true }).click();
  await expect(bar).toHaveCount(0);
});

test("bulk hide previews the exact selection and cancellation never writes", async ({ page }) => {
  await open(page);
  await page.getByRole("checkbox", { name: "เลือก สินค้า 2", exact: true }).check();
  await page.getByRole("checkbox", { name: "เลือก สินค้า 3", exact: true }).check();
  await page.getByRole("button", { name: "ซ่อนสินค้า", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "ซ่อนสินค้า 2 รายการ?" });
  await expect(dialog).toContainText("สินค้า 2");
  await expect(dialog).toContainText("สินค้า 3");
  await dialog.getByRole("button", { name: "ยกเลิก", exact: true }).click();
  expect(
    await page.evaluate(
      () => (window as unknown as { __tableCalls?: unknown[] }).__tableCalls?.length ?? 0,
    ),
  ).toBe(0);
  await page.getByRole("button", { name: "ซ่อนสินค้า", exact: true }).click();
  await dialog.getByRole("button", { name: "ยืนยันดำเนินการ", exact: true }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".admin-stats strong")).toHaveText(["45", "38", "07"]);
  await expect(page.getByRole("button", { name: "เผยแพร่ สินค้า 2", exact: true })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByRole("region", { name: "คำสั่งสำหรับสินค้าที่เลือก" })).toHaveCount(0);
});

test("bulk category moves leave the filtered category and deleting the last page clamps pagination", async ({
  page,
}) => {
  await open(page, "food");
  await page.getByRole("checkbox", { name: "เลือก สินค้า 2", exact: true }).check();
  await page.getByRole("button", { name: "เปลี่ยนหมวดหมู่", exact: true }).click();
  const categoryDialog = page.getByRole("dialog", { name: "เปลี่ยนหมวดหมู่ 1 รายการ?" });
  await expect(categoryDialog.getByRole("button", { name: "ยืนยันดำเนินการ" })).toBeDisabled();
  await categoryDialog.getByRole("combobox", { name: "หมวดหมู่ปลายทาง" }).selectOption("pos");
  await categoryDialog.getByRole("button", { name: "ยืนยันดำเนินการ" }).click();
  await expect(page.locator(".admin-stats strong")).toHaveText(["39", "39", "00"]);
  await expect(page.getByRole("checkbox", { name: "เลือก สินค้า 2", exact: true })).toHaveCount(0);
  await open(page);
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  await page.getByRole("checkbox", { name: "เลือกสินค้าทั้งหมดในหน้านี้" }).check();
  await page.getByRole("button", { name: "ลบสินค้า", exact: true }).click();
  await page
    .getByRole("dialog", { name: "ลบสินค้า 5 รายการ?" })
    .getByRole("button", { name: "ยืนยันดำเนินการ" })
    .click();
  await expect(page.getByRole("status").filter({ hasText: "แสดง" })).toHaveText(
    "แสดง 21–40 จาก 40 รายการ",
  );
  await expect(page.locator("tbody tr")).toHaveCount(20);
});

test("drag and keyboard reorder save the complete order and filtered dragging is disabled", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await open(page);
  await page.getByRole("combobox", { name: "เรียงลำดับสินค้า" }).selectOption("order");
  const handle = page.getByRole("button", { name: "ลากเรียง สินค้า 2", exact: true });
  await handle.dragTo(page.getByRole("button", { name: "ลากเรียง สินค้า 4", exact: true }));
  await expect(page.getByRole("spinbutton", { name: "ลำดับ สินค้า 2", exact: true })).toHaveValue(
    "3",
  );
  await handle.focus();
  await handle.press("ArrowUp");
  await expect(page.getByRole("spinbutton", { name: "ลำดับ สินค้า 2", exact: true })).toHaveValue(
    "2",
  );
  const calls = await page.evaluate(
    () =>
      (window as unknown as { __tableCalls: { type: string; items: unknown[] }[] }).__tableCalls,
  );
  expect(calls.every((call) => call.type === "reorder" && call.items.length === 45)).toBe(true);
  await page.getByRole("textbox", { name: "ค้นหาสินค้าในแอดมิน" }).fill("fixture-2");
  await expect(handle).toBeDisabled();
});

test("quick-save failures retain the old state and reload clears selected records", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("checkbox", { name: "เลือก สินค้า 2", exact: true }).check();
  await page.evaluate(() => {
    (window as unknown as { __tableError: string }).__tableError =
      "ข้อมูลสินค้าบางรายการเปลี่ยนไปแล้ว";
  });
  const publish = page.getByRole("button", { name: "เผยแพร่ สินค้า 2", exact: true });
  await publish.click();
  await expect(page.getByRole("alert")).toContainText("ข้อมูลสินค้าบางรายการเปลี่ยนไปแล้ว");
  await expect(publish).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "โหลดใหม่", exact: true }).click();
  await expect(page.getByRole("region", { name: "คำสั่งสำหรับสินค้าที่เลือก" })).toHaveCount(0);
});
