import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deploymentEnvironment, runDeployment } from "../../scripts/lib/deploy.mjs";

const valid = {
  DATABASE_URL: "postgresql://user:password@pool.example.com:6543/postgres",
  DIRECT_URL: "postgresql://user:password@pool.example.com:5432/postgres",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
};

test("local deployments infer the environment only from main or uat", () => {
  assert.equal(deploymentEnvironment(valid, "main").APP_ENV, "production");
  assert.equal(deploymentEnvironment(valid, "uat").APP_ENV, "uat");
  for (const branch of ["feature/test", "NaThong", "MAIN", "__proto__", "", undefined]) {
    assert.throws(() => deploymentEnvironment(valid, branch), /branch must be main or uat/);
  }
  assert.throws(
    () => deploymentEnvironment({ ...valid, RENDER_GIT_BRANCH: "main" }, "feature/test"),
    /branch must be main or uat/,
  );
});

test("Render uses its linked branch with detached HEAD and rejects missing branch metadata", () => {
  for (const branch of ["main", "uat"]) {
    const env = deploymentEnvironment({ ...valid, RENDER: "true", RENDER_GIT_BRANCH: branch });
    assert.equal(env.RENDER_GIT_BRANCH, branch);
    assert.equal(env.NODE_ENV, "production");
  }
  assert.throws(
    () => deploymentEnvironment({ ...valid, RENDER: "true" }, "main"),
    /branch must be main or uat/,
  );
  assert.throws(
    () => deploymentEnvironment({ ...valid, RENDER: "true", RENDER_GIT_BRANCH: "feature/test" }),
    /branch must be main or uat/,
  );
});

test("deployment rejects mismatched environments and missing credentials before running steps", () => {
  assert.throws(
    () => deploymentEnvironment({ ...valid, APP_ENV: "production" }, "uat"),
    /Deploy the main branch/,
  );
  assert.throws(
    () => deploymentEnvironment({ ...valid, APP_ENV: "uat" }, "main"),
    /Deploy the uat branch/,
  );
  assert.throws(() => deploymentEnvironment({}, "main"), /Configure DATABASE_URL/);
});

test("deployment stops immediately after a failed migration, seed or build", () => {
  for (let failure = 0; failure < 3; failure++) {
    const called = [];
    assert.equal(
      runDeployment((script) => {
        called.push(script);
        return { status: called.length === failure + 1 ? 7 : 0 };
      }),
      7,
    );
    assert.equal(called.length, failure + 1);
  }
  assert.equal(
    runDeployment(() => ({ error: new Error("spawn failed"), status: null })),
    1,
  );
  assert.equal(
    runDeployment(() => ({ status: 0 })),
    0,
  );
});

test("CLI check validates both Render branches without touching the database", () => {
  for (const [branch, appEnv] of [
    ["main", "production"],
    ["uat", "uat"],
  ]) {
    const result = spawnSync(process.execPath, ["scripts/deploy.mjs", "--check"], {
      cwd: fileURLToPath(new URL("../../", import.meta.url)),
      encoding: "utf8",
      env: {
        ...process.env,
        ...valid,
        RENDER: "true",
        RENDER_GIT_BRANCH: branch,
        APP_ENV: appEnv,
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /No migrations, seed or build were run/);
  }
});
