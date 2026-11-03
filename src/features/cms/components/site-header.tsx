import { Header } from "@/components/layout/header";
import { getSettings } from "../server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "../data/navigation";
import { defaultSite } from "../data/settings";

export async function SiteHeader() {
  const [navigation, site] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
  ]);
  const items = resolveNavigationItems(navigation.items);
  return (
    <Header
      items={items}
      extras={{
        exploreLabel: navigation.exploreLabel,
        exploreLinks: navigation.exploreLinks,
        helpLabel: navigation.helpLabel,
        helpLinks: navigation.helpLinks,
        mobileLinks: defaultNavigationExtras.mobileLinks,
      }}
      site={site}
    />
  );
}
