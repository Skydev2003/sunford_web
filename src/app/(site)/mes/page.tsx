import { SolutionsPage } from "@/features/content/components/solutions-page";
import { mesPaths } from "@/features/content/data/mes-paths";
import { getSolutionMetadata } from "@/features/content/data/solution-details";

export const metadata = getSolutionMetadata(mesPaths.overview);

export default function MesPage() {
  return <SolutionsPage path={mesPaths.overview} />;
}
