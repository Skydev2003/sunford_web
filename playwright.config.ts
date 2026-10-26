import { defineConfig, devices } from "@playwright/test";
const isCI = Boolean(process.env.CI);
const ciPort = Number(process.env.PLAYWRIGHT_PORT ?? 3000);
if (!Number.isInteger(ciPort) || ciPort < 1 || ciPort > 65535) {
  throw new Error("PLAYWRIGHT_PORT must be a valid TCP port.");
}
const ciUrl = `http://127.0.0.1:${ciPort}`;
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? (isCI ? ciUrl : "http://127.0.0.1:3001"),
    trace: "retain-on-failure",
  },
  webServer: isCI
    ? {
        command: `npm run start -- --hostname 127.0.0.1 --port ${ciPort}`,
        url: ciUrl,
        reuseExistingServer: false,
        timeout: 120000,
      }
    : undefined,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: process.env.PLAYWRIGHT_CHANNEL },
    },
  ],
});
