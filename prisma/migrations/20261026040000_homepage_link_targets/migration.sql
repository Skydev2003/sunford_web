-- Keep existing artwork, timestamps and default destinations intact.
ALTER TABLE "homepage_images"
  ADD COLUMN "targetProductId" TEXT,
  ADD COLUMN "targetPagePath" TEXT;
ALTER TABLE "homepage_images" ADD CONSTRAINT "homepage_images_one_target"
  CHECK ("targetProductId" IS NULL OR "targetPagePath" IS NULL);
