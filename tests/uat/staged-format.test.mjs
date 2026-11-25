import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const script = resolve(import.meta.dirname, "../../scripts/check-staged-format.mjs");

function fixture(t) {
  const cwd = mkdtempSync(join(tmpdir(), "sunford-pre-commit-"));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const env = { ...process.env };
  for (const name of ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_PREFIX"]) delete env[name];
  const run = (...args) => spawnSync("git", args, { cwd, env, encoding: "utf8" });
  const git = (...args) => {
    const result = run(...args);
    assert.equal(result.status, 0, result.stderr);
    return result.stdout;
  };
  const write = (file, contents) => writeFileSync(join(cwd, file), contents);
  const read = (file) => readFileSync(join(cwd, file), "utf8");
  git("init");
  git("config", "user.name", "Hook Test");
  git("config", "user.email", "hook@example.invalid");
  git("config", "commit.gpgsign", "false");
  git("config", "core.hooksPath", ".git/hooks");
  git("config", "core.autocrlf", "true");
  write(".prettierrc.json", '{ "endOfLine": "auto" }\n');
  write("partial.js", "let count = 0;\n");
  git("add", ".prettierrc.json", "partial.js");
  git("commit", "-m", "initial");
  const quoted = script.replaceAll("\\", "/").replaceAll("'", "'\\''");
  writeFileSync(join(cwd, ".git/hooks/pre-commit"), `#!/bin/sh\nexec node '${quoted}'\n`, {
    mode: 0o755,
  });
  return { git, run, write, read };
}

test("commit formats staged content and preserves unstaged text under Windows Git settings", (t) => {
  const { git, write, read } = fixture(t);
  const fullyStaged = "full file.js";
  write(fullyStaged, "const    total={a:1}\r\n");
  write("partial.js", "let    count=1\r\n");
  git("add", fullyStaged, "partial.js");
  const unstaged = "let    count=1\r\nconst draft=2\r\n";
  write("partial.js", unstaged);
  const unstagedRules = '{ "semi": false }\r\n';
  write(".prettierrc.json", unstagedRules);
  write("untracked.js", "const ignored=3\r\n");

  git("commit", "-m", "format staged changes");

  assert.equal(git("show", `HEAD:${fullyStaged}`), "const total = { a: 1 };\n");
  assert.equal(git("show", "HEAD:partial.js"), "let count = 1;\n");
  assert.equal(read(fullyStaged), "const total = { a: 1 };\r\n");
  assert.equal(read("partial.js"), unstaged);
  assert.equal(read(".prettierrc.json"), unstagedRules);
  assert.equal(read("untracked.js"), "const ignored=3\r\n");
  assert.equal(
    git("status", "--porcelain"),
    " M .prettierrc.json\n M partial.js\n?? untracked.js\n",
  );
});

test("commit -a formats content in the index prepared by Git", (t) => {
  const { git, write, read } = fixture(t);
  write("partial.js", "let    count=2\r\n");

  git("commit", "-am", "format commit-all changes");

  assert.equal(git("show", "HEAD:partial.js"), "let count = 2;\n");
  assert.equal(read("partial.js"), "let count = 2;\r\n");
  assert.equal(git("status", "--porcelain"), "");
});

test("invalid syntax stops the commit before changing any staged or working files", (t) => {
  const { git, run, write, read } = fixture(t);
  const unformatted = "const   value=1\n";
  write("a.js", unformatted);
  write("broken.json", '{ "value": }\n');
  git("add", "a.js", "broken.json");
  const index = git("ls-files", "--stage");
  const head = git("rev-parse", "HEAD");

  const result = run("commit", "-m", "invalid JSON");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /broken\.json/);
  assert.equal(git("rev-parse", "HEAD"), head);
  assert.equal(git("ls-files", "--stage"), index);
  assert.equal(read("a.js"), unformatted);
  assert.equal(read("broken.json"), '{ "value": }\n');
});

test("a new formatting rule cannot stage unrelated files automatically", (t) => {
  const { git, run, write, read } = fixture(t);
  write(".prettierrc.json", '{ "semi": false }\n');
  git("add", ".prettierrc.json");
  const index = git("ls-files", "--stage");

  const result = run("commit", "-m", "change formatting rules");

  assert.equal(result.status, 1);
  assert.match(result.stderr, /rule change: partial\.js/);
  assert.equal(git("ls-files", "--stage"), index);
  assert.equal(read("partial.js"), "let count = 0;\n");
});
