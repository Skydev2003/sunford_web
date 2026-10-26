import "dotenv/config";
import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";
import { lanUatAddresses, nipHost, uatPort } from "./lib/lan-uat.mjs";

let addresses, port;
try {
  addresses = lanUatAddresses(networkInterfaces());
  port = uatPort(process.env.UAT_PORT);
  if (process.env.UAT_IP) {
    if (!addresses.includes(process.env.UAT_IP))
      throw new Error("UAT_IP must be a private IPv4 address assigned to this machine.");
    addresses = [process.env.UAT_IP];
  }
  if (!addresses.length)
    throw new Error("No LAN IPv4 address found. Connect to your team Wi-Fi/LAN first.");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

console.log("Sunford temporary LAN UAT (this computer must remain running):");
for (const address of addresses) {
  console.log(`  http://${nipHost(address)}:${port}`);
  console.log(`  Direct LAN fallback: http://${address}:${port}`);
}
console.log(
  "Only devices on the same LAN (or an explicitly configured VPN) can reach these private addresses.",
);
if (process.argv.includes("--check")) process.exit(0);
console.log(
  "Stop an existing next dev for this project first. No database migrations or seeds run automatically.",
);
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "dev", "--hostname", "0.0.0.0", "--port", String(port)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "development",
      APP_ENV: "uat",
      UAT_DEV_HOSTS: addresses.map(nipHost).join(","),
    },
  },
);
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.kill(signal));
server.once("error", () => {
  console.error("Unable to start LAN UAT.");
  process.exitCode = 1;
});
server.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal === "SIGTERM" || signal === "SIGINT" ? 0 : 1);
});
