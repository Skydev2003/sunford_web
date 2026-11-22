import type { Metadata } from "next";
import { categoryApplicationsLink } from "@/features/catalog/data/category-applications";
import { CategoryApplicationsPage } from "../../category-applications-page";

export const instant = false;
export const ensureStatic = "navigation";
export const metadata: Metadata = { title: categoryApplicationsLink("indicators").label };

export default function Page() {
  return <CategoryApplicationsPage categoryId="indicators" />;
}
