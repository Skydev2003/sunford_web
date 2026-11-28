import { categoryListingRoute } from "@/features/catalog/components/category-listing-route";

const route = categoryListingRoute("accessories");

export const { generateStaticParams, generateMetadata } = route;

export default route.Page;
