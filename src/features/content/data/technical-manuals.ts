import { legacyPathCandidates } from "./public-paths.mjs";

export const technicalManualIndex = "/technical-specification";
export const technicalManualPath = (slug: string) => `${technicalManualIndex}/guides/${slug}`;

export const usageGuide = {
  label: "การใช้งานและการดูแลรักษาเครื่องชั่ง",
  href: technicalManualPath("basic-usage"),
};

export const productAdvice = [
  { label: "ห้องปฏิบัติการ", slug: "laboratory" },
  { label: "อุตสาหกรรม", slug: "industry" },
  { label: "พาณิชยกรรมและบริการ", slug: "retail" },
  { label: "ไลฟ์สไตล์", slug: "lifestyle" },
].map(({ label, slug }) => ({ label, href: technicalManualPath(slug) }));

export const installationGuides = [
  {
    label: "วิธีติดตั้งเครื่องชั่งพิมพ์ฉลากบาร์โค้ด RLS1100",
    href: technicalManualPath("rls1100"),
  },
  {
    label: "ตารางเตรียมข้อมูลสินค้า RLS1100 (XLSX)",
    href: "/downloads/manuals/rls1100-products.xlsx",
  },
  {
    label: "แม่แบบฉลาก RLS1100 (PDF)",
    href: "/downloads/manuals/rls1100-label.pdf",
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

export const technicalManualRedirects = [
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
