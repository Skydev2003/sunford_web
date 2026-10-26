import "dotenv/config";
import { spawnSync } from "node:child_process";
import { validateRenderEnvironment } from "./lib/render-env.mjs";

const errors = validateRenderEnvironment(process.env);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

// The build reads products during prerendering, so apply committed migrations first.
// Seed now inserts missing IDs only, retaining all edits, drafts and deleted rows.
if (!process.env.npm_execpath) {
  console.error("Run this script with npm run render:build.");
  process.exit(1);
}
for (const script of ["db:deploy", "db:seed", "build"]) {
  const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", script], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
