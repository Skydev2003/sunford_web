import "dotenv/config";
import { spawnSync } from "node:child_process";
import { validateRenderEnvironment } from "./lib/render-env.mjs";

const errors = validateRenderEnvironment(process.env);
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

// The build reads products during prerendering, so apply committed migrations first.
// Never seed here: upserting the initial catalogue would overwrite admin edits.
for (const script of ["db:deploy", "build"]) {
  const result = spawnSync("npm", ["run", script], { stdio: "inherit", env: process.env });
  if (result.error || result.status !== 0) process.exit(result.status || 1);
}
