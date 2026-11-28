import { notFound } from "next/navigation";
import { SolutionsPage } from "@/features/content/components/solutions-page";
import { getSolutionMetadata, solutionDetails } from "@/features/content/data/solution-details";

type Props = { params: Promise<{ slug: string }> };

async function solutionPath({ params }: Props) {
  const path = `/solutions/${(await params).slug}`;
  if (!Object.hasOwn(solutionDetails, path)) notFound();
  return path;
}

export function generateStaticParams() {
  return Object.keys(solutionDetails)
    .filter((path) => path.startsWith("/solutions/") && path !== "/solutions/price-label-printing")
    .map((path) => ({ slug: path.split("/").at(-1)! }));
}

export async function generateMetadata(props: Props) {
  return getSolutionMetadata(await solutionPath(props));
}

export default async function Page(props: Props) {
  return <SolutionsPage path={await solutionPath(props)} />;
}
