const news = {
  path: "/news-and-activities",
  title: "ข่าวสารและกิจกรรม",
} as const;

const articles = {
  path: "/business/blogs/editorial",
  title: "บทความจากซันฟอร์ด",
} as const;

export const editorialUnavailable = "ยังไม่มีข่าวหรือบทความที่เผยแพร่บนเว็บไซต์";

export function getEditorialSection(path: string) {
  if (path === news.path) return news;
  if (path === articles.path || path === "/blogs/editorial" || path === "/business") {
    return articles;
  }
  return undefined;
}
