import { PrimaryNavigation } from "@/components/layout/primary-navigation";
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
  return <PrimaryNavigation navigation={items} site={site} />;
}
