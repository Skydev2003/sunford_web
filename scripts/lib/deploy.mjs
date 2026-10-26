import { validateRenderEnvironment } from "./render-env.mjs";

export function deploymentEnvironment(env, localBranch) {
  // Render checks out a commit with a detached HEAD and supplies its linked branch.
  // Locally, always inspect Git rather than trusting a leftover Render variable.
  const branch = env.RENDER === "true" ? env.RENDER_GIT_BRANCH : localBranch;
  const appEnv = branch === "main" ? "production" : branch === "uat" ? "uat" : undefined;
  const deploymentEnv = {
    ...env,
    RENDER_GIT_BRANCH: branch,
    APP_ENV: env.APP_ENV || appEnv,
    NODE_ENV: "production",
  };
  const errors = validateRenderEnvironment(deploymentEnv);
  if (errors.length) throw new Error(errors.join("\n"));
  return deploymentEnv;
}

export function runDeployment(runScript) {
  // Prerendering reads the database, so apply migrations before seeding/building.
  for (const script of ["db:deploy", "db:seed", "build"]) {
    const result = runScript(script);
    if (result.error || result.status !== 0) return result.status || 1;
  }
  return 0;
}
