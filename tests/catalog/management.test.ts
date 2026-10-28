import assert from "node:assert/strict";
import { test } from "node:test";
import { getSnapshotProducts } from "../../src/features/content/data/catalog-snapshot";
import { resolveManagedProduct } from "../../src/features/catalog/data/managed-products";
import {
  productOverview,
  productPresentation,
} from "../../src/features/catalog/data/product-presentation";
import { categories } from "../../src/features/catalog/types";
import { findCatalogProduct } from "../../src/features/catalog/data/product-lookup";
import sourceProducts from "../../src/features/content/data/products.json";
import type { SourceProduct } from "../../src/features/content/types";
import {
  formatProductContent,
  mergeProductContentRows,
  productContentRows,
} from "../../src/features/catalog/data/product-content";
import { load } from "cheerio";
import { defaultHomeImages, homeImageSlots } from "../../src/features/home/data/image-slots";
import { resolveHomeLink } from "../../src/features/home/data/link-targets";
import {
  contentRoutePath,
  contentRewrites,
  resolveContentPath,
  staticContentParams,
} from "../../src/features/content/data/static-content-params";
import sourcePages from "../../src/features/content/data/pages.json";
import { contactLocations } from "../../src/features/content/data/contact-locations";

test("contact location facts and map destinations match the imported company contact page", () => {
  const source = sourcePages.find((page) => page.path === "/contact-us")!;
  const $ = load(source.html);
  const text = $.text().replace(/\s+/g, " ");
  const links = $("a")
    .map((_, element) => $(element).attr("href"))
    .get();
  for (const location of contactLocations) {
    assert.ok(text.includes(location.address));
    assert.ok(links.includes(location.map));
    if (location.id !== "service") assert.ok(text.includes(location.company));
  }
});

test("static content params reserve filename space for Vercel's prerender sidecars", () => {
  const params = staticContentParams(sourcePages);
  assert.ok(params.some(({ path }) => path.join("/") === "about-us"));
  const longPage = sourcePages.find((page) => page.path.startsWith("/scale-label-printing"));
  assert.ok(longPage);
  assert.ok(params.some(({ path }) => `/${path.join("/")}` === longPage.path));
  assert.equal(resolveContentPath(contentRoutePath(longPage.path)), longPage.path);
  assert.equal(
    params.length,
    sourcePages.filter((page) => page.path !== "/" && page.kind !== "product").length,
  );
  assert.equal(
    new Set(contentRewrites.map((rewrite) => rewrite.destination)).size,
    contentRewrites.length,
  );
  for (const { path } of params) {
    for (const segment of path) {
      for (const suffix of [
        ".prerender-config.json",
        ".prerender-fallback.html",
        ".rsc.prerender-config.json",
      ]) {
        assert.ok(Buffer.byteLength(encodeURIComponent(segment) + suffix, "utf8") <= 255);
      }
    }
  }
  // Bound encoded bytes for runtime caches as well as raw UTF-8 at build time.
  assert.match(contentRoutePath(`/${"a".repeat(201)}/short`), /^\/_content\/[a-f0-9]{64}$/);
  assert.equal(contentRoutePath(`/${"a".repeat(200)}/short`), `/${"a".repeat(200)}/short`);
});

test("all imported technical labels avoid split numbers and retain complete values from real products", () => {
  const rowsFor = (id: string) =>
    productContentRows(
      (sourceProducts as SourceProduct[]).find((product) => product.sourceId === id)!.detailsHtml,
      true,
    );
  const valueFor = (id: string, label: string) =>
    load(rowsFor(id).find((row) => row.label === label)!.html)
      .text()
      .replace(/\s+/g, "");
  assert.equal(valueFor("10617", "ค่าน้ำหนัก"), "0.000-5.000kg");
  assert.equal(valueFor("10681", "พิกัดน้ำหนักสูงสุด"), "6kg");
  assert.equal(valueFor("10672", "ขนาดเครื่องชั่ง"), "17.0x21.4x6.8ซม.");
  assert.ok(valueFor("10672", "ขนาดจานชั่ง").startsWith("17.0x14.0"));
  assert.equal(valueFor("10756", "ขนาดเครื่องชั่งพร้อมใช้งาน"), "45x87x89ซม.");
  assert.equal(valueFor("10756", "ขนาดเครื่องชั่งขณะพับเก็บ"), "45x84x23ซม.");
  assert.ok(valueFor("10756", "ขนาดจานชั่ง").startsWith("45x60"));
  for (const id of ["10614", "10632", "10618", "10656"]) {
    assert.ok(valueFor(id, "รับประกันคุณภาพ").startsWith("3ปี"));
  }
  assert.ok(valueFor("10641", "ผ่านการตรวจรับรองจาก").includes("สำนักงานชั่งตวงวัด"));
  assert.ok(valueFor("10746", "เหมาะสำหรับ").startsWith("ใช้งานร่วมกับ"));
  for (const product of sourceProducts as SourceProduct[]) {
    for (const row of productContentRows(product.detailsHtml, true)) {
      assert.ok(!/\d/.test(row.label), `${product.sourceId}: ${row.label}`);
      assert.equal(
        (row.label.match(/\(/g) ?? []).length,
        (row.label.match(/\)/g) ?? []).length,
        `${product.sourceId}: ${row.label}`,
      );
      assert.ok(
        !["ร", "รับ", "ผ", "รับประกันคุณ", "รับประกัน", "เหมาะสำหรับใ"].includes(row.label),
        `${product.sourceId}: ${row.label}`,
      );
    }
  }
});

