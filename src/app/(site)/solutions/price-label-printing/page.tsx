import type { Metadata } from "next";
import { SolutionsPage } from "@/features/content/components/solutions-page";
import { solutionDetails } from "@/features/content/data/solution-details";

const path = "/solutions/price-label-printing";
const { title, description } = solutionDetails[path];

export const metadata: Metadata = { title, description };

export default function RetailPriceLabelPage() {
  return <SolutionsPage path={path} />;
}
