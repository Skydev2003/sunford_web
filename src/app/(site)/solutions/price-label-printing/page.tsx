import type { Metadata } from "next";
import { SolutionsPage } from "@/features/content/components/solutions-page";
import { getSolutionMetadata } from "@/features/content/data/solution-details";

const path = "/solutions/price-label-printing";
export function generateMetadata(): Metadata {
  return getSolutionMetadata(path);
}

export default function RetailPriceLabelPage() {
  return <SolutionsPage path={path} />;
}