test("technical parsing preserves unfamiliar statements and inline links instead of guessing at span boundaries", () => {
  const rows = productContentRows(
    '<p><span>กระดาษสีขาว คุณสมบัติกันน้ำ ช</span><span>นิดไม่ต้องใช้หมึกพิมพ์</span></p><p><span>การเชื่อม</span><span>ต่อ</span> <a href="https://example.com/usb">USB</a></p>',
    true,
  );
  assert.equal(rows[0].label, "คุณสมบัติ");
  assert.equal(load(rows[0].html).text(), "กระดาษสีขาว คุณสมบัติกันน้ำ ชนิดไม่ต้องใช้หมึกพิมพ์");
  assert.equal(rows[1].label, "การเชื่อมต่อ");
  assert.equal(load(rows[1].html)("a").attr("href"), "https://example.com/usb");
});

test("technical units remain together when a source span splits a parenthesized value", () => {
  const rows = productContentRows(
    "<p><span>แสดงหน่วยน้ำหนัก (</span><span>g, Kg)</span></p><p><span>แสดงหน่วยปริมาตร (ml-</span><span>water, ml-milk)</span></p><p><span>โหมด (ตัวเลือก)</span><span>อัตโนมัติ</span></p>",
    true,
  );
  assert.deepEqual(
    rows.map((row) => [row.label, load(row.html).text()]),
    [
      ["แสดงหน่วยน้ำหนัก", "(g, Kg)"],
      ["แสดงหน่วยปริมาตร", "(ml-water, ml-milk)"],
      ["โหมด (ตัวเลือก)", "อัตโนมัติ"],
    ],
  );
});

test("detail rows combine repeated labels and remove repeated statements without losing distinct values", () => {
  const rows = mergeProductContentRows([
    {
      label: "รายละเอียด",
      html: "<p>ข้อมูลสินค้า</p><ul><li>ชั่งน้ำหนัก</li><li>นับจำนวน</li></ul>",
    },
    { label: "รายละเอียดสินค้า", html: "<p><strong>ข้อมูลสินค้า</strong></p>" },
    { label: "รายละเอียด", html: "<ul><li>ชั่งน้ำหนัก</li><li>พิมพ์ฉลาก</li></ul>" },
    { label: "จอแสดงผล", value: "LCD" },
    { label: "จอแสดงผล:", html: "<p>LCD</p>" },
    { label: "จอแสดงผล", value: "2 ด้าน" },
    { label: "หน่วยความจำ", value: "-" },
    { label: "หน่วยความจำ", value: "100 รายการ" },
  ]);
  assert.deepEqual(
    rows.map((row) => row.label),
    ["รายละเอียดสินค้า", "จอแสดงผล", "หน่วยความจำ"],
  );
  const description = load(rows[0].html);
  assert.equal(description("p").length, 1);
  assert.deepEqual(
    description("li")
      .map((_, node) => description(node).text())
      .get(),
    ["ชั่งน้ำหนัก", "นับจำนวน", "พิมพ์ฉลาก"],
  );
  assert.equal((load(rows[1].html).text().match(/LCD/g) ?? []).length, 1);
  assert.ok(load(rows[1].html).text().includes("2 ด้าน"));
  assert.equal(load(rows[2].html).text(), "100 รายการ");
  const distinct = mergeProductContentRows([
    { label: "กำลังไฟ", value: "1 mW" },
    { label: "กำลังไฟ", value: "1 MW" },
  ]);
  assert.equal(load(distinct[0].html)(".product-value").length, 2);
});

