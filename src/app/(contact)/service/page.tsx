import type { Metadata } from "next";
import { Suspense } from "react";
import { AfterSalesPage } from "@/features/content/components/after-sales-page";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { SiteLoading } from "@/features/site/components/site-loading";
import SourceContentPage, {
  generateMetadata as getSourceMetadata,
} from "@/app/(site)/[...path]/page";

const pathname = "/service";
const props = { params: Promise.resolve({ path: ["service"] }) };

export function generateMetadata(): Promise<Metadata> {
  return getSourceMetadata(props);
}

export default async function ServiceRoute() {
  const page = (await getContentPageIndex())[pathname];
  if (page?.path === pathname && page.kind === "page" && !page.managed) return <AfterSalesPage />;
  return (
    <Suspense fallback={<SiteLoading />}>
      <SourceContentPage {...props} />
    </Suspense>
  );
}
