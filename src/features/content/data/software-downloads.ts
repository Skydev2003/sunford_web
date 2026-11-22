const driveFile = (id: string) => `https://drive.google.com/file/d/${id}/view`;
const googlePlay = (id: string) => `https://play.google.com/store/apps/details?id=${id}`;

type Download = {
  platform: "Windows" | "Android" | "iOS";
  label: string;
  href: string;
  filename?: string;
};

export const softwareDownloadGroups: {
  id: string;
  name: string;
  products: { slug: string; name: string; downloads: Download[] }[];
}[] = [
  {
    id: "retail-software",
    name: "ค้าปลีก",
    products: [
      {
        slug: "sunford-rls1100",
        name: "SUNFORD RLS1100",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "RLS1000_SETUP_SUNFORD_2.0.0_T7.exe",
            href: driveFile("1ISol4SrRrs5PqUhQVpgoUtEZmz3CVlSe"),
          },
        ],
      },
      {
        slug: "sunford-rls1800",
        name: "SUNFORD RLS1800",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "517_RLS_SUNFORD_2.0.2.exe",
            href: driveFile("1F5d8ou7_pKoi9WWbMJDN0IEdW2r-ZjaM"),
          },
        ],
      },
      {
        slug: "sunford-pos-smart-retail",
        name: "SUNFORD SmartRetail POS",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "Sunford POS [Setup].exe",
            href: driveFile("1jy6LilI-KZR4a4OPTB-C34s0ZWqk2ta5"),
          },
          {
            platform: "Windows",
            label: "เปิดไฟล์ประกอบ SQL Server Express 2019",
            filename: "SQL2019-SSEI-Expr.exe",
            href: driveFile("1RKNriODmduC0w3aOcZhmj0f52Rbvacln"),
          },
        ],
      },
    ],
  },
  {
    id: "industrial-software",
    name: "อุตสาหกรรม",
    products: [
      {
        slug: "sunford-indus",
        name: "SUNFORD Connect INDUS 1.10",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดไฟล์ ZIP",
            filename: "SUNFORD Connect INDUST V.1.10.zip",
            href: driveFile("10V84MFRieSg8HwQG1-4I_0WTT7oe4WEo"),
          },
        ],
      },
      {
        slug: "sunford-lp50-label-printer",
        name: "LP Label Editor สำหรับ LP50",
        downloads: [
          {
            platform: "Windows",
            label: "เปิดตัวติดตั้ง",
            filename: "ScaleLabel-1.0.14.20200904.exe",
            href: driveFile("1PqrmTuq5CpOlncTFg9rJHUVCjGIZXkw5"),
          },
        ],
      },
      {
        slug: "sunford-we-weight",
        name: "WeWeigh",
        downloads: [
          { platform: "Android", label: "Google Play", href: googlePlay("com.weweighApp") },
        ],
      },
    ],
  },
  {
    id: "household-software",
    name: "ครัวเรือนและสุขภาพ",
    products: [
      {
        slug: "fitdays",
        name: "Fitdays",
        downloads: [
          { platform: "Android", label: "Google Play", href: googlePlay("cn.fitdays.fitdays") },
          {
            platform: "iOS",
            label: "App Store",
            href: "https://apps.apple.com/th/app/fitdays/id1434527961",
          },
        ],
      },
    ],
  },
];
