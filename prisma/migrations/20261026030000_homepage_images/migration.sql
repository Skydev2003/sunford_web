-- Independent homepage overrides; no products or existing image files change.
CREATE TABLE "homepage_images" (
  "slot" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "homepage_images_pkey" PRIMARY KEY ("slot")
);
CREATE INDEX "homepage_images_image_idx" ON "homepage_images"("image");
ALTER TABLE "homepage_images" ENABLE ROW LEVEL SECURITY;
-- Access is through authenticated, server-side admin actions only.
