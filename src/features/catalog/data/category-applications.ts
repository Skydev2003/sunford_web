const labels = {
  scales: { label: "เลือกเครื่องชั่งตามการใช้งาน", shortLabel: "เลือกตามการใช้งาน" },
  indicators: {
    label: "เลือกอินดิเคเตอร์แท่นชั่งตามคุณสมบัติ",
    shortLabel: "เลือกตามคุณสมบัติ",
  },
  platforms: {
    label: "เลือกวัสดุและอุปกรณ์ร่วมของแท่นชั่ง",
    shortLabel: "เลือกวัสดุและอุปกรณ์ร่วม",
  },
  pos: { label: "เลือกระบบและอุปกรณ์ POS", shortLabel: "เลือกระบบและอุปกรณ์" },
};

export type CategoryApplicationId = keyof typeof labels;

export function hasCategoryApplications(id: string): id is CategoryApplicationId {
  return Object.hasOwn(labels, id);
}

export function categoryApplicationsLink(id: CategoryApplicationId) {
  return { href: `/products/category/${id}/applications`, ...labels[id] };
}

export function overviewGuideLinks(
  categoryId: CategoryApplicationId,
  links: readonly { href: string; label: string }[],
) {
  return links.map((link) =>
    link.href === `/products/category/${categoryId}` ? categoryApplicationsLink(categoryId) : link,
  );
}
