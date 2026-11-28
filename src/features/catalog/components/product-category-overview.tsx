import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { SiteLoading } from "@/features/site/components/site-loading";
import { catalogPageTitle } from "@/features/site/data/site-menu-labels";
import { productCategoryPath, type ProductCategorySlug } from "../data/category-paths";
import { productCategoryDefinitions } from "../data/mock-categories";
import { AccessoriesOverview } from "./accessories-overview";
import { IndicatorsOverview } from "./indicators-overview";
import { PlatformsOverview } from "./platforms-overview";
import { POSOverview } from "./pos-overview";
import { ScalesOverview } from "./scales-overview";
import type { OverviewRequest } from "../data/catalog-overview-features";
import { getOverviewFeature } from "../server/overview-feature";

const categoryOverviews = {
  scales: ScalesOverview,
  indicators: IndicatorsOverview,
  platforms: PlatformsOverview,
  pos: POSOverview,
  accessories: AccessoriesOverview,
};

export function productCategoryMetadata(
  categoryId: ProductCategorySlug,
  path = productCategoryPath(categoryId),
  titleOverride?: string,
  descriptionOverride?: string,
): Metadata {
  const title =
    titleOverride ??
    catalogPageTitle(
      productCategoryPath(categoryId),
      productCategoryDefinitions.find(({ id }) => id === categoryId)!.label,
    );
  const canonical = `https://sunford-web.vercel.app${path}`;
  const description =
    descriptionOverride ??
    (categoryId === "indicators"
      ? "เลือกอินดิเคเตอร์แท่นชั่ง SUNFORD ตามงานชั่งในโรงงานหรือหน้าร้าน เทียบการกันน้ำและการเชื่อมต่อ พร้อมคู่มือตรวจความเข้ากันได้กับแท่นชั่ง"
      : undefined);
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical },
    openGraph: { title: `${title} | SUNFORD`, description, url: canonical },
  };
}

export function ProductCategoryOverview({
  categoryId,
  searchParams,
}: {
  categoryId: ProductCategorySlug;
  searchParams?: OverviewRequest;
}) {
  return (
    <Suspense fallback={<SiteLoading />}>
      <OverviewFromUrl categoryId={categoryId} searchParams={searchParams} />
    </Suspense>
  );
}

async function OverviewFromUrl({
  categoryId,
  searchParams,
}: {
  categoryId: ProductCategorySlug;
  searchParams?: OverviewRequest;
}) {
  const { feature, type, group } = (await searchParams) ?? {};
  const selection = categoryId === "platforms" ? type : feature;
  return (
    <CachedCategoryOverview
      categoryId={categoryId}
      feature={typeof selection === "string" ? selection : undefined}
      group={typeof group === "string" ? group : undefined}
    />
  );
}

async function CachedCategoryOverview({
  categoryId,
  feature,
  group,
}: {
  categoryId: ProductCategorySlug;
  feature?: string;
  group?: string;
}) {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  const Overview = categoryOverviews[categoryId];
  const overviewFeature = feature
    ? await getOverviewFeature(categoryId, feature, group)
    : undefined;
  return <Overview overviewFeature={overviewFeature} />;
}
