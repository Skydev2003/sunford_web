import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";

let bundle: string;
let css: string;

test.beforeAll(async () => {
  const result = await build({
    stdin: {
      contents: `import React from "react";
        import {createRoot} from "react-dom/client";
        import {AdminShell} from "./src/features/admin/components/admin-shell";
        import HomePage from "./src/app/admin/(protected)/home-images/page";
        import {DocumentEditor} from "./src/features/cms/components/document-editor";
        async function start() {
          const pathname=window.location.pathname;
          const id=decodeURIComponent(pathname.split("/admin/content/")[1] ?? "");
          const content=pathname==="/admin/home-images"
            ? await HomePage({searchParams:Promise.resolve({saved:new URLSearchParams(window.location.search).get("saved")})})
            : id ? <DocumentEditor id={id} kind={id.startsWith("category:")?"category":id.startsWith("page:")?"page":"settings"} title="ตัวอย่างข้อมูล" data={{}} fields={[]} version="" /> : null;
          createRoot(document.getElementById("root")).render(<AdminShell email="admin@example.test">{content}</AdminShell>);
        }
        start();`,
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
        name: "read-only-admin-navigation",
        setup(builder) {
          const mocks: Record<string, string> = {
            "next/link":
              'import React from "react";export default function Link(props){return React.createElement("a",props)}',
            "next/image":
              'import React from "react";export default function Image({fill,priority,...props}){return React.createElement("img",props)}',
            "next/navigation": "export const usePathname=()=>window.location.pathname;",
            "./admin-detail-workspace":
              "export function AdminDetailWorkspace({children}){return children}",
            "@/features/admin/components/admin-detail-workspace":
              'import React from "react";export function AdminDetailLink({kind,recordId,detailTitle,...props}){return React.createElement("a",props)}',
            "../server/auth-actions": "export async function logoutAction(){}",
            "@/features/admin/server/home-images": "export const listHomeImages=async()=>[];",
            "@/features/catalog/server/product-repository": "export const getProducts=async()=>[];",
            "@/features/content/server/content-repository":
              "export const getContentPage=async()=>undefined;",
            "@/features/home/server/home-link-options": "export const homePageOptions=async()=>[];",
            "../server/home-image-actions":
              'export async function saveHomeImageAction(){throw Error("Writes disabled")}',
            "../server/media-actions":
              'export async function uploadProductImage(){throw Error("Writes disabled")};export async function discardProductImage(){}',
            "@/features/admin/server/media-actions":
              'export async function uploadProductImage(){throw Error("Writes disabled")}',
            "../server/actions":
              'export async function saveDocumentAction(){throw Error("Writes disabled")};export async function deleteDocumentAction(){throw Error("Writes disabled")}',
          };
          builder.onResolve({ filter: /.*/ }, ({ path }) =>
            path in mocks ? { path, namespace: "fixture" } : undefined,
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
            contents: mocks[path],
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

async function open(page: Page, path = "/admin/products") {
  await page.route("**/admin/**", (route) =>
    route.fulfill({
      contentType: "text/html; charset=utf-8",
      body: `<!doctype html><html lang="th"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body><div id="root" class="admin-app"></div><script>${bundle.replaceAll("</script", "<\\/script")}</script></body></html>`,
    }),
  );
  await page.goto(path);
  await expect(page.locator(".admin-shell")).toBeVisible();
}

test("groups stay visible and each editor selects only its owning menu", async ({ page }) => {
  await open(page);
  const sidebar = page.locator(".admin-sidebar-desktop");
  await expect(sidebar.locator(".admin-nav-label")).toHaveText([
    "แค็ตตาล็อก",
    "เนื้อหาเว็บไซต์",
    "ตั้งค่าเว็บไซต์",
    "ตรวจสอบและกู้คืน",
  ]);
  await expect(sidebar.locator("nav a")).toHaveCount(10);
  const cases = [
    ["/admin/products/new", "ผลิตภัณฑ์"],
    ["/admin/content/category%3Afood", "หมวดหมู่สินค้า"],
    ["/admin/content/hero", "จัดการหน้าแรก"],
    ["/admin/content/section%3Asupport", "จัดการหน้าแรก"],
    ["/admin/content/page%3Aexample", "หน้าข้อมูลและบทความ"],
    ["/admin/content/navigation", "เมนูนำทาง"],
    ["/admin/content/site", "โลโก้และข้อมูลติดต่อ"],
    ["/admin/content/section%3Afooter", "ส่วนท้ายเว็บไซต์"],
    ["/admin/trash", "ถังขยะ"],
    ["/admin/audit", "ประวัติการแก้ไข"],
  ];
  for (const [path, label] of cases) {
    await page.goto(path);
    await expect(sidebar.locator('[aria-current="page"]')).toHaveText(label);
  }
  await expect(page.locator("main .admin-back")).toHaveCount(0);
  await page.goto("/admin/content/hero");
  await page.getByRole("link", { name: "กลับไปจัดการหน้าแรก" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("จัดการหน้าแรก");
});

test("homepage combines all sections and five image editors in website order", async ({ page }) => {
  await open(page, "/admin/home-images?saved=smart");
  await expect(page.getByRole("status")).toContainText("บันทึกรูปภาพและปลายทางเรียบร้อยแล้ว");
  await expect(page.locator(".admin-home-section-heading h2")).toHaveText([
    "แบนเนอร์หลักและสไลด์",
    "สินค้าเด่นบนพื้นดำ",
    "การ์ดผลิตภัณฑ์หน้าแรก",
    "หัวข้อสินค้าและแถบนำทางหน้าแรก",
    "โซลูชันธุรกิจ",
    "เรื่องราวแบรนด์",
    "หัวข้อข่าวและวิดีโอหน้าแรก",
    "วิดีโอหน้าแรก",
    "บริการและการสนับสนุน",
  ]);
  await expect(page.locator(".admin-home-image-editor")).toHaveCount(5);
  await expect(page.locator('[id="home-spotlight"] .admin-home-image-editor')).toHaveCount(1);
  await expect(page.locator('[id="home-showcase"] .admin-home-image-editor')).toHaveCount(4);
  await expect(page.locator("main a[href='/admin/content/site']")).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "ส่วนต่าง ๆ ของหน้าแรก" })
    .getByRole("link", { name: "บริการและการสนับสนุน" })
    .click();
  await expect(page.locator('[id="home-section:support"]')).toBeInViewport();
  for (const width of [320, 390, 650, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page
    .locator(".admin-workspace")
    .evaluate((element) => element.scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: test.info().outputPath("homepage-desktop.png") });
});

test("mobile drawer supports all menus, escape, backdrop, navigation and resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await open(page);
  const toggle = page.getByRole("button", { name: "เปิดเมนูแอดมิน" });
  const drawer = page.getByRole("dialog", { name: "เมนูแอดมิน" });
  await expect(page.locator(".admin-sidebar-desktop")).toBeHidden();
  await toggle.click();
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("navigation").getByRole("link")).toHaveCount(10);
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await page.screenshot({ path: test.info().outputPath("sidebar-mobile.png") });
  await page.mouse.click(380, 100);
  await expect(drawer).toBeHidden();
  await toggle.click();
  await drawer.getByRole("link", { name: "เมนูนำทาง", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/content\/navigation$/);
  await expect(drawer).toBeHidden();
  await toggle.click();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(drawer).toBeHidden();
  await expect(page.locator('.admin-sidebar-desktop [aria-current="page"]')).toHaveText(
    "เมนูนำทาง",
  );
});

test("live content and settings destinations still require an admin session", async ({ page }) => {
  for (const path of [
    "/admin/home-images",
    "/admin/content",
    "/admin/content/navigation",
    "/admin/content/site",
    "/admin/content/section%3Afooter",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.getByRole("heading", { name: "เข้าสู่พื้นที่แอดมิน" })).toBeVisible();
  }
});
