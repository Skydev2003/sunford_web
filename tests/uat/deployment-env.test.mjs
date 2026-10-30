import assert from "node:assert/strict";
import test from "node:test";
import { validateDeploymentEnvironment } from "../../scripts/lib/deployment-env.mjs";

const valid = {
  APP_ENV: "uat",
  DEPLOY_BRANCH: "uat",
  DATABASE_URL: "postgresql://postgres.example:test-password@pool.example.com:6543/postgres",
  DIRECT_URL: "postgresql://postgres.example:test-password@pool.example.com:5432/postgres",
};

test("UAT requires real configuration instead of silently deploying catalogue fixtures", () => {
  assert.deepEqual(validateDeploymentEnvironment(valid), []);
  assert.equal(validateDeploymentEnvironment({}).length, 4);
  assert.ok(validateDeploymentEnvironment({ ...valid, DATABASE_URL: "YOUR-PASSWORD" }).length);
});

test("deployment rejects the wrong branch and transaction pooler for migrations", () => {
  assert.ok(validateDeploymentEnvironment({ ...valid, DEPLOY_BRANCH: "main" }).length);
  assert.ok(validateDeploymentEnvironment({ ...valid, APP_ENV: "production" }).length);
  assert.ok(validateDeploymentEnvironment({ ...valid, DIRECT_URL: valid.DATABASE_URL }).length);
});

test("production deploys main while UAT keeps its own branch", () => {
  assert.deepEqual(
    validateDeploymentEnvironment({ ...valid, APP_ENV: "production", DEPLOY_BRANCH: "main" }),
    [],
  );
  assert.ok(
    validateDeploymentEnvironment({ ...valid, APP_ENV: "production", DEPLOY_BRANCH: "uat" }).length,
  );
  assert.ok(validateDeploymentEnvironment({ ...valid, APP_ENV: "ci" }).length);
});

test("invalid credentials and URLs never appear in configuration error logs", () => {
  const errors = validateDeploymentEnvironment({
    ...valid,
    DATABASE_URL: "https://private-credential.example/",
    DIRECT_URL: "broken-private-credential",
    SUPABASE_URL: "http://private-credential.example",
  });
  assert.equal(errors.length, 3);
  assert.ok(!JSON.stringify(errors).includes("private-credential"));
});
