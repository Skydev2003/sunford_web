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
    const columns = [menu.links, ...(menu.groups ?? []).map(({ links }) => links)];
    for (const column of columns) {
      const destinations = column
        .filter(
          ({ href, label }) =>
            menu.href !== "/pos" || href !== "/service?section=contact" || label === "ติดต่อเรา",
        )
        .map(({ href }) => href)
        .filter(Boolean);
      assert.equal(destinations.length, new Set(destinations).size, menu.label);
    }
    const submenu = columns.flat().filter(({ href }) => href);
    for (const { href, label } of [menu, ...submenu]) {
      const labels = byDestination.get(href) ?? new Set<string>();
      labels.add(label);
      byDestination.set(href, labels);
    }
  }

  for (const { href, label } of footer) byDestination.get(href)?.add(label);
  const menuOverrides = [
    ["/platforms/indicators", "อินดิเคเตอร์"],
    ["/platforms", "แท่นชั่ง"],
    ["/mes", "ระบบ MES"],
    ["/scales/retail", "เครื่องชั่งร้านค้าทั่วไป"],
    ["/scales/industrial", "เครื่องชั่งอุตสาหกรรม"],
    ["/scales/household", "เครื่องชั่งขนาดเล็ก"],
    ["/platforms/custom-spec", "เครื่องชั่งประกอบเอง"],
    ["/platforms/custom-spec", "เลือกแท่นชั่งเพื่อประกอบ"],
    ["/scales/custom-spec", "ขอใบเสนอราคา"],
    ["/scales/custom-spec", "เลือกเครื่องชั่งเพื่อประกอบ"],
    ["/service?section=contact", "ให้คำปรึกษาแนะนำ"],
    ["/service?section=contact", "ทดลองใช้งานจริง"],
    ["/service/warranty/policy", "เงื่อนไขการรับประกัน"],
    [
      "https://sunfordshop.com/%E0%B8%AA%E0%B8%B4%E0%B8%99%E0%B8%84%E0%B9%89%E0%B8%B2/?sort=6",
      "เลือกซื้ออินดิเคเตอร์",
    ],
    ["/service", "บริการหลังการขาย"],
  ] as const;
  for (const [href, label] of menuOverrides)
    assert.ok(byDestination.get(href)?.delete(label), href);
  for (const [href, labels] of byDestination) assert.equal(labels.size, 1, href);
  assert.ok(
    footer.some(({ href, label }) => href === "/software" && label === "ดาวน์โหลดซอฟต์แวร์"),
  );
});
