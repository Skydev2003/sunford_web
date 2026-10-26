import { Header } from "@/components/layout/header";
import { getSettings } from "../server/documents";
import { defaultNavigation, defaultNavigationExtras } from "../data/navigation";
import { defaultSite } from "../data/settings";
export async function SiteHeader() {
  const [navigation, site] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
  ]);
  return <Header items={navigation.items} extras={navigation} site={site} />;
}
