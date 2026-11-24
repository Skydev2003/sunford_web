import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { getNavbarListingFeatures } from "@/features/catalog/server/navbar-listing-features";
import { getSettings } from "../server/documents";
import {
  defaultNavigation,
  defaultNavigationExtras,
  resolveNavigationItems,
} from "../data/navigation";
import { defaultSite } from "../data/settings";
import { getDisabledNavigationDestinations } from "../data/primary-navigation";

export async function SiteHeader() {
  const [navigation, site] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
  ]);
  const items = resolveNavigationItems(navigation.items);
  const disabledHrefs = [...getDisabledNavigationDestinations(items)];
  return (
    <PrimaryNavigation
      navigation={items}
      site={site}
      listingFeatures={getNavbarListingFeatures(disabledHrefs).catch(() => ({}))}
    />
  );
}
