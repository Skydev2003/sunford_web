import "dotenv/config";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deploymentEnvironment, runDeployment } from "./lib/deploy.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) {
  console.error("Usage: bun run vercel-build [--check]");
  process.exit(1);
}

const git =
  process.env.VERCEL === "1"
    ? undefined
    : spawnSync("git", ["symbolic-ref", "--quiet", "--short", "HEAD"], {
        cwd: root,
        encoding: "utf8",
      });
let env;
try {
  env = deploymentEnvironment(process.env, git?.status === 0 ? git.stdout.trim() : undefined);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

console.log(`Deployment: ${env.DEPLOY_BRANCH} → ${env.APP_ENV}`);
if (args.includes("--check")) {
  console.log("Configuration passed. No migrations or build were run.");
  process.exit(0);
}

process.exitCode = runDeployment((script) => {
  console.log(`Running ${script}...`);
  const result = spawnSync(process.platform === "win32" ? "npm.cmd" : "npm", ["run", script], {
    cwd: root,
    stdio: "inherit",
    env,
  });
  if (result.error) console.error(`Unable to run ${script}. Check that npm is installed.`);
  return result;
}, env);
