import { SolutionsPage } from "@/features/content/components/solutions-page";
import { mesPaths } from "@/features/content/data/mes-paths";
import { getSolutionMetadata } from "@/features/content/data/solution-details";

export function generateMetadata() {
  return getSolutionMetadata(mesPaths.formulaControl);
}

export default function Page() {
  return <SolutionsPage path={mesPaths.formulaControl} />;
}