test("merging details preserves nested text, separate link targets and images while escaping plain values", () => {
  const rows = mergeProductContentRows([
    { label: "รายละเอียด", html: "<ul><li><ul><li>ข้อความซ้อน</li></ul></li></ul>" },
    { label: "รายละเอียด", html: '<p><a href="https://example.com/a">คู่มือ</a></p>' },
    { label: "รายละเอียด", html: '<p><a href="https://example.com/b">คู่มือ</a></p>' },
    { label: "รายละเอียด", html: '<img src="/images/a.png" alt="มุมหน้า">' },
    { label: "รายละเอียด", html: '<img src="/images/b.png" alt="มุมหลัง">' },
    { label: "รายละเอียด", value: '<script>alert("test")</script>\nบรรทัดใหม่' },
  ]);
  const $ = load(rows[0].html);
  assert.ok($.text().includes("ข้อความซ้อน"));
  assert.equal($("a").length, 2);
  assert.equal($("img").length, 2);
  assert.equal($("script").length, 0);
  assert.ok($(".product-plain-value").text().includes("\nบรรทัดใหม่"));
  assert.deepEqual(
    mergeProductContentRows([
      { label: "วัสดุ", value: "" },
      { label: "วัสดุ", value: "—" },
    ]),
    [{ label: "วัสดุ", html: "-" }],
  );
});

test("detail table rows preserve imported text and split technical labels from their values", () => {
  const normalize = (text: string) => text.replace(/\s+/g, "");
  for (const product of sourceProducts as SourceProduct[]) {
    for (const [html, splitLabels] of [
      [product.descriptionHtml, false],
      [product.detailsHtml, true],
    ] as const) {
      const rows = productContentRows(html, splitLabels);
      const result = normalize(rows.map((row) => row.label + load(row.html).text()).join(""));
      const $ = load(html);
      $("p, h1, h2, h3, h4, h5, h6, li").each((_, node) => {
        const original = normalize($(node).text());
        if (original) assert.ok(result.includes(original), `${product.sourceId}: ${original}`);
      });
    }
  }
  const rows = productContentRows(
    "<div><p><span>หน่วยความจำ</span><span>10,000 รายการ</span></p><p>แบตเตอรี่ 4V4Ah</p></div>",
    true,
  );
  assert.deepEqual(
    rows.map((row) => [row.label, load(row.html).text()]),
    [
      ["หน่วยความจำ", "10,000 รายการ"],
      ["แบตเตอรี่", "4V4Ah"],
    ],
  );
  const media = productContentRows(
    '<p><a href="https://example.com">คู่มือ</a></p><p><img src="/images/test.png" alt="สินค้า"></p>',
    true,
  );
  assert.ok(media.some((row) => row.html.includes('href="https://example.com"')));
  assert.ok(media.some((row) => row.html.includes('src="/images/test.png"')));
});

test("product content formatting keeps every imported description and technical fact", () => {
  const text = (html: string) => load(html).text().replace(/\s+/g, "");
  for (const product of sourceProducts as SourceProduct[]) {
    for (const [html, listParagraphs] of [
      [product.descriptionHtml, false],
      [product.detailsHtml, true],
    ] as const) {
      assert.equal(text(formatProductContent(html, listParagraphs)), text(html), product.sourceId);
    }
  }
});

test("product content separates line breaks, headings and lists while retaining links and media", () => {
  const html =
    '<p>เหมาะสำหรับ</p><p><strong>ร้านค้า<br>งานอาหาร</strong><br>&nbsp;</p><ul><li>รายการเดิม</li></ul><p>ข้อแรก</p><p><a href="https://example.com">ข้อมูลเพิ่มเติม</a></p><p><img src="/images/example.png" alt="สินค้า"></p>';
  const $ = load(formatProductContent(html, true));
  assert.equal($("h3").text(), "เหมาะสำหรับ");
  assert.equal($(".product-points").length, 3);
  assert.deepEqual(
    $(".product-points li")
      .map((_, element) => $(element).text())
      .get(),
    ["ร้านค้า", "งานอาหาร", "ข้อแรก", "ข้อมูลเพิ่มเติม"],
  );
  assert.equal($("ul:not(.product-points) li").text(), "รายการเดิม");
  assert.equal($("a").attr("href"), "https://example.com");
  assert.equal($("img").attr("src"), "/images/example.png");
});

