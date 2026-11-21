import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactPage } from "@/features/content/components/contact-page";
import { getContentPageIndex } from "@/features/content/server/content-repository";
import { SiteLoading } from "@/features/site/components/site-loading";
import SourceContentPage, {
  generateMetadata as getSourceMetadata,
} from "@/app/(site)/[...path]/page";

const pathname = "/contact-us";
const props = { params: Promise.resolve({ path: ["contact-us"] }) };

async function getLegacyContactPage() {
  const page = (await getContentPageIndex())[pathname];
  return page?.path === pathname && page.kind === "page" && !page.managed ? page : undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getLegacyContactPage();
  if (!page) return getSourceMetadata(props);
  return {
    title: page.title,
    description: page.text.replace(/\s+/g, " ").slice(0, 160),
  };
}

export default async function ContactRoute() {
  if (await getLegacyContactPage()) return <ContactPage />;
  return (
    <Suspense fallback={<SiteLoading />}>
      <SourceContentPage {...props} />
    </Suspense>
  );
}
