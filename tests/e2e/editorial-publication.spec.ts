import { expect, test } from "@playwright/test";
import { featuredEditorialArticles } from "../../src/features/content/data/editorial-sections";
import { sectionPagePath } from "../../src/features/site/data/main-page-paths";

test("public editorial entry points offer real destinations without unpublished cards", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto("/");
  const stories = page.locator("#stories");
  await expect(stories.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(stories.locator(".stories-track")).toBeVisible();
  await expect(stories.getByRole("link", { name: "ดูเรื่องราวทั้งหมด" })).toHaveAttribute(
    "href",
    "/service/articles",
  );

  const cards = stories.locator(
    '.stories-track > a[data-focus-copy="1"][href^="/service/articles/"]',
  );
  await expect(cards).toHaveCount(9);
  const headings = await cards.locator("h3").allTextContents();
  for (const [index, { path }] of featuredEditorialArticles.entries()) {
    const card = cards.nth(index);
    const destination = sectionPagePath(path);
    await expect(card).toHaveAttribute("href", destination);
    const [article] = await Promise.all([page.waitForEvent("popup"), card.press("Enter")]);
    await expect(article).toHaveURL(new URL(destination, page.url()).href);
    await expect(
      article.getByRole("heading", { name: headings[index], exact: true, level: 1 }),
    ).toBeVisible();
    await expect(article.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(article.locator("main article p").first()).toBeVisible();
    await article.close();
  }

  await stories.getByRole("link", { name: "ดูเรื่องราวทั้งหมด" }).click();
  await expect(page.getByRole("heading", { name: "บทความจากซันฟอร์ด", level: 1 })).toBeVisible();
  await expect(page.locator("main .directory-card h2")).toHaveText(headings);

  await page.goto("/news-and-activities");
  const news = page.getByRole("main");
  await expect(news.getByRole("heading", { name: "ข่าวสารและกิจกรรม", level: 1 })).toBeVisible();
  await expect(news).toContainText("ยังไม่มีข่าวหรือบทความที่เผยแพร่บนเว็บไซต์");
  await expect(news.locator(".directory-card")).toHaveCount(0);

  await page.goto("/explore");
  const directory = page.getByRole("main");
  await directory.getByRole("button", { name: "เรื่องราวและข่าวสาร" }).click();
  await expect(directory.getByRole("link", { name: /บทความจากซันฟอร์ด/ })).toHaveAttribute(
    "href",
    "/service/articles",
  );
  for (const { path } of featuredEditorialArticles)
    await expect(
      directory.locator(`.directory-card[href="${sectionPagePath(path)}"]`),
    ).toBeVisible();

  const retired = await page.goto("/service/articles/scale-power-and-battery-troubleshooting");
  await expect(page.getByRole("heading", { name: "ยังไม่พบหน้าที่คุณกำลังมองหา" })).toBeVisible();
  if (retired?.status() !== 404) {
    await expect(page.locator('meta[name="robots"][content="noindex"]').first()).toBeAttached();
  }
});
