import "dotenv/config";
import { test, expect, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { randomUUID } from "node:crypto";
import path from "node:path";

// Credentials are supplied through the hidden prompt in scripts/test-admin.mjs.
// Auth tests never record traces, videos or password-bearing snapshots.
test.use({ trace: "off", screenshot: "off", video: "off" });
const email = process.env.ADMIN_TEST_EMAIL;
const password = process.env.ADMIN_TEST_PASSWORD;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !email || !password || !url || !key || !secret,
  "Run npm run test:admin with configured Supabase and admin credentials.",
);

async function login(page: Page) {
  await page.goto("/admin/login");
  await page.getByRole("main").getByLabel("อีเมลผู้ดูแล").fill(email!);
  await page.getByRole("main").getByLabel("รหัสผ่าน", { exact: true }).fill(password!);
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
}

async function prepareScreenshot(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  for (const image of await page.locator("main img").all()) {
    await image.evaluate((el) =>
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top - 150,
        behavior: "instant",
      }),
    );
    await expect
      .poll(() =>
        image.evaluate(
          (el) => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

function pool() {
  return new pg.Pool({ connectionString: process.env.DIRECT_URL, connectionTimeoutMillis: 10000 });
}

test("admin login, private routes, and logout use a verified server session", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(page.getByRole("heading", { name: "เข้าสู่พื้นที่แอดมิน" })).toBeVisible();
  await page.screenshot({ path: "/tmp/sunford-admin-login.png", animations: "disabled" });
  await login(page);
  await expect(page.getByRole("heading", { name: "จัดการผลิตภัณฑ์" })).toBeVisible();
  await expect(page.locator(".site-header")).toHaveCount(0);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator(".admin-product-table")).toContainText("WPS10KS");
  await prepareScreenshot(page);
  await page.screenshot({
    path: "/tmp/sunford-admin-products.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/products");
  await expect(page.locator(".admin-shell")).toHaveCount(1);
  await prepareScreenshot(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: "/tmp/sunford-admin-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "เปิดเมนูแอดมิน", exact: true }).click();
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/products/new");
  await expect(page).toHaveURL(/\/admin\/login$/);
});

test("create draft, validate upload, publish, edit, and delete a temporary product", async ({
  page,
  request,
}) => {
  test.setTimeout(90000);
  page.setDefaultTimeout(12000);
  const slug = `qa-${randomUUID()}`;
  const name = `QA ${slug}`;
  const db = pool();
  let imagePath: string | undefined;
  let createRequest: { action: string; contentType: string; body: Buffer } | undefined;
  page.on("request", (outgoing) => {
    const body = outgoing.postDataBuffer();
    const headers = outgoing.headers();
    if (!createRequest && headers["next-action"] && body?.includes(Buffer.from(slug))) {
      createRequest = {
        action: headers["next-action"],
        contentType: headers["content-type"],
        body,
      };
    }
  });
  try {
    await login(page);
    await page.getByRole("link", { name: "เพิ่มสินค้าใหม่", exact: true }).click();
    await expect(page.getByRole("heading", { name: "เพิ่มผลิตภัณฑ์ใหม่" })).toBeVisible();
    await page
      .getByRole("main")
      .getByLabel("อัปโหลดรูปสินค้า", { exact: true })
      .setInputFiles({
        name: "fake.png",
        mimeType: "image/png",
        buffer: Buffer.from("<svg onload='alert(1)'></svg>"),
      });
    await expect(page.getByRole("dialog").getByRole("alert")).toContainText("ไฟล์นี้ไม่ใช่รูป");
    await page.getByRole("button", { name: "ยกเลิกการเลือกรูป", exact: true }).click();
    await page
      .getByRole("main")
      .getByLabel("อัปโหลดรูปสินค้า", { exact: true })
      .setInputFiles(path.resolve("public/images/products/wps10ks.png"));
    await page.getByRole("button", { name: "ใช้รูปต้นฉบับ", exact: true }).click();
    await expect(page.getByText("อัปโหลดแล้ว", { exact: true })).toBeVisible();
    const publicImage = await page.locator('input[name="image"]').inputValue();
    imagePath = publicImage.split("/product-images/")[1];
    expect(imagePath).toBeTruthy();
    expect((await request.get(publicImage)).ok()).toBe(true);
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "ชื่อสินค้า", exact: false })
      .fill(name);
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "URL สินค้า", exact: false })
      .fill(slug);
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "คำโปรยสินค้า", exact: false })
      .fill("Temporary admin workflow check");
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "รายละเอียดสินค้า", exact: false })
      .fill("Temporary test product created and deleted by the admin workflow test.");
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "พิกัดน้ำหนัก", exact: false })
      .fill("10 กิโลกรัม");
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "ความละเอียด", exact: false })
      .fill("1 กรัม");
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "การเชื่อมต่อ", exact: false })
      .fill("Wi-Fi");
    await page.screenshot({
      path: "/tmp/sunford-admin-editor.png",
      fullPage: true,
      animations: "disabled",
    });
    await page.getByRole("button", { name: "บันทึกสินค้า", exact: true }).first().click();
    await expect(page).toHaveURL(/\/admin\/products\?saved=1$/);
    const row = page.getByRole("row").filter({ hasText: name });
    await expect(row).toContainText("ฉบับร่าง");
    let catalogue = await (await request.get("/api/products")).json();
    expect(catalogue.products.some((p: { slug: string }) => p.slug === slug)).toBe(false);
    await row.getByRole("link", { name: `แก้ไข ${name}`, exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/products\/[^/]+\/edit$/);
    await expect(page.getByRole("heading", { name: "แก้ไขผลิตภัณฑ์" })).toBeVisible();
    const stalePage = await page.context().newPage();
    await stalePage.goto(page.url());
    await expect(stalePage.getByRole("heading", { name: "แก้ไขผลิตภัณฑ์" })).toBeVisible();
    await page
      .getByRole("checkbox", { name: "เผยแพร่บนเว็บไซต์ ปิดเพื่อบันทึกเป็นฉบับร่าง" })
      .check();
    await page
      .getByRole("main")
      .getByRole("textbox", { name: "คำโปรยสินค้า", exact: false })
      .fill("Updated and published by QA");
    await page.getByRole("button", { name: "บันทึกสินค้า", exact: true }).first().click();
    await expect(page).toHaveURL(/\/admin\/products\?saved=1$/);
    await stalePage
      .getByRole("textbox", { name: "คำโปรยสินค้า", exact: false })
      .fill("Outdated edit should never overwrite the published product");
    await stalePage.getByRole("button", { name: "บันทึกสินค้า", exact: true }).first().click();
    await expect(stalePage.locator(".admin-alert.error")).toContainText("ถูกแก้ไขจากอีกหน้า");
    await stalePage.close();
    catalogue = await (await request.get("/api/products")).json();
    expect(catalogue.products.find((p: { slug: string }) => p.slug === slug)?.subtitle).toBe(
      "Updated and published by QA",
    );
    await page.goto(`/products/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    await page.goto("/admin/products");
    await page
      .getByRole("row")
      .filter({ hasText: name })
      .getByRole("button", { name: `ลบ ${name}`, exact: true })
      .click();
    const dialog = page.getByRole("dialog", { name: "ลบผลิตภัณฑ์นี้?" });
    await dialog.getByRole("button", { name: "ยืนยันลบสินค้า" }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole("row").filter({ hasText: name })).toHaveCount(0);
    expect(
      (await db.query('SELECT id FROM products WHERE slug=$1 AND "deletedAt" IS NULL', [slug]))
        .rowCount,
    ).toBe(0);
    expect(
      (await db.query('SELECT id FROM products WHERE slug=$1 AND "deletedAt" IS NOT NULL', [slug]))
        .rowCount,
    ).toBe(1);
    // Archived products retain their image for recovery; they are no longer public catalogue entries.
    expect(
      (
        await db.query("SELECT id FROM storage.objects WHERE bucket_id=$1 AND name=$2", [
          "product-images",
          imagePath,
        ])
      ).rowCount,
    ).toBe(1);
    catalogue = await (await request.get("/api/products")).json();
    expect(catalogue.products.some((p: { slug: string }) => p.slug === slug)).toBe(false);
    // Replay a valid mutation request with no cookies. Server Actions must recheck authorization.
    expect(createRequest).toBeDefined();
    await request.post("/admin/products/new", {
      headers: {
        "Next-Action": createRequest!.action,
        "Content-Type": createRequest!.contentType,
        Origin: new URL(page.url()).origin,
      },
      data: createRequest!.body,
    });
    expect(
      (await db.query('SELECT id FROM products WHERE slug=$1 AND "deletedAt" IS NULL', [slug]))
        .rowCount,
    ).toBe(0);
  } finally {
    await db.query("DELETE FROM products WHERE slug=$1", [slug]);
    if (imagePath) {
      const service = createClient(url!, secret!, { auth: { persistSession: false } });
      await service.storage.from("product-images").remove([imagePath]);
    }
    await db.end();
  }
});

test("non-admin Auth users cannot manage products or upload Storage objects", async ({ page }) => {
  const service = createClient(url!, secret!, { auth: { persistSession: false } });
  const userEmail = `qa-${randomUUID()}@example.invalid`;
  const userPassword = `${randomUUID()}Aa!9`;
  const { data, error } = await service.auth.admin.createUser({
    email: userEmail,
    password: userPassword,
    email_confirm: true,
  });
  expect(error).toBeNull();
  const userId = data.user!.id;
  try {
    const client = createClient(url!, key!, { auth: { persistSession: false } });
    const loginResult = await client.auth.signInWithPassword({
      email: userEmail,
      password: userPassword,
    });
    expect(loginResult.error).toBeNull();
    const { error: uploadError } = await client.storage
      .from("product-images")
      .upload(`${userId}/${randomUUID()}.png`, Buffer.from("not an image"), {
        contentType: "image/png",
      });
    expect(uploadError).not.toBeNull();
    const { error: grantError } = await client.from("admin_users").insert({ user_id: userId });
    expect(grantError).not.toBeNull();
    await page.goto("/admin/login");
    await page.getByRole("main").getByLabel("อีเมลผู้ดูแล").fill(userEmail);
    await page.getByRole("main").getByLabel("รหัสผ่าน", { exact: true }).fill(userPassword);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await expect(page.locator("main").getByRole("alert")).toContainText("ไม่มีสิทธิ์แอดมิน");
    await page.goto("/admin/products/new");
    await expect(page).toHaveURL(/\/admin\/login$/);
  } finally {
    await service.auth.admin.deleteUser(userId);
  }
});
