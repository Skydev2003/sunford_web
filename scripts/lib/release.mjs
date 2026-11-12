import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const checks = [
  "lint",
  "format:check",
  "db:validate",
  "test:uat",
  "test:catalog",
  "build",
  "typecheck",
];

export function releaseProduction({ root, check = false, runChecks, log = console.log }) {
  function git(args, { allowFailure = false } = {}) {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    if (!allowFailure && (result.error || result.status !== 0)) {
      throw new Error(
        `git ${args[0]} failed.\n${result.stderr?.trim() || result.error?.message || ""}`,
      );
    }
    return result;
  }
  function assertReady() {
    const branch = git(["symbolic-ref", "--quiet", "--short", "HEAD"], { allowFailure: true });
    if (branch.status !== 0 || branch.stdout.trim() !== "uat")
      throw new Error("Run bun run deploy from the uat branch.");
    for (const state of [
      "rebase-merge",
      "rebase-apply",
      "MERGE_HEAD",
      "CHERRY_PICK_HEAD",
      "REVERT_HEAD",
    ]) {
      const path = git(["rev-parse", "--git-path", state]).stdout.trim();
      if (existsSync(resolve(root, path)))
        throw new Error("Finish or abort the existing Git operation before deploying.");
    }
    if (git(["status", "--porcelain"]).stdout.trim())
      throw new Error("Commit or stash all changes on uat before running bun run deploy.");
    git(["remote", "get-url", "origin"]);
  }

  assertReady();
  if (check) {
    log("Ready: fetch origin → sync uat → rebase onto origin/main → checks → push HEAD:main.");
    log("No fetch, rebase, checks, database writes or push were run.");
    return;
  }

  log("Fetching origin...");
  git(["fetch", "origin"]);
  git(["rev-parse", "--verify", "refs/remotes/origin/main"]);
  // Include teammates' UAT commits without force-pushing the shared UAT branch.
  // Preserve approved merges when the remote commits are already included.
  if (
    git(["rev-parse", "--verify", "refs/remotes/origin/uat"], { allowFailure: true }).status ===
      0 &&
    git(["merge-base", "--is-ancestor", "origin/uat", "HEAD"], { allowFailure: true }).status !== 0
  ) {
    log("Synchronizing uat with origin/uat...");
    git(["rebase", "origin/uat"]);
  }
  if (
    git(["merge-base", "--is-ancestor", "origin/main", "HEAD"], { allowFailure: true }).status !== 0
  ) {
    log("Rebasing uat onto origin/main...");
    git(["rebase", "origin/main"]);
  }
  assertReady();
  const revision = git(["rev-parse", "HEAD"]).stdout.trim();

  log("Checking the release with quotation writes disabled...");
  if (runChecks) {
    runChecks();
  } else {
    // Disable registry writes during validation. Product reads retain their read-only pool.
    const env = {
      ...process.env,
      DATABASE_URL: "",
      DIRECT_URL: "",
      QUOTATION_DATABASE_URL: "",
      SUPABASE_URL: "",
      APP_ENV: "ci",
      NEXT_TELEMETRY_DISABLED: "1",
    };
    for (const script of checks) {
      log(`Running ${script}...`);
      const result = spawnSync("bun", ["run", script], { cwd: root, env, stdio: "inherit" });
      if (result.error || result.status !== 0)
        throw new Error(`${script} failed. Production was not pushed.`);
    }
  }

  assertReady();
  if (git(["rev-parse", "HEAD"]).stdout.trim() !== revision)
    throw new Error("uat changed during validation. Run bun run deploy again.");
  // Re-check main after the build. A concurrent release must be rebased and tested again.
  git(["fetch", "origin", "main"]);
  if (
    git(["merge-base", "--is-ancestor", "origin/main", "HEAD"], { allowFailure: true }).status !== 0
  )
    throw new Error("origin/main changed during validation. Run bun run deploy again.");
  if (git(["rev-parse", "origin/main"]).stdout.trim() === revision) {
    log("main already has this revision. No new production deployment was triggered.");
    return;
  }
  git(["push", "origin", "HEAD:refs/heads/main"]);
  log(`Pushed ${revision.slice(0, 12)} to main. Vercel Git integration will deploy Production.`);
  log("Check Vercel deployment status and /api/health before considering the release live.");
}
