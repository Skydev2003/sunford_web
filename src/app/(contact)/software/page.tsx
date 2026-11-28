import {
  SoftwareDownloadsPage,
  softwareDownloadsTitle,
  softwareDownloadsDescription,
} from "@/features/content/components/software-downloads-page";

export const metadata = {
  title: softwareDownloadsTitle,
  description: softwareDownloadsDescription,
  alternates: { canonical: "https://sunford-web.vercel.app/software" },
};

export default function Page() {
  return <SoftwareDownloadsPage />;
}
