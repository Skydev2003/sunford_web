import { primaryScaleListingRoute } from "@/features/catalog/components/category-listing-route";

const route = primaryScaleListingRoute("household");

export const { generateMetadata } = route;
export default route.Page;
