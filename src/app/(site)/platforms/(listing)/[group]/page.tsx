import { categoryListingRoute } from "@/features/catalog/components/category-listing-route";

const route = categoryListingRoute("platforms");

export const { generateStaticParams, generateMetadata } = route;

export default route.Page;
