import { validateDeploymentEnvironment } from "./deployment-env.mjs";

export function deploymentEnvironment(env, localBranch) {
  // Git deployments use provider metadata because their checkout can be detached.
  // Local releases continue to inspect Git rather than trusting cloud metadata.
  const branch = env.VERCEL === "1" ? env.VERCEL_GIT_COMMIT_REF : localBranch;
  const appEnv =
    env.VERCEL === "1"
      ? env.VERCEL_ENV === "preview"
        ? "uat"
        : "production"
      : branch === "main"
        ? "production"
        : branch === "uat"
          ? "uat"
          : undefined;
  const deploymentEnv = {
    ...env,
    DEPLOY_BRANCH: branch,
    APP_ENV: env.APP_ENV || appEnv,
    NODE_ENV: "production",
  };
  const errors = validateDeploymentEnvironment(deploymentEnv);
  if (errors.length) throw new Error(errors.join("\n"));
  return deploymentEnv;
}

export function runDeployment(runScript, env) {
  // Prerendering reads the database, so apply migrations before seeding/building.
  // Preview builds never migrate or seed a database on branch/PR pushes.
  const scripts =
    env?.VERCEL === "1" && env.VERCEL_ENV === "preview"
      ? ["build"]
      : ["db:deploy", "db:seed", "build"];
  for (const script of scripts) {
    const result = runScript(script);
    if (result.error || result.status !== 0) return result.status || 1;
  }
  return 0;
}
