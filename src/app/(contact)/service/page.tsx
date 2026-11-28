import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactChannels } from "@/features/content/components/contact-page";
import { AfterSalesPage } from "@/features/content/components/after-sales-page";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { SiteLoading } from "@/features/site/components/site-loading";
import SourceContentPage, {
  generateMetadata as getSourceMetadata,
} from "@/app/(site)/[...path]/page";

const pathname = "/service";
const props = { params: Promise.resolve({ path: ["service"] }) };
export const instant = false;
type Props = { searchParams: Promise<{ section?: string | string[] }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const metadata = await getSourceMetadata(props);
  return (await searchParams).section === "contact"
    ? { ...metadata, title: "ติดต่อเรา" }
    : metadata;
}

export default async function ServiceRoute({ searchParams }: Props) {
  const page = (await getContentPageIndex())[pathname];
  if (page?.path === pathname && page.kind === "page" && !page.managed)
    return (
      <AfterSalesPage
        contact={<ContactChannels />}
        initialContact={(await searchParams).section === "contact"}
      />
    );
  return (
    <Suspense fallback={<SiteLoading />}>
      <SourceContentPage {...props} />
    </Suspense>
  );
}
