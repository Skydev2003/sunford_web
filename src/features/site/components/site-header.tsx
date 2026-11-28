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
import { getProductNavigationCategories } from "@/features/catalog/server/product-repository";

export async function SiteHeader() {
  const [navigation, site, productCategories] = await Promise.all([
    getSettings("navigation", { items: defaultNavigation, ...defaultNavigationExtras }),
    getSettings("site", defaultSite),
    getProductNavigationCategories().catch(() => ({})),
  ]);
  const items = resolveNavigationItems(navigation.items);
  const disabledHrefs = [...getDisabledNavigationDestinations(items)];
  return (
    <PrimaryNavigation
      navigation={items}
      site={site}
      productCategories={productCategories}
      listingFeatures={getNavbarListingFeatures(disabledHrefs).catch(() => ({}))}
    />
  );
}
