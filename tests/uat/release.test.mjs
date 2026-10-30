import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { releaseProduction } from "../../scripts/lib/release.mjs";

function fixture(t) {
  const directory = mkdtempSync(join(tmpdir(), "sunford-release-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const root = join(directory, "checkout");
  const remote = join(directory, "origin.git");
  function git(args, cwd = root) {
    const result = spawnSync("git", args, {
      cwd,
      encoding: "utf8",
      env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" },
    });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  git(["init", "--bare", remote], directory);
  git(["init", "--initial-branch=main", root], directory);
  git(["config", "user.name", "Release Test"]);
  git(["config", "user.email", "release@example.invalid"]);
  git(["config", "commit.gpgsign", "false"]);
  function commit(name, contents = name) {
    writeFileSync(join(root, name), contents);
    git(["add", name]);
    git(["commit", "-m", name]);
    return git(["rev-parse", "HEAD"]);
  }
  const initial = commit("base.txt");
  git(["remote", "add", "origin", remote]);
  git(["push", "origin", "main"]);
  git(["switch", "-c", "uat"]);
  git(["push", "origin", "uat"]);
  const remoteHead = (branch) => git(["rev-parse", `refs/heads/${branch}`], remote);
  const release = (options = {}) =>
    releaseProduction({ root, log: () => {}, runChecks: () => {}, ...options });
  return { root, remote, git, commit, release, remoteHead, initial };
}

test("release rebases uat onto main and pushes the validated revision without rewriting remote uat", (t) => {
  const f = fixture(t);
  f.git(["switch", "main"]);
  const main = f.commit("production.txt");
  f.git(["push", "origin", "main"]);
  f.git(["switch", "uat"]);
  const before = f.commit("feature.txt");
  f.git(["push", "origin", "uat"]);
  let checked;
  f.release({
    runChecks() {
      checked = f.git(["rev-parse", "HEAD"]);
      assert.notEqual(checked, before);
      assert.equal(f.remoteHead("main"), main);
      f.git(["merge-base", "--is-ancestor", main, "HEAD"]);
    },
  });
  assert.equal(f.remoteHead("main"), checked);
  assert.equal(f.remoteHead("uat"), before);
  assert.equal(f.git(["branch", "--show-current"]), "uat");
  assert.ok(existsSync(join(f.root, "feature.txt")));
  assert.ok(existsSync(join(f.root, "production.txt")));

  // A second release works even when origin/uat still has the original, unre-based commits.
  f.commit("next-feature.txt");
  f.release();
  assert.equal(f.remoteHead("main"), f.git(["rev-parse", "HEAD"]));
  assert.ok(existsSync(join(f.root, "next-feature.txt")));
  f.git(["merge-base", "--is-ancestor", checked, "HEAD"]);
});

test("release preserves a main-first merge when both remote branches are already included", (t) => {
  const f = fixture(t);
  f.git(["switch", "main"]);
  const main = f.commit("production.txt");
  f.git(["push", "origin", "main"]);
  f.git(["switch", "-c", "safe", f.initial]);
  const safe = f.commit("feature.txt");
  f.git(["switch", "uat"]);
  f.git(["merge", "--ff-only", "main"]);
  f.git(["merge", "--no-ff", "safe", "-m", "Merge safe into mainline"]);
  const merged = f.git(["rev-parse", "HEAD"]);
  f.release({
    runChecks() {
      assert.equal(f.git(["rev-parse", "HEAD"]), merged);
      assert.equal(f.git(["rev-parse", "HEAD^1"]), main);
      assert.equal(f.git(["rev-parse", "HEAD^2"]), safe);
    },
  });
  assert.equal(f.remoteHead("main"), merged);
  assert.equal(f.remoteHead("uat"), f.initial);
  f.release();
  assert.equal(f.remoteHead("main"), merged);
});

test("release refuses dirty trees, wrong branches and existing Git operations", (t) => {
  const f = fixture(t);
  f.git(["switch", "main"]);
  assert.throws(() => f.release(), /uat branch/);
  f.git(["switch", "uat"]);
  writeFileSync(join(f.root, "uncommitted.txt"), "keep this");
  assert.throws(() => f.release(), /Commit or stash/);
  rmSync(join(f.root, "uncommitted.txt"));
  writeFileSync(join(f.root, ".git", "CHERRY_PICK_HEAD"), f.initial);
  assert.throws(() => f.release(), /existing Git operation/);
  assert.equal(f.remoteHead("main"), f.initial);
});

test("check mode never fetches, rebases, checks or pushes", (t) => {
  const f = fixture(t);
  const revision = f.commit("feature.txt");
  // A broken remote proves check mode does not attempt a network connection.
  f.git(["remote", "set-url", "origin", join(f.root, "missing.git")]);
  f.release({
    check: true,
    runChecks() {
      assert.fail("checks must not run");
    },
  });
  assert.equal(f.git(["rev-parse", "HEAD"]), revision);
  assert.equal(f.remoteHead("main"), f.initial);
});

test("failed validation never pushes production", (t) => {
  const f = fixture(t);
  f.commit("feature.txt");
  assert.throws(
    () =>
      f.release({
        runChecks() {
          throw new Error("build failed");
        },
      }),
    /build failed/,
  );
  assert.equal(f.remoteHead("main"), f.initial);
});

test("rebase conflicts preserve changes and stop before validation or push", (t) => {
  const f = fixture(t);
  f.git(["switch", "main"]);
  const main = f.commit("base.txt", "production change");
  f.git(["push", "origin", "main"]);
  f.git(["switch", "uat"]);
  f.commit("base.txt", "uat change");
  assert.throws(
    () =>
      f.release({
        runChecks() {
          assert.fail("checks must not run");
        },
      }),
    /git rebase failed/,
  );
  assert.equal(f.remoteHead("main"), main);
  assert.ok(existsSync(join(f.root, ".git", "rebase-merge")));
});

test("a concurrent main release or changed working tree stops publication", (t) => {
  const f = fixture(t);
  f.commit("feature.txt");
  assert.throws(
    () =>
      f.release({
        runChecks() {
          f.git(["switch", "main"]);
          const concurrent = f.commit("concurrent.txt");
          f.git(["push", "origin", "main"]);
          f.git(["switch", "uat"]);
          assert.equal(f.remoteHead("main"), concurrent);
        },
      }),
    /origin\/main changed/,
  );
  assert.ok(!existsSync(join(f.root, "concurrent.txt")));

  assert.throws(
    () =>
      f.release({
        runChecks() {
          writeFileSync(join(f.root, "uncommitted.txt"), "changed during build");
        },
      }),
    /Commit or stash/,
  );
  assert.notEqual(f.remoteHead("main"), f.git(["rev-parse", "HEAD"]));
});
