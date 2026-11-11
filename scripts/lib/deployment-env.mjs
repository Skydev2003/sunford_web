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
  const required = ["DATABASE_URL"];
  if (!preview) required.push("DIRECT_URL");
  for (const name of required) {
    if (!env[name]?.trim() || env[name].includes("YOUR-PASSWORD"))
      errors.push(`Configure ${name} in the deployment environment variables.`);
  }
  for (const name of ["DATABASE_URL", "DIRECT_URL"]) {
    if (!env[name]) continue;
    try {
      const url = new URL(env[name]);
      if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.username || !url.password)
        throw new Error();
      if (name === "DIRECT_URL" && url.port === "6543")
        errors.push("DIRECT_URL must use the session pooler (5432) or a direct connection.");
    } catch {
      errors.push(`${name} must be a PostgreSQL connection URL with credentials.`);
    }
  }
  if (env.SUPABASE_URL) {
    try {
      const url = new URL(env.SUPABASE_URL);
      if (url.protocol !== "https:" || url.username || url.password) throw new Error();
    } catch {
      errors.push("SUPABASE_URL must be an HTTPS project URL.");
    }
  }
  return errors;
}
