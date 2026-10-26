import "dotenv/config";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { deploymentEnvironment, runDeployment } from "./lib/deploy.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) {
  console.error("Usage: bun run deploy [--check]");
  process.exit(1);
}

const git =
  process.env.RENDER === "true"
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

console.log(`Deployment: ${env.RENDER_GIT_BRANCH} → ${env.APP_ENV}`);
if (args.includes("--check")) {
  console.log("Configuration passed. No migrations, seed or build were run.");
  process.exit(0);
}

process.exitCode = runDeployment((script) => {
  console.log(`Running ${script}...`);
  const result = spawnSync("bun", ["run", script], { cwd: root, stdio: "inherit", env });
  if (result.error) console.error(`Unable to run ${script}. Check that Bun is installed.`);
  return result;
});
