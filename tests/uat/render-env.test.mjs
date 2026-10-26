import assert from "node:assert/strict";
import test from "node:test";
import { validateRenderEnvironment } from "../../scripts/lib/render-env.mjs";

const valid = {
  APP_ENV: "uat",
  RENDER_GIT_BRANCH: "uat",
  DATABASE_URL: "postgresql://postgres.example:test-password@pool.example.com:6543/postgres",
  DIRECT_URL: "postgresql://postgres.example:test-password@pool.example.com:5432/postgres",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
};

test("UAT requires real configuration instead of silently deploying catalogue fixtures", () => {
  assert.deepEqual(validateRenderEnvironment(valid), []);
  assert.equal(validateRenderEnvironment({}).length, 5);
  assert.ok(validateRenderEnvironment({ ...valid, DATABASE_URL: "YOUR-PASSWORD" }).length);
  assert.ok(validateRenderEnvironment({ ...valid, SUPABASE_PUBLISHABLE_KEY: " " }).length);
});

test("deployment rejects the wrong branch and transaction pooler for migrations", () => {
  assert.ok(validateRenderEnvironment({ ...valid, RENDER_GIT_BRANCH: "main" }).length);
  assert.ok(validateRenderEnvironment({ ...valid, APP_ENV: "production" }).length);
  assert.ok(validateRenderEnvironment({ ...valid, DIRECT_URL: valid.DATABASE_URL }).length);
});

test("production deploys main while UAT keeps its own branch", () => {
  assert.deepEqual(
    validateRenderEnvironment({ ...valid, APP_ENV: "production", RENDER_GIT_BRANCH: "main" }),
    [],
  );
  assert.ok(
    validateRenderEnvironment({ ...valid, APP_ENV: "production", RENDER_GIT_BRANCH: "uat" }).length,
  );
  assert.ok(validateRenderEnvironment({ ...valid, APP_ENV: "ci" }).length);
});

test("invalid credentials and URLs never appear in configuration error logs", () => {
  const errors = validateRenderEnvironment({
    ...valid,
    DATABASE_URL: "https://private-credential.example/",
    DIRECT_URL: "broken-private-credential",
    SUPABASE_URL: "http://private-credential.example",
  });
  assert.equal(errors.length, 3);
  assert.ok(!JSON.stringify(errors).includes("private-credential"));
});
