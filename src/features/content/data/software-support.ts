type SoftwareSupportPage = {
  slug: string;
  title: string;
  guide?: { href: string; label: string };
};

// Public route titles and migrated guides only. Downloads come from the verified directory.
export const softwareSupportPages: SoftwareSupportPage[] = [
  {
    slug: "sunford-pos-android",
    title: "SUNFORD POS ANDROID",
  },
  {
    slug: "sunford-pos-basic",
    title: "SUNFORD POS Basic",
  },
  {
    slug: "sunford-pos-smart-retail",
    title: "SUNFORD SmartRetail POS",
    guide: {
      href: "/technical-specification/guides/sql-server",
      label: "คู่มือติดตั้ง SQL Server",
    },
  },
  {
    slug: "sunford-rls1100",
    title: "SUNFORD RLS สำหรับรุ่น RLS1100",
    guide: {
      href: "/technical-specification/guides/rls1100",
      label: "คู่มือติดตั้ง RLS1100",
    },
  },
  {
    slug: "sunford-rls1800",
    title: "SUNFORD RLS สำหรับรุ่น RLS1800",
  },
  {
    slug: "sunford-we-weight",
    title: "SUNFORD WeWeigh",
  },
  {
    slug: "sunford-indus",
    title: "SUNFORD INDUS",
  },
  {
    slug: "sunford-drv",
    title: "SUNFORD DRV",
  },
  {
    slug: "sunford-lp50-label-printer",
    title: "SUNFORD LP50 Label Printer",
    guide: {
      href: "/technical-specification/guides/lp50",
      label: "คู่มือออกแบบฉลากและสลิป LP50",
    },
  },
  {
    slug: "fitdays",
    title: "SUNFORD FITDAYS",
  },
];

export function getSoftwareSupportPage(slug: string) {
  return softwareSupportPages.find((page) => page.slug === slug);
}