test("homepage destinations follow product IDs through slug changes and disable missing targets", () => {
  const products = getSnapshotProducts();
  assert.equal(resolveHomeLink("spotlight", undefined, products), "/products/acs30-jc21");
  assert.equal(resolveHomeLink("digital", undefined, products), "/Product/Digital-weighing");
  const target = { productId: "wps10ks" };
  assert.equal(resolveHomeLink("digital", target, products), "/products/wps10ks");
  assert.equal(
    resolveHomeLink(
      "digital",
      target,
      products.map((p) => (p.id === "wps10ks" ? { ...p, slug: "renamed-wps" } : p)),
    ),
    "/products/renamed-wps",
  );
  assert.equal(
    resolveHomeLink(
      "digital",
      target,
      products.filter((p) => p.id !== "wps10ks"),
    ),
    undefined,
  );
  assert.equal(resolveHomeLink("smart", { pagePath: "/about-us" }, products), "/about-us");
  for (const path of [
    "javascript:alert(1)",
    "https://example.com",
    "//example.com",
    "/admin/products",
    "/api/products",
    "/\\example.com",
  ])
    assert.equal(resolveHomeLink("smart", { pagePath: path }, products), undefined);
});

test("homepage image defaults preserve the current artwork in five independent positions", () => {
  const defaults = defaultHomeImages();
  assert.equal(homeImageSlots.length, 5);
  assert.equal(new Set(homeImageSlots.map((slot) => slot.id)).size, 5);
  assert.equal(defaults.spotlight, "/images/products/acs30-jc21-cutout.png");
  assert.equal(defaults.smart, "/images/pd/RLS1100.png");
  assert.equal(defaults.digital, "/images/pd/WPS10KS.png");
  assert.equal(defaults.accessories, "/images/pd/TRP-58B.png");
  assert.equal(defaults.software, "/images/pd/app.png");
});

test("all 150 imported products retain unique slugs and supported categories", () => {
  const snapshot = getSnapshotProducts();
  assert.equal(snapshot.length, 150);
  assert.equal(new Set(snapshot.map((product) => product.slug)).size, snapshot.length);
  for (const product of snapshot)
    assert.ok(
      categories.some((category) => category.id === product.category),
      product.id,
    );
});

test("legacy display is preserved until saved; explicit edits win while original metadata survives", () => {
  const snapshot = getSnapshotProducts()[0];
  const legacy = {
    ...snapshot,
    name: "Old database seed",
    image: "/images/products/old.png",
    catalogManaged: false,
    published: false,
  };
  const original = structuredClone(legacy);
  const before = resolveManagedProduct(legacy);
  assert.equal(before.name, snapshot.name);
  assert.equal(before.image, snapshot.image);
  assert.equal(before.published, false);
  const edited = resolveManagedProduct({
    ...legacy,
    name: "Admin edit",
    image: "/images/products/new.png",
    catalogManaged: true,
  });
  assert.equal(edited.name, "Admin edit");
  assert.equal(edited.imageOverridden, true);
  assert.equal(edited.sourceId, snapshot.sourceId);
  assert.equal(edited.sourceUrl, snapshot.sourceUrl);
  assert.equal(edited.price, snapshot.price);
  assert.deepEqual(legacy, original);
});

test("source collections classify POS terminals and accessories before description keywords", () => {
  const snapshot = getSnapshotProducts();
  for (const sourceId of ["10801", "10802", "10805"])
    assert.equal(snapshot.find((product) => product.sourceId === sourceId)?.category, "pos");
  const accessories = sourcePages.find((page) => page.path === "/collections/scale-accessories")!;
  for (const sourceId of accessories.productHandles)
    assert.equal(
      snapshot.find((product) => product.sourceId === sourceId)?.category,
      "accessories",
      sourceId,
    );
});

test("category corrections apply only to untouched imports and preserve administrator overrides", () => {
  const snapshot = getSnapshotProducts().find((product) => product.sourceId === "10801")!;
  const seeded = {
    ...snapshot,
    category: "industrial",
    catalogManaged: true,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
  };
  assert.equal(resolveManagedProduct(seeded).category, "pos");
  assert.equal(
    resolveManagedProduct({ ...seeded, updatedAt: new Date("2026-01-02T00:00:00Z") }).category,
    "industrial",
  );
  assert.equal(
    resolveManagedProduct({ ...seeded, categoryId: "custom-category" }).category,
    "custom-category",
  );
});

