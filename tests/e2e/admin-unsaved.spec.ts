import { test, expect, type Page } from "@playwright/test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";

let bundle: string;
let css: string;
test.beforeAll(async () => {
  const result = await build({
    stdin: {
      contents: `import React from "react";import{createRoot}from"react-dom/client";import{AdminUnsavedChanges}from"./src/features/admin/components/unsaved-changes";import{DocumentEditor}from"./src/features/cms/components/document-editor";import{HomeImageEditor}from"./src/features/admin/components/home-image-editor";
      function Harness(){const[revision,setRevision]=React.useState({});React.useEffect(()=>{const saved=e=>setRevision(r=>({...r,[e.detail]:String(Date.now())}));window.addEventListener("home-saved",saved);return()=>window.removeEventListener("home-saved",saved)},[]);const home=new URLSearchParams(location.search).has("home");return <div className="admin-shell"><AdminUnsavedChanges><aside className="admin-sidebar"><a href="/__unsaved_fixture?destination=1">เปลี่ยนหน้า</a><a href="#anchor">ไปส่วนอื่น</a><a href="/__unsaved_fixture?new=1" target="_blank">เปิดต่างหาก</a><form onSubmit={e=>{e.preventDefault();window.__logout=true}}><button>ออกจากระบบ</button></form></aside><main className="admin-workspace"><div className="admin-main">{home?["spotlight","showcase1"].map((slot,i)=><HomeImageEditor key={slot} slot={slot} title={"รูปหน้าแรก "+i} description="ทดสอบการแก้ไขหลายฟอร์ม" updatedAt={revision[slot]??"initial"} currentImage="" defaultHref="/" products={[{id:"product1",name:"สินค้า",href:"/product1"}]} pages={[{path:"/about",title:"เกี่ยวกับเรา"}]}/>):<DocumentEditor id="category:fixture" kind="category" title="หมวดหมู่ทดสอบ" version="initial" data={{label:"หมวดเดิม",english:"Original",items:[{title:"หนึ่ง"},{title:"สอง"}]}} fields={[{key:"label",label:"ชื่อไทย"},{key:"english",label:"ชื่ออังกฤษ"},{key:"items",label:"รายการ",type:"array",fields:[{key:"title",label:"หัวข้อ"}]}]}/>}<div id="anchor">ส่วนท้ายหน้า</div></div></main></AdminUnsavedChanges></div>};createRoot(document.getElementById("root")).render(<Harness/>);`,
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
        name: "unsaved-fixture",
        setup(builder) {
          builder.onResolve(
            {
              filter:
                /^(next\/(link|image|navigation)|\.\.\/server\/(home-image-actions|media-actions|actions)|@\/features\/admin\/server\/media-actions)$/,
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
                    ? "export const useRouter=()=>({push:()=>{},refresh:()=>{}});"
                    : path.endsWith("/actions")
                      ? 'export async function saveDocumentAction(_,form){window.__saved=Object.fromEntries(form);await new Promise(r=>setTimeout(r,window.__delay??0));return window.__error?{error:window.__error}:{success:true}};export async function deleteDocumentAction(){return{error:"Writes disabled"}};'
                      : path.endsWith("home-image-actions")
                        ? 'export async function saveHomeImageAction(_,form){window.__saved=Object.fromEntries(form);if(window.__error)return{error:window.__error};window.dispatchEvent(new CustomEvent("home-saved",{detail:form.get("slot")}));return{}};'
                        : 'export async function uploadProductImage(){throw Error("Writes disabled")};export async function discardProductImage(){};',
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

async function open(page: Page, query = "") {
  await page.route("**/__unsaved_fixture*", (route) =>
    route.fulfill({
      contentType: "text/html;charset=utf-8",
      body: `<!doctype html><html lang="th"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>${css}</style></head><body class="admin-app"><div id="root"></div><script>${bundle.replaceAll("</script", "<\\/script")}</script></body></html>`,
    }),
  );
  await page.goto(`/__unsaved_fixture${query}`);
}
const bar = (page: Page) => page.getByRole("region", { name: "การแก้ไขที่ยังไม่บันทึก" });
const confirmation = (page: Page) =>
  page.getByRole("dialog", { name: "ยังไม่ได้บันทึกการแก้ไข", exact: true });

test("form reversions are clean and the save bar stays inside desktop and mobile viewports", async ({
  page,
}) => {
  await open(page);
  const input = page.getByRole("textbox", { name: "ชื่อไทย", exact: false });
  await expect(bar(page)).toHaveCount(0);
  await input.fill("แก้ไขแล้ว");
  for (const width of [1440, 800, 390, 320]) {
    await page.setViewportSize({ width, height: 720 });
    await expect(bar(page)).toBeVisible();
    await page
      .locator(".admin-workspace")
      .evaluate((element) => element.scrollTo(0, element.scrollHeight));
    const bounds = await bar(page).boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(721);
  }
  await input.fill("หมวดเดิม");
  await expect(bar(page)).toHaveCount(0);
});

test("navigation and logout cancellation retain changes without submitting", async ({
  page,
}, testInfo) => {
  await open(page);
  await page.getByRole("textbox", { name: "ชื่อไทย", exact: false }).fill("ยังไม่บันทึก");
  await page.getByRole("link", { name: "เปลี่ยนหน้า", exact: true }).click();
  await expect(confirmation(page)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("unsaved-confirmation.png") });
  await confirmation(page).getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
  await expect(page).not.toHaveURL(/destination/);
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await confirmation(page).getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
  expect(await page.evaluate(() => "__logout" in window || "__saved" in window)).toBe(false);
  await expect(bar(page)).toBeVisible();
  await page.getByRole("link", { name: "ไปส่วนอื่น", exact: true }).click();
  await expect(page).toHaveURL(/#anchor$/);
  page.on("dialog", () => {
    throw Error("Unexpected duplicate browser confirmation");
  });
  await page.getByRole("link", { name: "เปลี่ยนหน้า", exact: true }).click();
  await confirmation(page).getByRole("button", { name: "ทิ้งการเปลี่ยนแปลง", exact: true }).click();
  await expect(page).toHaveURL(/destination=1/);
});

test("array reordering is dirty even without an input event and reversing the move is clean", async ({
  page,
}) => {
  await open(page);
  await page.getByRole("button", { name: "เลื่อนรายการ 1 ลง", exact: true }).click();
  await expect(bar(page)).toBeVisible();
  await page.getByRole("button", { name: "เลื่อนรายการ 2 ขึ้น", exact: true }).click();
  await expect(bar(page)).toHaveCount(0);
});

for (const fallback of [false, true])
  test(`back and forward cancellation preserve the form (${fallback ? "history fallback" : "navigation API"})`, async ({
    page,
  }) => {
    if (fallback)
      await page.addInitScript(() =>
        Object.defineProperty(window, "navigation", { value: undefined }),
      );
    await open(page);
    await page.evaluate(() => {
      history.pushState({}, "", "?step=1");
      history.pushState({}, "", "?step=2");
    });
    await page.getByRole("textbox", { name: "ชื่อไทย", exact: false }).fill("ข้อมูลยังอยู่");
    await page.evaluate(() => history.go(-2));
    await confirmation(page).getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
    await expect(page).toHaveURL(/step=2/);
    await expect(page.getByRole("textbox", { name: "ชื่อไทย", exact: false })).toHaveValue(
      "ข้อมูลยังอยู่",
    );
    await page.evaluate(() => history.back());
    await confirmation(page)
      .getByRole("button", { name: "ทิ้งการเปลี่ยนแปลง", exact: true })
      .click();
    await expect(page).toHaveURL(/step=1/);
    await page.evaluate(() => history.forward());
    await confirmation(page).getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
    await expect(page).toHaveURL(/step=1/);
  });

test("reload uses the browser warning and cancellation retains edits", async ({ page }) => {
  await open(page);
  await page.getByRole("textbox", { name: "ชื่อไทย", exact: false }).fill("ห้ามหาย");
  const dialog = page.waitForEvent("dialog");
  const reload = page.evaluate(() => location.reload());
  const warning = await dialog;
  expect(warning.type()).toBe("beforeunload");
  await warning.dismiss();
  await reload;
  await expect(page.getByRole("textbox", { name: "ชื่อไทย", exact: false })).toHaveValue("ห้ามหาย");
});

test("failed saves stay dirty, pending saves disable the bar, and successful saves establish a new baseline", async ({
  page,
}) => {
  await open(page);
  const input = page.getByRole("textbox", { name: "ชื่อไทย", exact: false });
  await input.fill("ค่าที่บันทึก");
  await page.evaluate(() => Object.assign(window, { __error: "บันทึกไม่สำเร็จ", __delay: 500 }));
  await bar(page).getByRole("button").click();
  await expect(bar(page).getByRole("button")).toBeDisabled();
  await expect(page.getByRole("alert")).toContainText("บันทึกไม่สำเร็จ");
  await expect(input).toHaveValue("ค่าที่บันทึก");
  await expect(bar(page)).toBeVisible();
  await page.evaluate(() => Object.assign(window, { __error: "", __delay: 0 }));
  await bar(page).getByRole("button").click();
  await expect(bar(page)).toHaveCount(0);
  await input.fill("แก้อีกครั้ง");
  await expect(bar(page)).toBeVisible();
  await input.fill("ค่าที่บันทึก");
  await expect(bar(page)).toHaveCount(0);
});

test("homepage forms retain independent dirty state and protect other unsaved sections", async ({
  page,
}) => {
  await open(page, "?home=1");
  const first = page.getByRole("form", { name: "เปลี่ยนรูป รูปหน้าแรก 0" });
  const second = page.getByRole("form", { name: "เปลี่ยนรูป รูปหน้าแรก 1" });
  for (const form of [first, second]) {
    await form.getByLabel("เมื่อคลิกรูปภาพหรือปุ่มดูเพิ่มเติม").selectOption("page");
    await form.getByLabel("หน้าข้อมูลที่ต้องการอ้างอิง").selectOption("/about");
  }
  await expect(bar(page).getByRole("combobox").locator("option")).toHaveCount(2);
  await bar(page).getByRole("button").click();
  await confirmation(page).getByRole("button", { name: "แก้ไขต่อ", exact: true }).click();
  expect(await page.evaluate(() => "__saved" in window)).toBe(false);
  await first.getByLabel("เมื่อคลิกรูปภาพหรือปุ่มดูเพิ่มเติม").selectOption("default");
  await expect(bar(page).getByRole("combobox")).toHaveCount(0);
  await expect(bar(page)).toContainText("รูปหน้าแรก 1");
  await bar(page).getByRole("button").click();
  await expect(bar(page)).toHaveCount(0);
  const saved = await page.evaluate(() => (window as unknown as { __saved: object }).__saved);
  expect(saved).toMatchObject({ slot: "showcase1", targetType: "page", targetPagePath: "/about" });
});

test("confirming a save with another dirty form submits only the chosen form", async ({ page }) => {
  await open(page, "?home=1");
  for (const form of await page.getByRole("form", { name: /เปลี่ยนรูป รูปหน้าแรก/ }).all()) {
    await form.getByLabel("เมื่อคลิกรูปภาพหรือปุ่มดูเพิ่มเติม").selectOption("page");
    await form.getByLabel("หน้าข้อมูลที่ต้องการอ้างอิง").selectOption("/about");
  }
  await bar(page).getByRole("button").click();
  await confirmation(page).getByRole("button", { name: "ทิ้งการเปลี่ยนแปลง", exact: true }).click();
  await expect(bar(page)).toContainText("รูปหน้าแรก 0");
  expect(
    await page.evaluate(() => (window as unknown as { __saved: object }).__saved),
  ).toMatchObject({ slot: "showcase1" });
});
