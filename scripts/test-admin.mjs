import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { spawn } from "node:child_process";
const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run test:admin -- admin@example.com");
  process.exit(1);
}
process.stdout.write("Admin password for tests (hidden): ");
const muted = new Writable({
  write(_chunk, _encoding, callback) {
    callback();
  },
});
const reader = createInterface({
  input: process.stdin,
  output: muted,
  terminal: Boolean(process.stdin.isTTY),
});
const password = await reader.question("");
reader.close();
process.stdout.write("\n");
const child = spawn(
  process.execPath,
  ["node_modules/@playwright/test/cli.js", "test", "tests/e2e/admin.spec.ts"],
  {
    stdio: "inherit",
    env: { ...process.env, ADMIN_TEST_EMAIL: email, ADMIN_TEST_PASSWORD: password },
  },
);
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
