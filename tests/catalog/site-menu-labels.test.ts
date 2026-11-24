import assert from "node:assert/strict";
import test from "node:test";
import { footerLegalLinks, footerNavigation } from "../../src/features/site/data/footer-navigation";
import { defaultNavigation } from "../../src/features/site/data/navigation";
import { getPrimaryNavigationItems } from "../../src/features/site/data/primary-navigation";

test("the Navbar and Footer use one label per destination and deduplicate submenu choices", () => {
  const menus = getPrimaryNavigationItems(defaultNavigation);
  const footer = [
    ...footerNavigation.flatMap<{ href: string; label: string }>((group) => group.links),
    ...footerLegalLinks,
  ];
  const byDestination = new Map<string, Set<string>>();
  for (const menu of menus) {
    const submenu = [...menu.links, ...(menu.groups ?? []).flatMap((group) => group.links)];
    assert.equal(submenu.length, new Set(submenu.map(({ href }) => href)).size, menu.label);
    for (const { href, label } of [menu, ...submenu]) {
      const labels = byDestination.get(href) ?? new Set<string>();
      labels.add(label);
      byDestination.set(href, labels);
    }
  }

  for (const { href, label } of footer) byDestination.get(href)?.add(label);
  for (const [href, labels] of byDestination) assert.equal(labels.size, 1, href);
  assert.deepEqual([...byDestination.get("/software/download")!], ["ดาวน์โหลดซอฟต์แวร์"]);
  assert.deepEqual(
    [...byDestination.get("/software/download#retail-software")!],
    ["ดาวน์โหลดซอฟต์แวร์ POS"],
  );
});
