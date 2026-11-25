import { execFileSync } from "node:child_process";
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, extname, join } from "node:path";
import { isDeepStrictEqual } from "node:util";
import * as prettier from "prettier";

function git(args, options) {
  return execFileSync("git", args, { maxBuffer: 128 * 1024 * 1024, ...options });
}

function paths(args) {
  return git(args).toString().split("\0").filter(Boolean);
}

// With rename detection off both sides of a renamed rule file are visible.
const diff = paths(["diff", "--cached", "--no-renames", "--raw", "--no-abbrev", "-z"]);
const changed = new Map();
for (let i = 0; i < diff.length; i += 2) {
  changed.set(diff[i + 1], diff[i].split(" ")[2]);
}
if (!changed.size) process.exit(0);

const listIndex = () => git(["ls-files", "--stage", "-z"]);
const initialIndex = listIndex();
const files = new Map();
for (const entry of initialIndex.toString().split("\0")) {
  const match = /^(100(?:644|755)) ([0-9a-f]+) 0\t([\s\S]+)$/.exec(entry);
  if (match) files.set(match[3], { mode: match[1], oid: match[2] });
}

function isRule(path) {
  return /^(?:\.prettierrc(?:\..+)?|prettier\.config\..+|\.prettierignore|\.gitignore|\.editorconfig)$/.test(
    basename(path),
  );
}

function packageRulesChanged(path) {
  if (basename(path) !== "package.json") return false;
  const oldOid = changed.get(path);
  const rules = (oid) =>
    oid && !/^0+$/.test(oid) ? JSON.parse(git(["cat-file", "blob", oid])).prettier : undefined;
  return !isDeepStrictEqual(rules(oldOid), rules(files.get(path)?.oid));
}

function workingFile(path) {
  return lstatSync(path, { throwIfNoEntry: false })?.isFile() ? readFileSync(path) : undefined;
}

function hashBlob(path, input, write = false) {
  return git(["hash-object", ...(write ? ["-w"] : []), `--path=${path}`, "--stdin"], { input })
    .toString()
    .trim();
}

const snapshot = mkdtempSync(join(tmpdir(), "sunford-format-"));
try {
  // Resolve formatting and ignore rules from the index, including partially staged configs.
  for (const [path, { oid }] of files) {
    if (!isRule(path) && basename(path) !== "package.json") continue;
    const dest = join(snapshot, path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, git(["cat-file", "blob", oid]));
  }

  const full = [...changed.keys()].some((path) => isRule(path) || packageRulesChanged(path));
  if (full) console.log("Formatting rules changed. Checking the complete index.");
  const ignorePath = [".gitignore", ".prettierignore"].map((path) => join(snapshot, path));
  const candidates = [];
  for (const [path, { oid, mode }] of files) {
    if (!full && !changed.has(path)) continue;
    const filepath = join(snapshot, path);
    let { ignored, inferredParser } = await prettier.getFileInfo(filepath, { ignorePath });
    if (ignored) continue;
    // Prettier can also recognize extensionless executables by their shebang.
    if (!inferredParser && !extname(path)) {
      mkdirSync(dirname(filepath), { recursive: true });
      writeFileSync(filepath, git(["cat-file", "blob", oid]));
      ({ inferredParser } = await prettier.getFileInfo(filepath, { ignorePath }));
    }
    if (inferredParser) candidates.push({ path, oid, mode, filepath, parser: inferredParser });
  }

  const fixes = [];
  // Git supplies unfiltered blob bytes. Batch reads avoid one Git process per source file.
  for (let i = 0; i < candidates.length; i += 16) {
    const batch = candidates.slice(i, i + 16);
    const blobs = git(["cat-file", "--batch"], {
      input: batch.map(({ oid }) => oid + "\n").join(""),
    });
    let offset = 0;
    for (const { path, filepath, parser, oid, mode } of batch) {
      const headerEnd = blobs.indexOf(10, offset);
      const size = Number(blobs.toString("ascii", offset, headerEnd).split(" ")[2]);
      const start = headerEnd + 1;
      const source = blobs.toString("utf8", start, start + size);
      offset = start + size + 1;
      try {
        const config = await prettier.resolveConfig(filepath, { editorconfig: true });
        const formatted = await prettier.format(source, { ...config, filepath, parser });
        if (formatted === source) continue;
        if (!changed.has(path)) {
          console.error(`Format and stage this file affected by the rule change: ${path}`);
          process.exitCode = 1;
          continue;
        }
        fixes.push({ path, oid, mode, formatted });
      } catch (error) {
        console.error(`Cannot format ${path}: ${error.message.split("\n")[0]}`);
        process.exitCode = 1;
      }
    }
  }

  // Resolve every formatting error before updating any staged entry.
  if (!process.exitCode && fixes.length) {
    const updates = fixes.map((fix) => ({
      ...fix,
      formattedOid: hashBlob(fix.path, fix.formatted, true),
    }));
    if (!listIndex().equals(initialIndex)) {
      throw new Error("The staging area changed while formatting. Run the commit again.");
    }
    git(["update-index", "-z", "--index-info"], {
      input: updates
        .map(({ mode, formattedOid, path }) => `${mode} ${formattedOid}\t${path}\0`)
        .join(""),
    });

    for (const { path, oid, formattedOid } of updates) {
      const before = workingFile(path);
      if (before && hashBlob(path, before) === oid) {
        const after = git(["cat-file", "--filters", `--path=${path}`, formattedOid]);
        if (workingFile(path)?.equals(before)) writeFileSync(path, after);
      }
      console.log(`Formatted staged file: ${path}`);
    }
  }
} finally {
  rmSync(snapshot, { recursive: true, force: true });
}
