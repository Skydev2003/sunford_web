import { categoryListingRoute } from "@/features/catalog/components/category-listing-route";

const route = categoryListingRoute("indicators");

export const { generateStaticParams, generateMetadata } = route;

export default route.Page;
