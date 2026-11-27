import assert from "node:assert/strict";
import test from "node:test";
import { footerLegalLinks, footerNavigation } from "../../src/features/site/data/footer-navigation";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";

test("the Navbar and Footer deduplicate submenu choices and keep consistent labels outside the approved menu overrides", () => {
  const menus = getPrimaryNavigationItems(defaultNavigation);
  const footer = [
    ...footerNavigation.flatMap<{ href: string; label: string }>((group) => group.links),
    ...footerLegalLinks,
  ];
  const byDestination = new Map<string, Set<string>>();
  for (const menu of menus) {
    const submenu = [...menu.links, ...(menu.groups ?? []).flatMap((group) => group.links)].filter(
      ({ href }) => href,
    );
    assert.equal(submenu.length, new Set(submenu.map(({ href }) => href)).size, menu.label);
    for (const { href, label } of [menu, ...submenu]) {
      const labels = byDestination.get(href) ?? new Set<string>();
      labels.add(label);
      byDestination.set(href, labels);
    }
  }

  for (const { href, label } of footer) byDestination.get(href)?.add(label);
  const menuOverrides = [
    ["/products/category/indicators", "อินดิเคเตอร์"],
    ["/solution/mes", "ระบบ MES"],
    [
      "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6",
      "เลือกซื้ออินดิเคเตอร์",
    ],
    [
      "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6",
      "เลือกซื้ออุปกรณ์เสริม",
    ],
    ["/service/quotation", "ใบเสนอราคา"],
    ["/service", "บริการหลังการขาย"],
    ["https://sunfordshop.com/", "เลือกซื้อสินค้า"],
  ] as const;
  for (const [href, label] of menuOverrides)
    assert.ok(byDestination.get(href)?.delete(label), href);
  for (const [href, labels] of byDestination) assert.equal(labels.size, 1, href);
  assert.ok(
    footer.some(
      ({ href, label }) => href === "/software/download" && label === "ดาวน์โหลดซอฟต์แวร์",
    ),
  );
});