test("case-distinct original URLs stay separate and hidden records never fall back to a different product", () => {
  const snapshot = getSnapshotProducts();
  assert.equal(findCatalogProduct(snapshot, "rls1100")?.id, "rls1100");
  assert.equal(findCatalogProduct(snapshot, "RLS1100")?.id, "sunford-RLS1100");
  const hidden = snapshot.filter((p) => p.id !== "rls1100");
  assert.equal(findCatalogProduct(hidden, "rls1100"), undefined);
  assert.equal(findCatalogProduct(hidden, "10639"), undefined);
  const renamed = snapshot.map((p) => (p.id === "wps10ks" ? { ...p, slug: "new-wps" } : p));
  assert.equal(findCatalogProduct(renamed, "wps10ks")?.slug, "new-wps");
  assert.equal(findCatalogProduct(renamed, "10669")?.slug, "new-wps");
});

test("details retain the original gallery and rich specifications; edited fields appear immediately", () => {
  const snapshot = getSnapshotProducts().find((p) => p.id === "wps10ks")!;
  const source = (sourceProducts as SourceProduct[]).find((p) => p.sourceId === snapshot.sourceId)!;
  const before = productPresentation(snapshot, snapshot, source);
  assert.deepEqual(before.images, source.images);
  assert.equal(before.descriptionHtml, source.descriptionHtml);
  assert.equal(
    productPresentation(
      { ...snapshot, description: snapshot.description.replace(/\n/g, "\r\n") },
      snapshot,
      source,
    ).descriptionHtml,
    source.descriptionHtml,
  );
  assert.deepEqual(before.specifications, source.specifications);
  const after = productPresentation(
    {
      ...snapshot,
      image: "/images/products/new.png",
      description: "New description",
      capacity: "25 kg",
    },
    snapshot,
    source,
  );
  assert.equal(after.images[0], "/images/products/new.png");
  assert.ok(source.images.every((image) => after.images.includes(image)));
  assert.equal(after.descriptionHtml, undefined);
  assert.ok(after.specifications.some((spec) => spec.value === "25 kg"));
  assert.equal(source.descriptionHtml, before.descriptionHtml);
});

test("product overviews keep eight fields and use a dash for missing data", () => {
  const product = { ...getSnapshotProducts()[0], capacity: "", readability: "—", connection: " " };
  const overview = productOverview(product, []);
  assert.deepEqual(
    overview.specifications.map((spec) => spec.label),
    [
      "น้ำหนัก",
      "ค่าละเอียด",
      "เหมาะสำหรับ",
      "หน้าจอแสดงผล",
      "หน่วยความจำ",
      "การพิมพ์ฉลาก",
      "การเชื่อมต่อระบบ",
      "วัสดุและความทนทาน",
    ],
  );
  assert.ok(overview.specifications.every((spec) => spec.value === "-"));
  assert.deepEqual(overview.additionalSpecifications, []);
});

test("overview aliases preserve saved specifications and do not mistake minimum weight for capacity", () => {
  const product = getSnapshotProducts()[0];
  const specifications = [
    { label: "น้ำหนักต่ำสุด", value: "2 กรัม" },
    { label: "พิกัดน้ำหนัก", value: "25 กิโลกรัม" },
    { label: "ความละเอียด", value: "1 กรัม" },
    { label: "เหมาะสำหรับ", value: "งานอาหาร" },
    { label: "จอแสดงผล", value: "LCD" },
    { label: "หน่วยความจำ", value: "100 รายการ" },
    { label: "การพิมพ์ฉลาก", value: "ไม่มี" },
    { label: "การเชื่อมต่อ", value: "RS232" },
    { label: "วัสดุ", value: "สแตนเลส" },
  ];
  const overview = productOverview(product, specifications);
  assert.deepEqual(
    overview.specifications.map((spec) => spec.value),
    ["25 กิโลกรัม", "1 กรัม", "งานอาหาร", "LCD", "100 รายการ", "ไม่มี", "RS232", "สแตนเลส"],
  );
  assert.deepEqual(overview.additionalSpecifications, [specifications[0]]);
  assert.equal(
    productOverview(product, [{ label: "หน่วยความจำ", value: " " }]).specifications[4].value,
    "-",
  );
  assert.equal(
    productOverview(product, [{ label: "การเชื่อมต่อ", value: "-" }]).specifications[6].value,
    "-",
  );
});
