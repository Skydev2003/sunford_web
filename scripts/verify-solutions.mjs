import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { load } from "cheerio";
import { solutionSources } from "./solution-sources.mjs";

const pages = JSON.parse(await readFile("src/features/content/data/solutions.json", "utf8"));
const report = JSON.parse(
  await readFile("src/features/content/data/solutions-import-report.json", "utf8"),
);
const text = (value) => load(value, null, false).text().replace(/\s+/g, " ").trim();
assert.equal(pages.length, solutionSources.length);
for (const page of pages) {
  const original = load(await readFile(`output/solutions-source/${page.id}.html`, "utf8"));
  const root = original(".dynamic__layout__component").children().last();
  root
    .find(
      "script,style,noscript,form,input,select,textarea,[id^='component-footer'],.salesdesk_widget_button_group",
    )
    .remove();
  assert.equal(text(page.html), text(root.html()), `${page.id}: all source text preserved`);
  const imported = load(page.html, null, false);
  for (const tag of [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "img",
    "svg",
    "table",
    "iframe",
    "video",
    "a[href]",
  ])
    assert.equal(imported(tag).length, root.find(tag).length, `${page.id}: ${tag} preserved`);
  assert.equal(report.pages.find((item) => item.id === page.id).sourceEmpty, !page.text.length);
  if (process.env.SOLUTIONS_BASE_URL) {
    const response = await fetch(`${process.env.SOLUTIONS_BASE_URL}${page.path}`);
    assert.equal(response.status, 200, page.path);
    const rendered = load(await response.text());
    if (page.text)
      assert.equal(
        text(rendered(`.solution-source--${page.id}`).html()),
        page.text,
        `${page.id}: rendered content`,
      );
    else
      assert.ok(
        rendered("main").text().includes("หน้าเว็บต้นฉบับยังไม่มีรายละเอียดสำหรับหัวข้อนี้"),
      );
  }
  console.log(
    `${page.id}: ${page.text.length ? "complete source content preserved" : "verified empty source page"}`,
  );
}
console.log(
  `Verified all ${pages.length} topics; ${pages.filter((page) => page.text.length).length} populated source pages.`,
);
