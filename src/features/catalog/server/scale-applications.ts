import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getWarehousePool } from "@/features/services/warehouse-postgres";
import { productCardData } from "../data/client-products";
import type { ProductCardData } from "../types";
import { getStorefrontProducts } from "./product-repository";

// Warehouse occupation IDs keep public URLs stable when a display label changes.
const applicationSlugs: Readonly<Record<string, string>> = {
  "15": "mobile-vendors",
  "14": "wholesale-markets",
  "13": "retail-minimarkets",
  "12": "farms-livestock",
  "11": "parcel-shops",
  "10": "laboratory-qc",
  "9": "industrial-factories",
  "8": "food-manufacturing",
  "7": "cafes",
  "6": "bakeries",
  "5": "restaurants",
  "4": "dry-goods-shops",
  "3": "seafood-shops",
  "2": "butcher-shops",
  "1": "produce-shops",
};

type ApplicationRow = {
  occupation_id: string;
  label: string;
  sku: string | null;
  suitability: "suitable" | "conditional" | null;
};

type ScaleApplicationListing = {
  slug: string;
  label: string;
  products: { card: ProductCardData; conditional: boolean }[];
};

type ScaleApplication = {
  slug: string;
  label: string;
  products: { slug: string; name: string; image: string }[];
};

export async function getScaleApplicationListings(): Promise<ScaleApplicationListing[]> {
  "use cache";
  cacheLife({ stale: 30, revalidate: 60, expire: 300 });
  cacheTag("products");

  const [{ rows }, storefront] = await Promise.all([
    getWarehousePool().query<ApplicationRow>(
      `with reviewed_matches as (
        select match.occupation_id, item.item_code::text as sku,
               case when bool_or(match.suitability = 'conditional')
                    then 'conditional' else 'suitable' end as suitability
        from master_data.ai_product_occupations as match
        join master_data.ai_products as product
          on product.id = match.product_id and product.master_company_id = match.master_company_id
        join master_data.master_item as item
          on item.master_item_id = product.master_item_id
         and item.master_company_id = product.master_company_id
        where match.master_company_id = $1::bigint
          and match.review_status = 'ready'
          and match.suitability in ('suitable', 'conditional')
          and product.is_active
        group by match.occupation_id, item.item_code
      )
      select occupation.id::text as occupation_id, occupation.title as label,
             reviewed_matches.sku, reviewed_matches.suitability
      from master_data.ai_occupations as occupation
      left join reviewed_matches on reviewed_matches.occupation_id = occupation.id
      where occupation.master_company_id = $1::bigint and occupation.is_active
      order by occupation.id desc, reviewed_matches.sku`,
      [process.env.WAREHOUSE_COMPANY_ID],
    ),
    getStorefrontProducts(),
  ]);

  const scales = new Map(
    storefront
      .filter(({ category, warehouseSku }) => category === "scales" && warehouseSku)
      .map((product) => [product.warehouseSku, product]),
  );
  const applications = new Map<string, ScaleApplicationListing>();
  for (const row of rows) {
    const slug = applicationSlugs[row.occupation_id] ?? `application-${row.occupation_id}`;
    let application = applications.get(slug);
    if (!application) {
      application = { slug, label: row.label, products: [] };
      applications.set(slug, application);
    }
    const scale = row.sku ? scales.get(row.sku) : undefined;
    if (scale) {
      application.products.push({
        card: productCardData(scale),
        conditional: row.suitability === "conditional",
      });
    }
  }
  return [...applications.values()];
}

export async function getScaleApplications(): Promise<ScaleApplication[]> {
  return (await getScaleApplicationListings()).map(({ slug, label, products }) => ({
    slug,
    label,
    products: products.map(({ card }) => ({
      slug: card.slug,
      name: card.name,
      image: card.image,
    })),
  }));
}
