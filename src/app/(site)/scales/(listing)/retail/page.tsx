import { primaryScaleListingRoute } from "@/features/catalog/components/category-listing-route";

const route = primaryScaleListingRoute("retail");

export const { generateMetadata } = route;
export default route.Page;
