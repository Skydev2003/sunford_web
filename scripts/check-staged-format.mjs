import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

const files = new Map();
for (const entry of paths(["ls-files", "--stage", "-z"])) {
  const match = /^100(?:644|755) ([0-9a-f]+) 0\t([\s\S]+)$/.exec(entry);
  if (match) files.set(match[2], match[1]);
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
  return !isDeepStrictEqual(rules(oldOid), rules(files.get(path)));
}

const snapshot = mkdtempSync(join(tmpdir(), "sunford-format-"));
try {
  // Resolve formatting and ignore rules from the index, including partially staged configs.
  for (const [path, oid] of files) {
    if (!isRule(path) && basename(path) !== "package.json") continue;
    const dest = join(snapshot, path);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, git(["cat-file", "blob", oid]));
  }

  const full = [...changed.keys()].some((path) => isRule(path) || packageRulesChanged(path));
  if (full) console.log("Formatting rules changed. Checking the complete index.");
  const ignorePath = [".gitignore", ".prettierignore"].map((path) => join(snapshot, path));
  const candidates = [];
  for (const [path, oid] of files) {
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
    if (inferredParser) candidates.push({ path, oid, filepath, parser: inferredParser });
  }

  // Git supplies unfiltered blob bytes. Batch reads avoid one Git process per source file.
  for (let i = 0; i < candidates.length; i += 16) {
    const batch = candidates.slice(i, i + 16);
    const blobs = git(["cat-file", "--batch"], {
      input: batch.map(({ oid }) => oid + "\n").join(""),
    });
    let offset = 0;
    for (const { path, filepath, parser } of batch) {
      const headerEnd = blobs.indexOf(10, offset);
      const size = Number(blobs.toString("ascii", offset, headerEnd).split(" ")[2]);
      const start = headerEnd + 1;
      const source = blobs.toString("utf8", start, start + size);
      offset = start + size + 1;
      const config = await prettier.resolveConfig(filepath, { editorconfig: true });
      if (!(await prettier.check(source, { ...config, filepath, parser }))) {
        console.error("Format and stage this file: " + path);
        process.exitCode = 1;
      }
    }
  }
} finally {
  rmSync(snapshot, { recursive: true, force: true });
}
