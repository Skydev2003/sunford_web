import { legacyPathCandidates } from "./public-paths.mjs";

export const technicalManualIndex = "/technical-specification";
export const technicalManualPath = (slug: string) => `${technicalManualIndex}/guides/${slug}`;
export const guidebookChapterPath = (slug: string) =>
  `${technicalManualIndex}?guide=${encodeURIComponent(slug)}`;
export const guidebookBuyingGuideSlugs = [
  "scales",
  "indicators",
  "platforms",
  "pos",
  "accessories",
] as const;

export const usageGuide = {
  label: "การใช้งานและการดูแลรักษาเครื่องชั่ง",
  href: technicalManualPath("basic-usage"),
};

export const productAdvice = [
  { label: "ครัวเรือน", slug: "lifestyle" },
  { label: "การผลิต", slug: "industry" },
  { label: "คำนวณราคา", slug: "retail" },
  { label: "งานวิเคราะห์", slug: "laboratory" },
].map(({ label, slug }) => ({ label, href: technicalManualPath(slug) }));

export const installationGuides = [
  {
    label: "วิธีติดตั้งเครื่องชั่งพิมพ์ฉลากบาร์โค้ด RLS1100",
    href: technicalManualPath("rls1100"),
  },
  {
    label: "คู่มือออกแบบฉลากและสลิป LP50",
    href: technicalManualPath("lp50"),
  },
  {
    label: "คู่มือติดตั้ง SQL Server",
    href: technicalManualPath("sql-server"),
  },
];

const legacyManualRedirects = [
  ["/support/Usage", "basic-usage"],
  ["/support/Technical-assistance/laboratory", "laboratory"],
  ["/support/Technical-assistance/industrial", "industry"],
  ["/support/Technical-assistance/commercial", "retail"],
  ["/support/Technical-assistance/lifestyle-scales", "lifestyle"],
  ["/software/download/sunford-lp50-label-printer/settings", "lp50"],
  ["/software/download/sunford-pos-smart-retail/sql-server-settings", "sql-server"],
].flatMap(([path, slug]) =>
  [path, ...legacyPathCandidates(path)].map((source) => ({
    source,
    destination: technicalManualPath(slug),
    permanent: true,
  })),
);

export const technicalManualRedirects = [
  ...legacyManualRedirects,
  ...guidebookBuyingGuideSlugs.map((slug) => ({
    source: `/guides/${slug}`,
    destination: guidebookChapterPath(slug),
    permanent: true,
  })),
];
