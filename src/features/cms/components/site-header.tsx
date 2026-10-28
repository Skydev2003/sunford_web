import { Header } from "@/components/layout/header";
import { getSettings } from "../server/documents";
import { defaultNavigation, defaultNavigationExtras } from "../data/navigation";
import { defaultSite } from "../data/settings";
export async function SiteHeader() {
  const [navigation, site] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
  ]);
  // Older saved menus predate the service page. Keep their other links and
  // ordering while making the after-sales destination available there too.
  const items = navigation.items.map((item) => {
    const links = item.links.map((link) =>
      link.label === "บริการหลังการขาย" ? { ...link, href: "/service" } : link,
    );
    if (item.href === "/#support" && !links.some((link) => link.href === "/service")) {
      links.splice(1, 0, { label: "บริการหลังการขาย", href: "/service" });
    }
    return { ...item, links };
  });
  const mobileLinks = navigation.mobileLinks.map((link) =>
    link.label === "บริการหลังการขาย" ? { ...link, href: "/service" } : link,
  );
  if (!mobileLinks.some((link) => link.href === "/service")) {
    mobileLinks.push({ label: "บริการหลังการขาย", href: "/service" });
  }
  return <Header items={items} extras={{ ...navigation, mobileLinks }} site={site} />;
}
