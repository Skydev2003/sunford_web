import { expect, test } from "@playwright/test";

test("public editorial entry points offer real destinations without unpublished cards", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/");
  const stories = page.locator("#stories");
  await expect(stories.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(stories.locator(".stories-track")).toBeVisible();
  await expect(stories.locator('a[href^="/blogs/editorial/"]')).toHaveCount(0);
  await expect(stories.getByRole("link", { name: "ดูงานทุกประเภท" })).toHaveAttribute(
    "href",
    "/products/category/scales/applications",
  );

  const card = stories.locator(':scope .stories-track > a[data-focus-copy="1"]').first();
  const groupTitle = await card.getByRole("heading").textContent();
  const application = await card.getAttribute("href");
  expect(application).toMatch(/^\/products\/category\/scales\/applications\/[^/]+$/);
  await page.goto(application!);
  await expect(
    page.getByRole("heading", { name: groupTitle!, exact: true, level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("list", { name: "เครื่องชั่งสำหรับงานนี้" })).toBeVisible();

  for (const [path, title] of [
    ["/news-and-activities", "ข่าวสารและกิจกรรม"],
    ["/business/blogs/editorial", "บทความจากซันฟอร์ด"],
  ]) {
    await page.goto(path);
    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: title, exact: true, level: 1 })).toBeVisible();
    await expect(main.getByRole("link", { name: "ดูแค็ตตาล็อกสินค้า" })).toHaveAttribute(
      "href",
      "/products",
    );
    await expect(main.getByRole("link", { name: "ดูข้อมูลทางเทคนิคและคู่มือ" })).toHaveAttribute(
      "href",
      "/technical-specification",
    );
    await expect(main).toContainText("ยังไม่มีข่าวหรือบทความที่เผยแพร่บนเว็บไซต์");
    await expect(main.locator(".directory-card")).toHaveCount(0);
  }

  await page.goto("/explore");
  const directory = page.getByRole("main");
  await directory.getByRole("button", { name: "เรื่องราวและข่าวสาร" }).click();
  await expect(directory.getByRole("link", { name: /บทความจากซันฟอร์ด/ })).toHaveAttribute(
    "href",
    "/business/blogs/editorial",
  );
  await expect(directory.locator('.directory-card[href^="/blogs/editorial/"]')).toHaveCount(0);

  const retired = await page.goto("/blogs/editorial/do-you-need-a-home-scale");
  await expect(page.getByRole("heading", { name: "ยังไม่พบหน้าที่คุณกำลังมองหา" })).toBeVisible();
  if (retired?.status() !== 404) {
    await expect(page.locator('meta[name="robots"][content="noindex"]').first()).toBeAttached();
  }
});
