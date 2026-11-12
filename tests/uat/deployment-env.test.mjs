import assert from "node:assert/strict";
import test from "node:test";
import { validateDeploymentEnvironment } from "../../scripts/lib/deployment-env.mjs";

const valid = {
  APP_ENV: "uat",
  DEPLOY_BRANCH: "uat",
  QUOTATION_DATABASE_URL:
    "postgresql://writer:test-password@warehouse.example.com:5432/warehouse_db",
};

test("UAT requires real configuration instead of silently deploying catalogue fixtures", () => {
  assert.deepEqual(validateDeploymentEnvironment(valid), []);
  assert.equal(validateDeploymentEnvironment({}).length, 3);
  assert.ok(
    validateDeploymentEnvironment({ ...valid, QUOTATION_DATABASE_URL: "YOUR-PASSWORD" }).length,
  );
  const { QUOTATION_DATABASE_URL, ...withoutRegistry } = valid;
  assert.ok(
    validateDeploymentEnvironment({
      ...withoutRegistry,
      DATABASE_URL: QUOTATION_DATABASE_URL,
      DIRECT_URL: QUOTATION_DATABASE_URL,
    }).length,
  );
});

test("deployment rejects the wrong branch and transaction pooler for migrations", () => {
  assert.ok(validateDeploymentEnvironment({ ...valid, DEPLOY_BRANCH: "main" }).length);
  assert.ok(validateDeploymentEnvironment({ ...valid, APP_ENV: "production" }).length);
  assert.ok(
    validateDeploymentEnvironment({
      ...valid,
      QUOTATION_DATABASE_URL: valid.QUOTATION_DATABASE_URL.replace(":5432", ":6543"),
    }).length,
  );
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
    QUOTATION_DATABASE_URL: "https://private-credential.example/",
    DIRECT_URL: "broken-private-credential",
    SUPABASE_URL: "http://private-credential.example",
  });
  assert.equal(errors.length, 1);
  assert.ok(!JSON.stringify(errors).includes("private-credential"));
});
