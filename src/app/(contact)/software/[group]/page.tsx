import { notFound } from "next/navigation";
import {
  SoftwareDownloadsPage,
  softwareDownloadsDescription,
} from "@/features/content/components/software-downloads-page";
import { softwareDownloadTopics } from "@/features/content/data/software-downloads";

type Props = { params: Promise<{ group: string }> };

export function generateStaticParams() {
  return Object.keys(softwareDownloadTopics).map((group) => ({ group }));
}

async function getTopic({ params }: Props) {
  const { group } = await params;
  if (!Object.hasOwn(softwareDownloadTopics, group)) notFound();
  return { ...softwareDownloadTopics[group as keyof typeof softwareDownloadTopics], group };
}

export async function generateMetadata(props: Props) {
  const { title, group } = await getTopic(props);
  const canonical = `https://sunford-web.vercel.app/software/${group}`;
  return {
    title,
    description: softwareDownloadsDescription,
    alternates: { canonical },
    openGraph: { title, description: softwareDownloadsDescription, url: canonical },
  };
}

export default async function Page(props: Props) {
  const { title, id } = await getTopic(props);
  return <SoftwareDownloadsPage title={title} groupId={id} />;
}
