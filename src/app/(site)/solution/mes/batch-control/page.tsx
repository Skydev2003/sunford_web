import type { Metadata } from "next";
import { SolutionsPage } from "@/features/content/components/solutions-page";
import { solutionDetails } from "@/features/content/data/solution-details";

const path = "/solution/mes/batch-control";
const { title, description } = solutionDetails[path];

export const metadata: Metadata = { title, description };

export default function BatchControlPage() {
  return <SolutionsPage path={path} />;
}
