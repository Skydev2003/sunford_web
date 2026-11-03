import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";

test("real background tabs pause video without Playwright's forced focus", async ({
  playwright,
  baseURL,
}) => {
  const profile = await mkdtemp(join(tmpdir(), "sunford-hero-tab-"));
  const executable =
    process.platform === "win32"
      ? join(process.env.PROGRAMFILES!, "Google/Chrome/Application/chrome.exe")
      : playwright.chromium.executablePath();
  const child = spawn(
    executable,
    [
      `--user-data-dir=${profile}`,
      "--remote-debugging-port=0",
      "--no-first-run",
      "--no-default-browser-check",
      "--headless=new",
      "--window-position=-10000,-10000",
      "--window-size=1440,900",
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  let browser: Awaited<ReturnType<typeof playwright.chromium.connectOverCDP>> | undefined;
  try {
    let port = "";
    await expect
      .poll(async () => {
        port = await readFile(join(profile, "DevToolsActivePort"), "utf8")
          .then((text) => text.split(/\r?\n/)[0])
          .catch(() => "");
        return port;
      })
      .not.toBe("");
    // Unlike a second CDP session, noDefaults removes the controller's focus override itself.
    browser = await playwright.chromium.connectOverCDP(`http://127.0.0.1:${port}`, {
      noDefaults: true,
    });
    const context = browser.contexts()[0];
    const page = context.pages()[0];
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(baseURL!);
    await page.bringToFront();
    await expect(page.locator("[data-brand-opening]")).toHaveAttribute("data-phase", "complete", {
      timeout: 15000,
    });
    const scene = page.locator("[data-hero-scene]");
    await test.info().attach("native-initial-state.json", {
      body: JSON.stringify(
        await page.evaluate(() => ({
          visibility: document.visibilityState,
          focus: document.hasFocus(),
          reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
          bounds: document.querySelector("[data-hero-scene]")?.getBoundingClientRect().toJSON(),
          viewport: [innerWidth, innerHeight],
        })),
      ),
      contentType: "application/json",
    });
    await expect(scene).toHaveAttribute("data-running", "true");
    const other = await context.newPage();
    await other.bringToFront();
    await expect.poll(() => page.evaluate(() => document.visibilityState)).toBe("hidden");
    await expect(scene).toHaveAttribute("data-running", "false");
    const video = scene.locator("video");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.bringToFront();
    await expect(scene).toHaveAttribute("data-running", "true");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);
  } finally {
    if (browser) {
      const session = await browser.newBrowserCDPSession();
      await session.send("Browser.close").catch(() => {});
      await browser.close();
    }
    if (child.exitCode === null) child.kill();
    const target = await realpath(profile);
    if (
      dirname(target) === (await realpath(tmpdir())) &&
      basename(target).startsWith("sunford-hero-tab-")
    )
      await rm(target, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
});
