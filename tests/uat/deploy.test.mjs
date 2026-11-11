import assert from "node:assert/strict";
import test from "node:test";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deploymentEnvironment, runDeployment } from "../../scripts/lib/deploy.mjs";

const valid = {
  DATABASE_URL: "postgresql://user:password@pool.example.com:6543/postgres",
  DIRECT_URL: "postgresql://user:password@pool.example.com:5432/postgres",
};

test("local deployments infer the environment only from main or uat", () => {
  assert.equal(deploymentEnvironment(valid, "main").APP_ENV, "production");
  assert.equal(deploymentEnvironment(valid, "uat").APP_ENV, "uat");
  for (const branch of ["feature/test", "NaThong", "MAIN", "__proto__", "", undefined]) {
    assert.throws(() => deploymentEnvironment(valid, branch), /branch must be main or uat/);
  }
  assert.throws(
    () => deploymentEnvironment({ ...valid, VERCEL_GIT_COMMIT_REF: "main" }, "feature/test"),
    /branch must be main or uat/,
  );
});

test("Vercel uses its linked branch with detached HEAD and rejects missing branch metadata", () => {
  for (const [branch, target] of [
    ["main", "production"],
    ["uat", "preview"],
    ["feature/test", "preview"],
  ]) {
    const env = deploymentEnvironment({
      ...valid,
      VERCEL: "1",
      VERCEL_ENV: target,
      VERCEL_GIT_COMMIT_REF: branch,
    });
    assert.equal(env.DEPLOY_BRANCH, branch);
    assert.equal(env.NODE_ENV, "production");
  }
  assert.throws(
    () => deploymentEnvironment({ ...valid, VERCEL: "1", VERCEL_ENV: "production" }, "main"),
    /branch must be main or uat/,
  );
  assert.throws(
    () =>
      deploymentEnvironment({
        ...valid,
        VERCEL: "1",
        VERCEL_ENV: "production",
        VERCEL_GIT_COMMIT_REF: "feature/test",
      }),
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

test("deployment stops immediately after a failed registry migration or build", () => {
  for (let failure = 0; failure < 2; failure++) {
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

test("CLI check validates both Vercel branches without touching the database", () => {
  for (const [branch, appEnv] of [
    ["main", "production"],
    ["uat", "uat"],
  ]) {
    const result = spawnSync(process.execPath, ["scripts/vercel-build.mjs", "--check"], {
      cwd: fileURLToPath(new URL("../../", import.meta.url)),
      encoding: "utf8",
      env: {
        ...process.env,
        ...valid,
        VERCEL: "1",
        VERCEL_GIT_COMMIT_REF: branch,
        APP_ENV: appEnv,
        VERCEL_ENV: appEnv === "production" ? "production" : "preview",
      },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /No migrations or build were run/);
  }
});

test("preview builds only build, without running migrations or seed", () => {
  const env = deploymentEnvironment({
    ...valid,
    DIRECT_URL: undefined,
    VERCEL: "1",
    VERCEL_ENV: "preview",
    VERCEL_GIT_COMMIT_REF: "feature/catalog",
  });
  assert.equal(env.APP_ENV, "uat");
  const called = [];
  assert.equal(
    runDeployment((script) => {
      called.push(script);
      return { status: 0 };
    }, env),
    0,
  );
  assert.deepEqual(called, ["build"]);
  assert.equal(
    runDeployment(() => ({ status: 9 }), env),
    9,
  );
});

test("Vercel rejects wrong target settings before any database mutation", () => {
  const cloud = { ...valid, VERCEL: "1", VERCEL_ENV: "production", VERCEL_GIT_COMMIT_REF: "main" };
  for (const invalid of [
    { VERCEL_ENV: "development" },
    { VERCEL_ENV: undefined },
    { APP_ENV: "uat" },
    { VERCEL_GIT_COMMIT_REF: "uat" },
    { DIRECT_URL: undefined },
    { VERCEL_ENV: "preview", APP_ENV: "production" },
  ])
    assert.throws(() => deploymentEnvironment({ ...cloud, ...invalid }));
  const called = [];
  runDeployment((script) => {
    called.push(script);
    return { status: 0 };
  }, deploymentEnvironment(cloud));
  assert.deepEqual(called, ["db:deploy", "build"]);
});
