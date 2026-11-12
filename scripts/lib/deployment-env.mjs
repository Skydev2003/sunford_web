// Errors name variables only: deployment logs must never include credentials.
export function validateDeploymentEnvironment(env) {
  const errors = [];
  const preview = env.VERCEL === "1" && env.VERCEL_ENV === "preview";
  if (env.VERCEL === "1" && !["production", "preview"].includes(env.VERCEL_ENV))
    errors.push("VERCEL_ENV must be production or preview for a deployment build.");
  const expectedBranch =
    env.APP_ENV === "production" ? "main" : env.APP_ENV === "uat" ? "uat" : undefined;
  if (!expectedBranch) errors.push("APP_ENV must be uat or production.");
  if (!env.DEPLOY_BRANCH || (!preview && !["main", "uat"].includes(env.DEPLOY_BRANCH)))
    errors.push("Deployment branch must be main or uat; detached HEAD is not allowed.");
  if (!preview && expectedBranch && env.DEPLOY_BRANCH && env.DEPLOY_BRANCH !== expectedBranch)
    errors.push(`Deploy the ${expectedBranch} branch for this environment.`);
  if (env.VERCEL === "1" && env.APP_ENV !== (preview ? "uat" : "production"))
    errors.push("APP_ENV must match the Vercel target: production or uat for preview.");

  // These credentials belong to the quotation registry; site content is local.
  const required = ["QUOTATION_DATABASE_URL"];
  for (const name of required) {
    if (!env[name]?.trim() || env[name].includes("YOUR-PASSWORD"))
      errors.push(`Configure ${name} in the deployment environment variables.`);
  }
  for (const name of required) {
    if (!env[name]) continue;
    try {
      const url = new URL(env[name]);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.username || !url.password)
        throw new Error();
      if (url.port === "6543")
        errors.push("QUOTATION_DATABASE_URL must use a session pooler or direct connection.");
    } catch {
      errors.push(`${name} must be a PostgreSQL connection URL with credentials.`);
    }
  }
  return errors;
}
