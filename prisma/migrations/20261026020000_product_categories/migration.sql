-- Existing UAT imports already added these values directly to PostgreSQL.
-- IF NOT EXISTS also makes fresh databases match the catalogue without changing products.
ALTER TYPE "public"."ProductCategory" ADD VALUE IF NOT EXISTS 'laboratory';
ALTER TYPE "public"."ProductCategory" ADD VALUE IF NOT EXISTS 'accessories';
ALTER TYPE "public"."ProductCategory" ADD VALUE IF NOT EXISTS 'lifestyle';
