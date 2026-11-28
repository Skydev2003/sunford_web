import type { ReactNode } from "react";
import { CategoryListingLayout } from "@/features/catalog/components/category-listing-route";

export default function Layout({ children }: { children: ReactNode }) {
  return <CategoryListingLayout categoryId="scales">{children}</CategoryListingLayout>;
}
