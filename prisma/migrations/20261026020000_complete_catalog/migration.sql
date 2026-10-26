-- Additive only: keep every existing product, value, and timestamp intact.
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'laboratory';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'accessories';
ALTER TYPE "ProductCategory" ADD VALUE IF NOT EXISTS 'lifestyle';

ALTER TABLE "products"
  ADD COLUMN "catalogManaged" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deletedAt" TIMESTAMP(3);
