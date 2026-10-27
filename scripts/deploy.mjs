import { fileURLToPath } from "node:url";
import { releaseProduction } from "./lib/release.mjs";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--check")) {
  console.error("Usage: bun run deploy [--check]");
  process.exit(1);
}
if (process.env.VERCEL === "1") {
  console.error("Use vercel-build on Vercel. Run bun run deploy locally from uat.");
  process.exit(1);
}

try {
  releaseProduction({
    root: fileURLToPath(new URL("../", import.meta.url)),
    check: args.includes("--check"),
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
