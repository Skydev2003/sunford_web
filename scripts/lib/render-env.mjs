// Errors name variables only: deployment logs must never include credentials.
export function validateRenderEnvironment(env) {
  const errors = [];
  if (env.APP_ENV !== "uat") errors.push("APP_ENV must be uat.");
  if (env.RENDER_GIT_BRANCH && env.RENDER_GIT_BRANCH !== "uat")
    errors.push("Deploy the uat branch only.");

  for (const name of ["DATABASE_URL", "DIRECT_URL", "SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]) {
    if (!env[name]?.trim() || env[name].includes("YOUR-PASSWORD"))
      errors.push(`Configure ${name} in Render Environment.`);
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
