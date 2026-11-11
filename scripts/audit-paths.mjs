import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { load } from "cheerio";
import ts from "typescript";

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter((file) => file && existsSync(file));
const failures = new Set();
let paths = 0;
function check(value, location) {
  let url;
  try {
    url = new URL(value, "https://local.invalid");
    if (url.origin !== "https://local.invalid") return;
    const path = decodeURIComponent(url.pathname);
    paths++;
    if (/[\u0e00-\u0e7f]/.test(path)) failures.add(`${location}: ${value}`);
  } catch {
    if (value.startsWith("/") && /[\u0e00-\u0e7f]/.test(value))
      failures.add(`${location}: ${value}`);
  }
}
function inspect(value, location) {
  if (typeof value === "string") {
    if (value.startsWith("/")) check(value, location);
    if (value.includes("<")) {
      const $ = load(value);
      $("[href], [src], [action], [poster]").each((_, element) => {
        for (const attribute of ["href", "src", "action", "poster"]) {
          const url = $(element).attr(attribute);
          if (url) check(url, `${location}.${attribute}`);
        }
      });
    }
  } else if (value && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      if (key.startsWith("/")) check(key, `${location}.key`);
      inspect(entry, `${location}.${key}`);
    }
  }
}
for (const file of files) {
  if (/[\u0e00-\u0e7f]/.test(file)) failures.add(`Filename: ${file}`);
  if (/^src\//.test(file) && /\.(tsx?|mjs)$/.test(file)) {
    const source = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    function visit(node) {
      if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
        inspect(node.text, file);
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
for (const name of ["pages", "products"])
  inspect(JSON.parse(readFileSync(`src/features/content/data/${name}.json`, "utf8")), name);
inspect(JSON.parse(readFileSync("data/site/content.json", "utf8")), "site");
assert.equal(failures.size, 0, [...failures].join("\n"));
console.log(
  `Checked ${files.length} filenames and ${paths} internal URL references: no Thai paths.`,
);
