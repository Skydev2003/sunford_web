import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { SiteFrame } from "@/features/site/components/site-frame";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <SiteFrame>{children}</SiteFrame>
    </Suspense>
  );
}
