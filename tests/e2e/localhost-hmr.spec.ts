import { expect, test } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

test.skip(
  process.env.LOCALHOST_DEV_QA !== "1",
  "Requires an explicitly selected development server",
);

for (const host of ["localhost", "127.0.0.1"]) {
  test(`${host} opens HMR and hydrates the actual builder`, async ({ page }) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://${host}:3000/guides/indicator-platform-compatibility`);
    const connected = await page.evaluate(
      () =>
        new Promise<boolean>((done) => {
          const url = new URL("/_next/hmr", location.href);
          url.protocol = "ws:";
          const socket = new WebSocket(url);
          const timer = setTimeout(() => {
            socket.close();
            done(false);
          }, 5000);
          socket.onopen = () => {
            clearTimeout(timer);
            socket.close();
            done(true);
          };
          socket.onerror = () => {
            clearTimeout(timer);
            done(false);
          };
        }),
    );
    expect(connected).toBe(true);
    await page.getByRole("button", { name: "เลือก Indicator-AW31", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "เลือก TMS-60-AW31", exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("actual source hot update and restoration retain the selected head", async ({ page }) => {
  test.skip(
    process.env.LOCALHOST_HMR_MUTATION !== "1",
    "Requires explicit temporary source-probe opt-in",
  );
  test.setTimeout(90000);
  const sourcePath = resolve("src/features/content/components/weighing-builder.tsx");
  const original = await readFile(sourcePath);
  const before = "<h2>ชุดที่เลือก</h2>";
  const after = "<h2>ชุดที่เลือก HMR-check</h2>";
  expect(original.toString().split(before)).toHaveLength(2);
  const modified = Buffer.from(original.toString().replace(before, after));
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://localhost:3000/guides/indicator-platform-compatibility");
  await page.getByRole("button", { name: "เลือก Indicator-AW31", exact: true }).click();
  await expect(page.getByRole("button", { name: "เลือก TMS-60-AW31", exact: true })).toBeVisible();
  try {
    await writeFile(sourcePath, modified);
    await expect(
      page.getByRole("heading", { name: "ชุดที่เลือก HMR-check", exact: true }),
    ).toBeVisible({ timeout: 30000 });
    await expect(page.locator("main aside")).toContainText("Indicator-AW31");
  } finally {
    const current = await readFile(sourcePath);
    if (current.equals(modified)) await writeFile(sourcePath, original);
    else
      expect(current.equals(original), "Source changed outside this HMR probe; preserve it").toBe(
        true,
      );
  }
  await expect(page.getByRole("heading", { name: "ชุดที่เลือก", exact: true })).toBeVisible({
    timeout: 30000,
  });
  await expect(page.locator("main aside")).toContainText("Indicator-AW31");
  await expect(page.getByRole("button", { name: "เลือก TMS-60-AW31", exact: true })).toBeVisible();
  expect(await readFile(sourcePath)).toEqual(original);
  expect(errors).toEqual([]);
});
